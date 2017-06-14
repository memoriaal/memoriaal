const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')

const BOOKS = {
    "R8-1": {
        "FILENAME": "2010 memento_r_8-1",
        "FIRST_PAGE": 226,
        "LAST_PAGE": 742,
        "page_number_re": /^ {0,140}([0-9]{1,3})$/
    },
    "R4-1": {
        "FILENAME": "2003 memento_r_4",
        "FIRST_PAGE": 587,
        "LAST_PAGE": 639,
        "page_number_re": /^ {0,120}([0-9]{1,3})$/
    },
    "R6-1": { // Laidoneri ja Pätsi perekonnad
        "FILENAME": "2001 memento_r_6",
        "FIRST_PAGE": 358,
        "LAST_PAGE": 358,
        "page_number_re": /^ {0,120}([0-9]{1,3})$/
    },
    "R6-2": { // Küüditatud juunis & juulis 1941
        "FILENAME": "2001 memento_r_6",
        "FIRST_PAGE": 360,
        "LAST_PAGE": 713,
        "page_number_re": /^ {0,120}([0-9]{1,3})$/
    },
}
const BOOKNAME = "R6-2"

const BOOK = BOOKS[BOOKNAME]
const BOOKFILE = BOOK['FILENAME']
const FIRST_PAGE = BOOK.FIRST_PAGE
const LAST_PAGE = BOOK.LAST_PAGE
const PARANDUSED = YAML.load('parandused.yaml')
const FIELDS = YAML.load('fields.yaml')

fs.access(BOOKFILE + '.txt', (err) => {
  if (!err) {
    console.log('readConvertedFile ' + BOOKFILE + '.txt')
    readConvertedFile(BOOKFILE + '.txt')
    return;
  }
  console.log('Convert file ' + BOOKFILE + '.pdf')
  var exec = require('child_process').exec
  var cmd = 'pdftotext "' + BOOKFILE + '.pdf" -nopgbrk -enc UTF-8 -f ' + FIRST_PAGE + ' -l ' + LAST_PAGE + ' -layout'
  exec(cmd, function(error, stdout, stderr) {
    let filename = BOOKFILE + '.txt'
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

  lineReader.on('line', function (line) {
    if (skip_line_after_pagenum) {
      skip_line_after_pagenum = false
      return
    }
    if (line === '') { return }

    let match = BOOK["page_number_re"].exec(line)
    if (match) {
      skip_line_after_pagenum = true
      let page_number = match[1]
      // process.stdout.cursorTo(0)
      // process.stdout.write('page_number: ' + page_number)
      let lines = mergePage(raw_lines)
      pages[page_number] = {n:page_number, lines:lines}
      console.log(page_number)
      lines.forEach((line) => {
        UNPARSED_STREAM.write(line + '\n')
      })
      // console.log(pages[page_number].lines.join("\n"));
      // process.exit(1)
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
  })

}


const mergePage = function(raw_lines) {
  // console.log(JSON.stringify(raw_lines, null, 4))
  function findSplit(raw_lines, log) {
    let positionMap = []
    let positionCount = []
    for (var i = 0; i < 150; i++) {
      positionMap[i] = true
      positionCount[i] = 0
    }
    raw_lines.forEach(function(line) {
      if (log) { console.log(line) }
      let temp = ''
      for (var i = 0; i < line.length; i++) {
        positionMap[i] = positionMap[i] && (line.charAt(i) === ' ' ? true : false)
        positionCount[i] = positionCount[i] + (line.charAt(i) === ' ' ? 0 : 1)
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
        lefthalf.push(match[1].replace(/\s+$/gm,''))
      }
      if (match[2] && match[2].trim().length > 1) {
        righthalf.push(match[2].replace(/\s+$/gm,''))
      }
    }
  })
  // console.log(JSON.stringify(lefthalf.concat(righthalf), null, 4))
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
  // console.log(JSON.stringify(records, null, 4))

  console.log("==========");
  // console.log(records.join("\n"));
  // process.exit(1)
  parseRecords(records)
}



const KIRJED_STREAM = fs.createWriteStream(BOOKNAME + '_kirjed.txt')
const UNPARSED_STREAM = fs.createWriteStream(BOOKNAME + '_parsimata.txt')


var isikud = []
const parseRecords = function(records) {
  console.log('parseRecords');
  let i = 1
  records.forEach(function(record) {
    i++
    // logger.log(record, i)

    PARANDUSED.split.forEach(function(parandus) {
      let re = new RegExp(parandus.f, 'g')
      record = record.replace(re, parandus.t)
    })
    // logger.log(record, i)
    let _records = record.split('\n')
    _records.forEach(function(record) {
      parseRecord(record)
      // logger.log(record, i)
    })
  })
}


const csvWrite = function csvWrite(isik) {
  KIRJED_STREAM.write(
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


const crc32 = require('crc32')

let unmatched = 0
const parseRecord = function(record) {
  let isik = {
    id: crc32(record),
    kirje: record
  }
  logger.log(isik)
  // console.log(isik)

  csvWrite(isik)
}
