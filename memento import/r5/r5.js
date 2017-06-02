const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')
const FIELDS = YAML.load('r_5_fields.yaml')
const RECORD_PARSER_RE = new RegExp(
  "^" + FIELDS
    .filter(function(field) { return field.re && field.ix })
    .sort(function(a, b) {
      return a.ix - b.ix
    })
    .reduce(function(re, field) {
      if (typeof(re) === 'object') { re = re.re }
      return re + field.re
    }) + "$"
)

var record_cnt = 0
const lineReader = require('readline').createInterface({
  input: fs.createReadStream('r5records.txt')
})
lineReader.on('line', function (record) {
  record_cnt ++
  parseRecord(record)
  return
})
lineReader.on('close', function (line) {
  console.log('Read ' + record_cnt + ' records.')
})


const CSVSTREAM = fs.createWriteStream('isikud.csv')
const csvWrite = function csvWrite(isik) {
  CSVSTREAM.write(
    FIELDS
      .map(function(field) {
        let ret_val = isik[field['field']] ? isik[field['field']] : field['default']
        try {
          return '"' + ret_val.replace(/"/g, '""') + '"'
        } catch (e) {
          console.log({ isik:isik, field:field, ret_val:ret_val })
          throw e
        }
      })
      .join(', ') + '\n'
  )
}

let labels = {}
FIELDS.forEach(function(field) {
  labels[field.field] = field.label
})
csvWrite(labels)


const crc32 = require('crc32');

let perekonnaId = ''
const parseRecord = function(record) {
  let isik = {
    id: '',
    kirje: record
  }
  // console.log(isik)

  let match = RECORD_PARSER_RE.exec(record)
  if (match) {
    FIELDS.forEach(function(field) {
      if (!field.ix) { return }
      if (match[field.ix]) {
        isik[field.field] = match[field.ix].replace(/^[, ]+|[, ]+$/gm,'')
      }
    })
    isik.kirje = isik.kirje.replace(/</g, '').replace(/>/g, '')
    let id = crc32(isik.kirje)
    if (isik.perenimi.toUpperCase() === isik.perenimi) {
      perekonnaId = id
    }
    isik.id = perekonnaId + '.' + id

    try {
      csvWrite(isik)
    } catch (e) {
      console.log({ isik })
      throw e
    }
  } else {
    console.log('cant match', RECORD_PARSER_RE, record);
  }

  return

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
  // let re = /(,? R[0-9\-]+(?:,? ?R[0-9\-]+)*(?:, ?†)?)(.*)$/
  // let match = re.exec(record)
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

  // let isik = { kirje: record, kasutamataKirjeosa: record }

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
