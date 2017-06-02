const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')

let csvstream = fs.createWriteStream('isikud.csv')
const csvWrite = function csvWrite(isik) {
  csvstream.write( ''
    +   '"' + ( isik.memento            ? isik.memento             : '' ) + '"'
    + ', "' + ( isik.perenimi           ? isik.perenimi            : '' ) + '"'
    + ', "' + ( isik.eesnimi            ? isik.eesnimi             : '' ) + '"'
    + ', "' + ( isik['sünniaasta']      ? isik['sünniaasta']       : '0000' ) + '"'
    + ', "' + ( isik.kasHukkunud        ? isik.kasHukkunud         : 0  ) + '"'
    + ', "' + ( isik.rviidad            ? isik.rviidad             : '' ) + '"'
    + ', "' + ( isik.kasutamataKirjeosa ? isik.kasutamataKirjeosa  : '' ) + '"'
    + ', "' + ( isik.kirje              ? isik.kirje               : '' ) + '"'
    + '\n'
  )
}
csvWrite({
  memento: 'memento',
  perenimi: 'perenimi',
  eesnimi: 'eesnimi',
  sünniaasta: 'sünniaasta',
  kasHukkunud: 'kasHukkunud',
  rviidad: 'rviidad',
  kasutamataKirjeosa: 'kasutamataKirjeosa',
  kirje: 'kirje'
})


const leftPad = function(i) {
  let pad = "00000"
  return pad.substring(0, pad.length - i.length) + i.toString()
}


var isikud = []

// var exec = require('child_process').exec
// var cmd = 'pdftotext r4-6.pdf -nopgbrk -enc UTF-8'
// exec(cmd, function(error, stdout, stderr) {
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('r4-6.txt')
  })

  lineReader.on('line', function (line) {
    parse_line(line)
  })

  lineReader.on('close', function (line) {
    console.log('finished')
    console.log(isikud.length)
  })

// })

var parandused = YAML.load('parandused.yaml')

const parse_line = function(line) {
  if (line === '') { return }
  if (line.length === 1) { return }

  let re = /^[0-9]*$/
  let match = re.exec(line)
  if (match) { return }

  re = /^6. CONVERGED NAME REGISTER R4–R5 ?/
  line = line.replace(re, '')
  re = /^6. NIMEDE KOONDREGISTER R4–R5 ?/
  line = line.replace(re, '')

  parandused.forEach(function(parandus) {
    line = line.replace(parandus.f, parandus.t)
  })

  // Poolitusmärke eemaldades kadusid sidekriipsud ka liitnimede seest.
  // Convert all CamelCaseStrings to Dash-Separated-Strings
  re = /([A-ZŠ])([A-ZŠ])([a-z])|([a-z])([A-ZŠ])/g
  line = line.replace(re, '$1$4-$2$3$5')


  re = /\b([0-9]{1,5}\. )/g
  let linea = line.replace(re, '\n$1').split('\n')
  linea.shift()
  linea.forEach(function(record) {
    parse_record(record.trim())
  })
  // setTimeout(function () { process.exit(1) }, 1);
}

const parse_record = function(record) {
  record = record.replace('. ? ', ', 0000')
  record = record.replace(/^[, ]+|[, ]+$/gm,'')

  // Split records without numbers that are appended
  if (record.split(/ ?† /).length > 1) {
    // console.log('SPLIT1: ' + record);
    let a = record.split(/ ?† /)
    record = a.shift() + ' †'
    let next_r = a.join(' † ').replace(/^[, ]+|[, ]+$/gm,'')
    if (next_r === 'FOOOOO') {
      console.log(record);
    }
    parse_record(next_r)
  }
  let re = /(,? R[0-9\-]+(?:,? ?R[0-9\-]+)*(?:, ?†)?)(.*)$/
  let match = re.exec(record)
  if (match === null || match.length != 3) {
    console.log({E: 'ERROR', R:record, M:match})
    return
    // process.exit(1)
  }
  if (match[2] !== '') {
    // console.log({R:record, M:match})
    let next_r = match[2].replace(/^[, ]+|[, ]+$/gm,'')
    if (next_r === '†') {
      console.log(record);
    }
    parse_record(next_r)
    record = record.slice(0, match.index) + match[1]
  }

  let isik = { kirje: record, kasutamataKirjeosa: record }

  // memento
  ;((isik) => {
    let re = /^([0-9]{1,5})\. /
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['memento'] = (match[1] === '0' ? '' : 'r4-' + leftPad(match[1]))
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '')
    }
  })(isik)

  // kasHukkunud
  ;((isik) => {
    let re = /, ?†$/
    let match = re.exec(isik.kasutamataKirjeosa)
    isik['kasHukkunud'] = match ? 1 : 0
    if (match !== null) {
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '')
    }
  })(isik)

  // R-viidad
  ;((isik) => {
    let re = /,? (R[0-9\-]+(?:, ?R[0-9\-]+)*)/g
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['rviidad'] = match[1].replace(', ', ',')
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '')
    }
  })(isik)

  // Nimi, sünniaasta
  ;((isik) => {
    let re = /^([^ ]+) ([^,]*), ?([0-9]{2,4})(.*)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['perenimi'] = match[1].trim()
      isik['eesnimi'] = match[2].trim()
      isik['sünniaasta'] = (match[3] === '?' ? '0000' : match[3])
      isik.kasutamataKirjeosa = match[4].replace(/^[, ]+|[, ]+$/gm,'')
    }
  })(isik)

  csvWrite(isik)
  isikud.push(isik)
}
