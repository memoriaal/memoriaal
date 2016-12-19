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
    + ', "' + ( isik['altSünd']         ? isik['altSünd']          : '' ) + '"'
    + ', "' + ( isik.kasHukkunud        ? isik.kasHukkunud         : 0  ) + '"'
    + ', "' + ( isik.rviidad            ? isik.rviidad             : '' ) + '"'
    + ', "' + ( isik.kasutamataKirjeosa ? isik.kasutamataKirjeosa  : '' ) + '"'
    + ', "' + ( isik.kirje              ? isik.kirje               : '' ) + '"'
    + ','   + ( isik.mviide             ? ' "' + isik.mviide.join(',') + '"' : '' ) + ''
    + '\n'
  )
}
csvWrite({
  memento: 'memento',
  perenimi: 'perenimi',
  eesnimi: 'eesnimi',
  sünniaasta: 'sünniaasta',
  altSünd: 'altSünd',
  kasHukkunud: 'kasHukkunud',
  rviidad: 'rviidad',
  kasutamataKirjeosa: 'kasutamataKirjeosa',
  kirje: 'kirje',
  mviide: ['mviide']
})


const leftPad = function(i) {
  let pad = "00000"
  return pad.substring(0, pad.length - i.length) + i.toString()
}


var isikud = []

// var exec = require('child_process').exec
// var cmd = 'pdftotext r7.pdf -nopgbrk -enc UTF-8'
// exec(cmd, function(error, stdout, stderr) {
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('r7.txt')
  })

  lineReader.on('line', function (line) {
    parse_line(line)
  })

  lineReader.on('close', function (line) {
    console.log('finished')
    console.log(isikud.length)
    post_process(isikud)
  })

// })

var parandused = YAML.load('parandused.yaml')

const parse_line = function(line) {
  if (line === '') { return }
  if (line.length === 1) { return }

  let re = /^[0-9]*$/
  let match = re.exec(line)
  if (match) { return }

  re = /^5 CONVERGED NAME REGISTER R1-R6 ?/
  line = line.replace(re, '')
  re = /^5. NIMEDE KOONDREGISTER R1-R6 ?/
  line = line.replace(re, '')
  // Poolitusmärke eemaldades kadusid sidekriipsud ka liitnimede seest.
  // Convert all CamelCaseStrings to Dash-Separated-Strings
  re = /([A-ZŠ])([A-ZŠ])([a-z])|([a-z])([A-ZŠ])/g
  line = line.replace(re, '$1$4-$2$3$5')
  parandused.forEach(function(parandus) {
    line = line.replace(parandus.f, parandus.t)
  })

  // line = line.replace('ŽukovVeseltšak', 'Žukov-Veseltšak')

  re = /\b([0-9]{1,5}\. )/g
  let linea = line.replace(re, '\n$1').split('\n')
  linea.shift()
  linea.forEach(function(record) {
    parse_record(record.trim())
  })
  // setTimeout(function () { process.exit(1) }, 1);
}

const parse_record = function(record) {
  record = record.replace('?!', '0000')
  record = record.replace(/^[, ]+|[, ]+$/gm,'')
  record = record.replace(', sünd. 1', ', sünd 1')
  record = record.replace(' s ka 1', ', sünd 1')

  // Split records without numbers that are appended
  if (record.split(/ ?† /).length > 1) {
    // console.log('SPLIT1: ' + record);
    let a = record.split(/ ?† /)
    record = a.shift() + ' †'
    let next_r = '0. ' + a.join(' † ').replace(/^[, ]+|[, ]+$/gm,'')
    // if (next_r === '0. R5, †') {
    //   console.log(record);
    // }
    parse_record(next_r)
  }
  let re = /(,? R[0-9\-]+(?:, ?R[0-9\-]+)*(?:, ?†)?)(.*)$/
  let match = re.exec(record)
  if (match === null || match.length != 3) {
    console.log({E: 'ERROR', R:record, M:match})
    process.exit(1)
  }
  if (match[2] !== '') {
    // console.log({R:record, M:match})
    let next_r = '0. ' + match[2].replace(/^[, ]+|[, ]+$/gm,'')
    // if (next_r === '0. R5, †') {
    //   console.log(record);
    // }
    parse_record(next_r)
    record = record.slice(0, match.index) + match[1]
  }

  let isik = { kirje: record, kasutamataKirjeosa: record }

  // memento
  ;((isik) => {
    let re = /^([0-9]{1,5})\. /
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['memento'] = (match[1] === '0' ? '' : 'r7-' + leftPad(match[1]))
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
    let re = /^([^,]+), ?([^,]*), ?([0-9]{2,4}|\?)(.*)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['perenimi'] = match[1].trim()
      isik['eesnimi'] = match[2].trim()
      isik['sünniaasta'] = (match[3] === '?' ? '0000' : match[3])
      isik.kasutamataKirjeosa = match[4].replace(/^[, ]+|[, ]+$/gm,'')
    }
  })(isik)

  // Sünd - alternatiivne sünniinfo
  ;((isik) => {
    let re = /(?:sünd ([0-9]{1,4}))/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['altSünd'] = match[1]
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '').replace(/^[, ]+|[, ]+$/gm,'')
    }
  })(isik)

  isikud.push(isik)
}

