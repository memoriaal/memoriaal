const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
const crc32 = require('crc32');
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')
const BOOK = 'r81'
const SECTIONS = [
  { section: "1", columns: 2, first_page: 226, last_page: 742, csvstream: fs.createWriteStream('isikud_r8_1.csv') }
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
  let page_number_re = /^ {0,140}([0-9]{1,3})$/

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
      process.stdout.write('page_number: ' + page_number + '. ')
      pages[page_number] = {n:page_number, lines:mergePage(section, raw_lines)}
      raw_lines = []
      return
    }
    // let page_name_re = /^( {0,120}[A-ZÕÜÄÖŠŽ\-]{3,})$/
    // if (page_name_re.exec(line)) { return }
    // console.log(line)
    raw_lines.push(line)
    return
  })

  lineReader.on('close', function (line) {
    console.log('\nconverted ' + Object.keys(pages).length + ' pages from pdf.')
    readRecords(section, pages)
    // console.log(isikud.length)
  })

}


const mergePage = function(section, raw_lines) {
  function findSplit(raw_lines, log) {
    // console.log(raw_lines);
    let positionMap = []
    for (var i = 0; i < 150; i++) {
      positionMap[i] = true
    }
    // log = true;
    raw_lines.forEach(function(line) {
      if (log) { console.log(line) }
      let temp = ''
      for (var i = 0; i < line.length; i++) {
        let is_space = (line.charAt(i) === ' ')
        positionMap[i] = positionMap[i] && is_space
        // console.log(i,line.charAt(i))
        temp = temp + (is_space ? '+' : '-')
      }
      if (log) { console.log(temp) }
    })
    if (log) { return }
    let prev_char_was_space = false
    let seq_len = 0
    let ret_a = []
    let ret_re = '^'
    positionMap.forEach( function(c) {
      if (c === prev_char_was_space) {
        seq_len ++
      } else {
        ret_a.push(seq_len)
        prev_char_was_space = c
        seq_len = 1
      }
    })
    for (var i = 0; i < ret_a.length-2; i=i+2) {
      ret_re = ret_re + '(.{0,' + ret_a[i] + '})'
                      + '(?:.{' + ret_a[i+1] + '})?'
    }
    return ret_re + '(.*)?$'
  }

  let lefthalf = []
  let righthalf = []
  let line_split_str = findSplit(raw_lines)
  // console.log(1, line_split_str)
  let line_split_re = new RegExp(line_split_str)
  raw_lines.forEach(function(line) {
    // console.log(2, line)
    match = line_split_re.exec(line)
    if (match) {
      // console.log('2M', match)
      if (match[1].trim().length > 1) {
        // console.log('2L', match[1].trim())
        lefthalf.push((match[1]).trim())
      }
      if (match[2] && match[2].trim().length > 1) {
        // console.log('2R', match[2].trim())
        righthalf.push((match[2]).trim())
      }
    }
    // console.log(line, match)
  })
  return lefthalf.concat(righthalf)
}


const readRecords = function(section, pages) {

  const joinRows = function(record, line) {
    if (record === '') { return line }

    // Kirje poolitatud keset allikaviidet
    //     ... agitatsioon. (10) [R2
    //     PC 28402]
    if (/\[[^\]]*$/.test(record)) {
      // console.log();
      // console.log(1, record);
      // console.log(2, line);
      return record + line
    }
    if (/^(ANSV|ÜK |NKVD|EV |RK,|TPI-s)/.test(line)) {
      return record + line
    }

    if (line.slice(0,2).toUpperCase() === line.slice(0,2)) {
      // console.log();
      // console.log(21, record);
      // console.log(22, line);
    }
    if (/^[A-ZÕÜÄÖŠŽ]{2}/.test(line)) {
      console.log();
      console.log(31, record);
      console.log(32, line);
      process.exit(1)
    }
    // Kui kirje lõpeb sidekriipsuga, siis liidan read;
    //   sidekriipsu säilitan vaid siis, kui uus rida algab suurtähega
    let re = /[^0-9]-$/
    if (re.test(record)) {
      if (line.slice(0,1).toUpperCase() === line.slice(0,1)) {
        return record + line
      } else {
        return record.slice(0, (record.length - 1)) + line
      }
    }
    // Kirje lõpeb punktiga ja uus rida algab numbriga
    //     ... vab. asum.
    //     17.07.56
    if (record.charAt(record.length - 1) === '.' && /^[0-9]/.test(line)) {
      return record + line
    }
    // Kirje lõpeb numbri ja sidekriipsuga; liidan read
    //     ... trib. 15.02.45, §58-1a, 58-
    //     11, 10+5a.
    re = /[0-9]-$/
    if (re.test(record)) {
      return record + line
    }
    return record + ' ' + line
  }

  let record = ''
  let records = []
  let eol_re = /(]$)/
  Object.keys(pages).forEach(function(ix) {
    // console.log('ix:',pages[ix].lines);
    pages[ix].lines.forEach(function(line) {
      console.log('"' + line + '"');
      if (/^ *$/.test(line)) {
        return
      }
      record = joinRows(record, line)
      if (eol_re.test(line)) {
        record = record.replace( /  +/g, ' ' )
        PARANDUSED.record.forEach(function(parandus) {
          let re = new RegExp(parandus.f, 'g')
          record = record.replace(re, parandus.t)
        })
        // Poolitusmärke eemaldades kadusid sidekriipsud ka liitnimede seest.
        // Convert all CamelCaseStrings to Dash-Separated-Strings
        // re = /([A-ZŠ])([A-ZŠ])([a-z])|([a-z])([A-ZŠ])/g
        // line = line.replace(re, '$1$4-$2$3$5')
        // leftstream.write(record + '\n')
        // record = record.split('\n')
        // records = records.concat(record)
        records.push(record)
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
    logger.log('@'+record, crc32(record))

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


const parseRecord = function(section, record) {
  let isik = {
    id: crc32(record),
    kirje: record,
    memento: 'R8.' + section.section
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
