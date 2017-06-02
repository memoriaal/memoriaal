const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')
const BOOK = 'r_6'
const SECTIONS = [
  { section: "1", first_page: 358, last_page: 358, csvstream: fs.createWriteStream('isikud_r6_1.csv') },
  { section: "2", first_page: 360, last_page: 713, csvstream: fs.createWriteStream('isikud_r6_2.csv') },
  { section: "3", first_page: 780, last_page: 796, csvstream: fs.createWriteStream('isikud_r6_3.csv') },
  { section: "4", first_page: 807, last_page: 856, csvstream: fs.createWriteStream('isikud_r6_4.csv') },
  { section: "5", first_page: 872, last_page: 881, csvstream: fs.createWriteStream('isikud_r6_5.csv') }
]
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

SECTIONS.forEach(function(section) {
  let section_filename = BOOK + '.' + section.section + '.txt'
  fs.access(section_filename, (err) => {
    if (!err) {
      readConvertedFile(section, section_filename)
      return
    }
    var exec = require('child_process').exec
    var cmd = 'pdftotext -nopgbrk -enc UTF-8 -f ' + section.first_page + ' -l ' + section.last_page + ' -layout "' + BOOK + '.pdf" ' + section_filename
    exec(cmd, function(error, stdout, stderr) {
      const cleanupConvertedFile = function(section_filename, callback) {
        fs.readFile(section_filename, 'utf8', function (err, data) {
          if (err) {
            return console.log(err)
          }
          PARANDUSED.global.forEach(function(parandus) {
            let re = new RegExp(parandus.f, 'g')
            data = data.replace(re, parandus.t)
          })
          fs.writeFile(section_filename, data, 'utf8', function (err) {
             if (err) return console.log(err)
             callback()
          })
        })
      }
      cleanupConvertedFile(section_filename, function() {
        readConvertedFile(section, section_filename)
      })
    })
  })
})


const readConvertedFile = function(section, filename) {
  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(filename)
  })

  let pages = {}
  let raw_lines = []
  let skip_line_after_pagenum = true
  let page_number_re = /^ {0,125}([0-9]{1,3})$/

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
    readRecords(section, pages)
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
    // if (match[3] === '' || match[2].charAt(0) !== '+') {
    //   console.log('ERR');
    //   findSplit(raw_lines, true)
    //   console.log(positionMap
    //     .map(function(n){ return n ? '+' : '-' })
    //     .join(''))
    //   console.log(match)
    //   process.exit()
    // }
    // console.log(' left:',(match[1].length + 1))
    // console.log(JSON.stringify(positionMap, null, 4));
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
      if (match[2] && match[2].trim().length > 1) {
        righthalf.push((match[2]).trim())
      }
    }
  })
  return lefthalf.concat(righthalf)
}


const readRecords = function(section, pages) {

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
  parseRecords(section, records)
}


var isikud = []
const parseRecords = function(section, records) {
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
      parseRecord(section, record)
    })
  })
}


const csvWrite = function csvWrite(section, isik) {
  section.csvstream.write(
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
SECTIONS.forEach(function(section) {
  csvWrite(section, labels)
})

const crc32 = require('crc32');

const parseRecord = function(section, record) {
  let isik = {
    id: crc32(record),
    kirje: record,
    memento: 'R6.' + section.section
  }
  // console.log(isik)

  let match = RECORD_PARSER_RE.exec(record)
  if (match) {
    FIELDS.forEach(function(field) {
      if (!field.ix) { return }
      if (match[field.ix]) { isik[field.field] = match[field.ix].replace(/^[, ]+|[, ]+$/gm,'')}
    })
    try {
      csvWrite(section, isik)
    } catch (e) {
      console.log({ isik })
      throw e
    }
  }

  return
}
