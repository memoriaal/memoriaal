// This version reads and converts PDF page by page

const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')
const BOOK = 'r_6'
const SECTIONS = [
  { section: "1", first_page: 358, last_page: 358, csvstream: fs.createWriteStream('isikud_r6_1.csv') },
  // { section: "2", first_page: 360, last_page: 713, csvstream: fs.createWriteStream('isikud_r6_2.csv') },
  // { section: "3", first_page: 780, last_page: 796, csvstream: fs.createWriteStream('isikud_r6_3.csv') },
  // { section: "4", first_page: 807, last_page: 856, csvstream: fs.createWriteStream('isikud_r6_4.csv') },
  // { section: "5", first_page: 872, last_page: 881, csvstream: fs.createWriteStream('isikud_r6_5.csv') }
]

let pages = []
let lines = []
SECTIONS.forEach( (s) => { pages[s.section] = [] })


async.eachSeries(SECTIONS, (section, callback) => {
  let pn_arr = []
  for (var page_number = section.first_page; page_number <= section.last_page; page_number++) {
    pn_arr.push(page_number)
  }
  async.eachSeries(pn_arr, (page_number, callback) => {
    // console.log('Page ' + section.section + '.' + page_number + ' from PDF');
    let converted_page_filename = path.resolve(
      __dirname,
      'pages',
      'converted',
      + section.section + '.' + page_number + '.txt'
    )
    fs.access(converted_page_filename, (err) => {
      if (!err) {
        unsplitConvertedPage(section, converted_page_filename, (err) => {
          return callback(err)
        })
        return
      }
      // console.log('Convert page ' + section.section + '.' + page_number + ' from PDF');
      var exec = require('child_process').exec
      var cmd = 'pdftotext -nopgbrk -enc UTF-8'
      + ' -f ' + page_number
      + ' -l ' + page_number
      + ' -layout "' + BOOK + '.pdf" "' + converted_page_filename + '"'
      // console.log(cmd);
      exec(cmd, function(error, stdout, stderr) {
        if (error | stderr | stdout) {
          // console.error(error);
          // console.error(stderr);
          // console.error(stdout);
          return callback(null)
        }
        unsplitConvertedPage(section, converted_page_filename, (err) => {
          return callback(err)
        })
        return
      })
    })
  }, function done() {
    // console.log('END section ' + section.section)
    callback(null)
  } )
}, function done() {
  lines.forEach((line) => {console.log(line)})
  // console.log('ENDZ converting and unsplitting')
})



const unsplitConvertedPage = function(section, converted_page_filename, callback) {
  let page_number = path.basename(converted_page_filename).split('.')[1]
  let unsplitted_page_filename = path.resolve(
    __dirname,
    'pages',
    'unsplit',
    section.section + '.' + page_number + '.txt'
  )
  // console.log('Unsplitting from ' + converted_page_filename + ' to ' + unsplitted_page_filename)

  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(converted_page_filename)
  })

  let raw_lines = []
  let is_first_line = true
  let page_number_re = /^ {0,125}([0-9]{1,3})$/

  lineReader.on('line', function (line) {
    if (is_first_line) {
      is_first_line = false
      return
    }
    else if (line === '') { 
      return 
    }
    else if (page_number_re.exec(line)) {
      pages[section.section][page_number] = mergePage(raw_lines)
      return
    }
    else {
      raw_lines.push(line)
      return
    }
  })

  lineReader.on('close', function (line) {
    // console.log('unsplitted page ' + section.section + '.' + page_number + '.')
    return callback(null)
    // readRecords(section, pages)
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
        lefthalf.push((match[1]))
      }
      if (match[2] && match[2].trim().length > 1) {
        righthalf.push((match[2]))
      }
    }
  })
  let page = lefthalf.concat(righthalf)
  page.forEach((line) => {
    lines.push(line)
  })
  return page
}
