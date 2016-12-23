const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')
const BOOK = 'r_1'
const FIRST_PAGE = 78
const LAST_PAGE = 709
const PARANDUSED = YAML.load('parandused.yaml')
const FIELDS = YAML.load('fields.yaml')
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
// console.log(RECORD_PARSER_RE)

fs.access(BOOK + '.txt', (err) => {
  if (!err) {
    readConvertedFile(BOOK + '.txt')
    return;
  }
  var exec = require('child_process').exec
  var cmd = 'pdftotext "' + BOOK + '.pdf" -nopgbrk -enc UTF-8 -f ' + FIRST_PAGE + ' -l ' + LAST_PAGE + ' -layout'
  exec(cmd, function(error, stdout, stderr) {
    let filename = BOOK + '.txt'
    const cleanupConvertedFile = function(filename, callback) {
      fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
          return console.log(err)
        }
        PARANDUSED.global.forEach(function(parandus) {
          let re = new RegExp(parandus.f, 'g')
          data = data.replace(re, parandus.t)
        })
        fs.writeFile(filename, data, 'utf8', function (err) {
           if (err) return console.log(err)
           callback()
        })
      })
    }
    cleanupConvertedFile(filename, function() {
      readConvertedFile(filename)
    })
  })
})


const readConvertedFile = function(filename) {
  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(filename)
  })

  let pages = {}
  let raw_lines = []
  let skip_line_after_pagenum = true
  let page_number_re = /^ {0,120}([0-9]{1,3})$/

  lineReader.on('line', function (line) {
    if (skip_line_after_pagenum) {
      skip_line_after_pagenum = false
      return
    }
    if (line === '') { return }

    let match = page_number_re.exec(line)
    if (match) {
      skip_line_after_pagenum = true
      let page_number = match[1]
      process.stdout.cursorTo(0)
      process.stdout.write('page_number: ' + page_number)
      pages[page_number] = {n:page_number, lines:mergePage(raw_lines)}
      raw_lines = []
      return
    }
    // let page_name_re = /^( {0,120}[A-ZÕÜÄÖŠŽ\-]{3,})$/
    // if (page_name_re.exec(line)) { return }
    raw_lines.push(line)
    return
  })

  lineReader.on('close', function (line) {
    console.log('converted ' + Object.keys(pages).length + ' pages from pdf.')
    readRecords(pages)
    // console.log(isikud.length)
  })

}


const mergePage = function(raw_lines) {

  function findSplit(raw_lines, log) {
    let positionMap = []
    for (var i = 0; i < 150; i++) {
      positionMap[i] = true
    }
    raw_lines.forEach(function(line) {
      if (log) { console.log(line) }
      let temp = ''
      for (var i = 0; i < line.length; i++) {
        positionMap[i] = positionMap[i] && (line.charAt(i) === ' ' ? true : false)
        // console.log(i,line.charAt(i))
        temp = temp + (line.charAt(i) === ' ' ? '+' : '-')
      }
      if (log) { console.log(temp) }
    })
    if (log) { return }
    split_re = /^(\-*)(\+*)(\-*)\+/
    let match = split_re.exec(
      positionMap
        .map(function(n){ return n ? '+' : '-' })
        .join('')
    )
    // In case of pattern mismatch
    if (match[3] === '' || match[2].charAt(0) !== '+') {
      console.log('ERR');
      findSplit(raw_lines, true)
      console.log(positionMap
        .map(function(n){ return n ? '+' : '-' })
        .join(''))
      console.log(match)
      process.exit()
    }
    // console.log(' left:',(match[1].length + 1))
    // leftstream.write(JSON.stringify(positionMap, null, 4));
    // process.exit()
    return {left: match[1].length, split: match[2].length}
  }

  let lefthalf = []
  let righthalf = []
  let split = findSplit(raw_lines)
  let line_split_str = '^(.{1,' + split.left + '}).{0,' + split.split + '}(.*)$'
  let line_split_re = new RegExp(line_split_str)
  raw_lines.forEach(function(line) {
    match = line_split_re.exec(line)
    if (match) {
      if (match[1].trim().length > 1) {
        lefthalf.push((match[1]).trim())
      }
      if (match[2].trim().length > 1) {
        righthalf.push((match[2]).trim())
      }
    }
  })
  return lefthalf.concat(righthalf)
}


const readRecords = function(pages) {

  const joinRows = function(record, line) {
    let re = /[^0-9]-$/
    if (record === '') { return line }
    if (re.test(record)) {
      return record.slice(0, (record.length - 1)) + line
    }
    if (record.charAt(record.length - 1) === '.' && /^[0-9]/.test(line)) {
      return record + line
    }
    re = /[0-9]-$/
    if (re.test(record)) {
      return record + line
    }
    return record + ' ' + line
  }

  let record = ''
  let records = []
  let re = /(]| \.)$/
  Object.keys(pages).forEach(function(ix) {
    pages[ix].lines.forEach(function(line) {
      record = joinRows(record, line)
      if (re.test(line)) {
        record = record.replace( /  +/g, ' ' )
        PARANDUSED.line.forEach(function(parandus) {
          let re = new RegExp(parandus.f, 'g')
          record = record.replace(re, parandus.t)
        })
        // Poolitusmärke eemaldades kadusid sidekriipsud ka liitnimede seest.
        // Convert all CamelCaseStrings to Dash-Separated-Strings
        // re = /([A-ZŠ])([A-ZŠ])([a-z])|([a-z])([A-ZŠ])/g
        // line = line.replace(re, '$1$4-$2$3$5')
        // leftstream.write(record + '\n')
        record = record.split('\n')
        records = records.concat(record)
        record = ''
      }
    })
  })
  parseRecords(records)
}



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


const leftPad = function(i) {
  let pad = "00000"
  return pad.substring(0, pad.length - i.length) + i.toString()
}

var isikud = []
const parseRecords = function(records) {
  console.log('parseRecords');
  let i = 1
  records.forEach(function(record) {
    logger.log(record, i++)

    PARANDUSED.split.forEach(function(parandus) {
      let re = new RegExp(parandus.f, 'g')
      record = record.replace(re, parandus.t)
    })
    let _records = record.split('\n')
    _records.forEach(function(record) {
      parseRecord(record)
    })
  })
}



const crc32 = require('crc32');

const parseRecord = function(record) {
  let isik = {
    id: crc32(record),
    kirje: record
  }
  // console.log(isik)

  let match = RECORD_PARSER_RE.exec(record)
  if (match) {
    FIELDS.forEach(function(field) {
      if (!field.ix) { return }
      if (match[field.ix]) { isik[field.field] = match[field.ix].replace(/^[, ]+|[, ]+$/gm,'')}
    })
    try {
      csvWrite(isik)
    } catch (e) {
      console.log({ isik })
      throw e
    }
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