const post_process = function(isikud) {
  let viiteid = 0
  let lahendatud_viiteid = 0
  let pass1 = true
  let pass2 = true
  isikud
  // Filtreerin välja viitavad isikukirjed
  .filter(function(isik){
    let re = /^vt /
    let match = re.exec(isik.kasutamataKirjeosa)
    return (match === null ? false : true)
  })

  // Lingin kokku, kus klapib "vt " ja teisalt "ka "
  // Ülejäänud saadan edasi
  .filter(function(i1){
    viiteid ++
    i1.mviide = []
    let linked = false
    let q1 = i1.kasutamataKirjeosa
    isikud.some(function(i2){
      if (i2.memento === '') { return false }
      if (i2.kasutamataKirjeosa === '') { return false }
      let q2 = i2.kasutamataKirjeosa
      if (q1.indexOf(i2.eesnimi) !== -1
      && q1.indexOf(i2.perenimi) !== -1
      && q2.indexOf(i1.eesnimi) !== -1
      && q2.indexOf(i1.perenimi) !== -1) {
        lahendatud_viiteid ++
        linked = true
        i1.mviide.push(i2.memento)
        return true // break out of isikud.some()
      }
    })
    return !linked
  })

  // Lingin kokku, kus "vt " klapib ja klapivad ka sünniaastad
  .filter(function(i1){
    if (pass1) {
      console.log('Kokku viiteid:', viiteid)
      console.log('Esimesel ringil seotud viiteid:', lahendatud_viiteid)
      pass1 = false
    }
    let linked = false
    let a = i1['sünniaasta'] ? i1['sünniaasta'] : false
    if (!a || a === '0000') { return true } // Vaatlen järgmisel ringil
    let q1 = i1.kasutamataKirjeosa
    isikud.some(function(i2){
      if (i2.memento === '') { return false }
      if (q1.indexOf(i2.eesnimi) !== -1
      && q1.indexOf(i2.perenimi) !== -1
      && a
      && a !== '0000'
      && (a === i2['sünniaasta'] || a === i2['altSünd']) ) {
        lahendatud_viiteid ++
        linked = true
        i1.mviide.push(i2.memento)
        return true // break out of isikud.some()
      }
    })
    return !linked
  })

  // Lingin kokku, kus "vt " klapib ja viidataval on kasutamataKirjeosa "ka "
  .filter(function(i1){
    if (pass2) {
      console.log('Peale teist ringi on seotud viiteid:', lahendatud_viiteid)
      pass2 = false
    }
    let linked = false
    let q1 = i1.kasutamataKirjeosa
    isikud.some(function(i2){
      if (i2.memento === '') { return false }
      if (i2.kasutamataKirjeosa === '') { return false }
      let q2 = i2.kasutamataKirjeosa
      if (q2.indexOf('ka ') === -1) { return false }
      if (q1.indexOf(i2.eesnimi) !== -1
      && q1.indexOf(i2.perenimi) !== -1 ) {
        lahendatud_viiteid ++
        linked = true
        i1.mviide.push(i2.memento)
        return true // break out of isikud.some()
      }
    })
    return !linked
  })

  // miskit jäi üle ka
  .forEach(function(i1) {
    console.log(i1)
  })

  console.log('viiteid ' + lahendatud_viiteid + '/' + viiteid);
  isikud.forEach(function(isik){
    csvWrite(isik)
  })
}
