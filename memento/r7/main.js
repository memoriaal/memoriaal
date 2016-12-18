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
    + ', "' + ( isik['sünd']            ? isik['sünd']             : '0000' ) + '"'
    + ', "' + ( isik.kasHukkunud        ? 1                        : 0  ) + '"'
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
  sünd: 'sünd',
  kasHukkunud: 'kasHukkunud',
  rviidad: 'rviidad',
  kasutamataKirjeosa: 'kasutamataKirjeosa',
  kirje: 'kirje'
})


const leftPad = function(i) {
  let pad = "00000"
  return pad.substring(0, pad.length - i.length) + i.toString()
}


var exec = require('child_process').exec;
var cmd = 'pdftotext r7.pdf -nopgbrk -enc UTF-8';

// exec(cmd, function(error, stdout, stderr) {
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('r7.txt')
  })

  lineReader.on('line', function (line) {
    parse_line(line)
  })
// })

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
  line = line.replace('¸', ', ')
  line = line.replace('\\', '')
  line = line.replace('. †', ', †')
  line = line.replace('R1 †', 'R1, †')
  line = line.replace('R2 †', 'R2, †')
  line = line.replace('R3 †', 'R3, †')
  line = line.replace('R1.R3', 'R1,R3')
  line = line.replace('R6_2', 'R6-2')
  line = line.replace('?!', '0000')

  re = /\b([0-9]{1,5}\. )/g
  let linea = line.replace(re, '\n$1').split('\n')
  linea.shift()
  linea.forEach(function(record) {
    parse_record(record.trim())
  })
  // setTimeout(function () { process.exit(1) }, 1);
}

const parse_record = function(record) {
  record = record.replace(/^,+|,+$/gm,'')

  // Split records without numbers that are appended
  if (record.split(/ ?† /).length > 1) {
    // console.log('SPLIT1: ' + record);
    let a = record.split(/ ?† /)
    record = a.shift() + ' †'
    parse_record('0. ' + a.join(' † '))
  }
  let re = /(,? R[0-9\-]+(?:, ?R[0-9\-]+)*(?:, ?†)?)(.*)$/
  let match = re.exec(record)
  if (match === null || match.length != 3) {
    console.log({E: 'ERROR', R:record, M:match})
    process.exit(1)
  }
  if (match[2] !== '') {
    // console.log({R:record, M:match})
    record = record.slice(0, match.index) + match[1]
    parse_record('0. ' + match[2])
  }

  let isik = { kirje: record, kasutamataKirjeosa: record }

  // memento
  ;((isik) => {
    let re = /^([0-9]{1,5})\. /
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['memento'] = 'r7-' + leftPad(match[1])
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

  // Nimi, sünd
  ;((isik) => {
    let re = /^([^,]+), ?([^,]*), ?([0-9]{2,4})(.*)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['perenimi'] = match[1]
      isik['eesnimi'] = match[2]
      isik['sünd'] = match[3]
      isik.kasutamataKirjeosa = match[4]
    }
  })(isik)

  csvWrite(isik)
}

var isikud = []

// var perekond = isikud[0].memento
isikud.forEach(function(isik) {
  isik.kasutamataKirjeosa = '@NIMI@ ' + String(isik.kirje)
  isik.kirje = isik.nimi + ' ' + String(isik.kirje)

  let perenimi = isik.nimi.split(',')[0]
  if (perenimi === perenimi.toUpperCase()) {
    perekond = isik.memento
  }
  isik.perekond = perekond

  // Sugulus
  if (isik.perekond === isik.memento) {
    isik.sugulus = 'perekonnapea'
  } else {
    sugulused.forEach(function(sugulus) {
      let re = new RegExp('[ ,]' + sugulus + '[ ,]','')
      if (re.test(isik.kasutamataKirjeosa)) {
        isik.sugulus = sugulus
        isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, ' @SUGULUS@ ')
      }
    })
  }

  // Rahvus
  rahvused.forEach(function(rahvus) {
    let re = new RegExp('[ ,]' + rahvus + '[ ,]','')
    if (re.test(isik.kasutamataKirjeosa)) {
      isik.rahvus = rahvus.toLowerCase()
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, ' @RAHVUS@ ')
    }
  })

  // mitte küüditatud
  ;((isik) => {
    let re = /(mitte küüditatud|küüditamata)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['mitte küüditatud'] = '+'
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@MITTEKÜÜDITATUD@')
    }
    isik.kasMitteküüditatud = match ? "1" : "0"
  })(isik)

  // saatus teadmata
  ;((isik) => {
    let re = /\b[a-zA-Z]*(ine saatus teadmata|aatus teadmata)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@SAATUSTEADMATA@')
    }
    isik.kasSaatusTeadmata = match ? "1" : "0"
  })(isik)

  // surmaotsus
  ;((isik) => {
    let re = /([Ss]urmaotsus\.?)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['surmaotsus'] = '+'
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@SURMAOTSUS@')
    }
  })(isik)

  // Sünd
  ;((isik) => {
    let re = /\b[Ss]\. ([0-9\.]*)/
    let match = re.exec(isik.kasutamataKirjeosa)
    isik['sünniaasta'] = match ? guessDate(match[1])[0].slice(0,4) : '0000'
    if (match !== null) {
      isik['sünd'] = guessDate(match[1])[0]
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@SÜND@')
    }
  })(isik)

  // Hukkunud isikud
  ;((isik) => {
    let re = /(((otsus t(ä|a\u0308)ide viidud|m[õõ]rv[a\.]|\b[Ss]urn|\b[Ss]uri\b|tapetud)[a-zA-ZÕÜÄÖõüäö \-\.]*)([\.0123456789]*))/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      // hukkunud.push(isik)
      isik.hukkunud = guessDate(match[5])[0]
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@HUKKUNUD@')
    }
    isik.kasHukkunud = isik.hukkunud ? "1" : "0"
  })(isik)

  // Küüditamised
  ;((isik) => {
    // paraku saab ü tähte esitada enam kui ühel moel
    let re = /(k(ü|u\u0308){1,2}dit(\.|ati)) +([\.0123456789]*)/g
    while (match = re.exec(isik.kasutamataKirjeosa)) {
      if (!isik['küüditamine']) { isik['küüditamine'] = [] }
      isik['küüditamine'].push(guessDate(match[4])[0])
    }
    if (isik['küüditamine']) isik['küüditamine'] = isik['küüditamine'].join('; ')
    isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@KÜÜDITATUD@')
  })(isik)

  // Arreteerimised
  ;((isik) => {
    let re = /(arr\.) ?([\.0123456789]*)/g
    while (match = re.exec(isik.kasutamataKirjeosa)) {
      if (!isik.arreteerimine) { isik.arreteerimine = [] }
      isik.arreteerimine.push(guessDate(match[2])[0])
    }
    if (isik.arreteerimine) isik.arreteerimine = isik.arreteerimine.join('; ')
    isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@ARRETEERITUD@')
  })(isik)

  // Vabanemised
  ;((isik) => {
    let re = /(vab\. asum\.|vab\.) ?([\.0123456789]*)/g
    while (match = re.exec(isik.kasutamataKirjeosa)) {
      if (!isik.vabanemine) { isik.vabanemine = [] }
      isik.vabanemine.push(guessDate(match[2])[0])
    }
    isik.kasVabanenud = isik.vabanemine ? "1" : "0"
    if (isik.vabanemine) {
      isik.vabanemine = isik.vabanemine.join('; ')
    }
    isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@VABANENUD@')
  })(isik)

  // Allikaviited
  ;((isik) => {
    let re = /\[(.*)\]/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik.allikad = match[1].split(',').map(function(a){return a.trim()})
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@ALLIKAD@')
    }
    if (isik.allikad) isik.allikad = isik.allikad.join('; ')
  })(isik)

  // Sünd 2.
  ;((isik) => {
    let re = /@NIMI@([^0-9]+)([0-9][0-9\.]+)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      // isik['sünd'] = match
      isik['sünd'] = guessDate(match[2])[0]
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@NIMI@$1@SÜND@')
    }
  })(isik)

  // Haridus
  ;((isik) => {
    let re = /([1-9]{1,2}) ?kl[\.,;]* ?/g
    while (match = re.exec(isik.kasutamataKirjeosa)) {
      if (isik.haridus) { isik.haridus += (', ' + match[1] + ' kl.') }
      else { isik.haridus = match[1] + ' kl.' }
    }
    isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@HARIDUS@')
  })(isik)
  ;((isik) => {
    let re = /(kõrgh|kõrgh|keskh)(ar){0,1}[\., ]*/g
    while (match = re.exec(isik.kasutamataKirjeosa)) {
      if (isik.haridus) { isik.haridus += ', ' + match[1] + '.' }
      else { isik.haridus = match[1] + '.' }
    }
    isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@HARIDUS@')
  })(isik)

  // Erinõukogu otsus ja paragraf
  ;((isik) => {
    let re = /[Ee]rin\. *([0-9\.]{4,8}) *§ *((?:[0-9\-]+[, ]*)+)([a-zA-Z]+)/g
    while (match = re.exec(isik.kasutamataKirjeosa)) {
      if (!isik.erin) { isik.erin = [] }
      isik.erin.push({
        otsus: guessDate(match[1])[0],
        paragrahv: match[2]
      })
    }
    isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@ERIN@ $3')
  })(isik)

  // Nimekujud
  ;((isik) => {
    let re = /(@NIMI@[, ;\.]*(?:@SUGULUS@[, ;\.]*)*)((?:(?:in|en)\.?)? ?ka[^@]*)((?:@RAHVUS@[, ;\.]*)*(?:@SÜND@[, ;\.]*)*)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['nimekujud'] = match[2]
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '$1 @NIMEKUJU@ $3')
    }
  })(isik)


  // Liigsed märgid teekide vahel
  ;((isik) => {
    let re = /([A-ZÕÜÄÖ]@)[, ;\.]*(@[A-ZÕÜÄÖ])/g
    isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '$1 $2')
  })(isik)


  csvWrite(isik)
})

// let hukkunudY = YAML.stringify(hukkunud, 3, 4)
// fs.writeFileSync('hukkunud.yaml', hukkunudY)

// let isikudY = YAML.stringify(isikud, 3, 2)
// fs.writeFileSync('rich_memento.yaml', isikudY)
// logger.log('isikud')
// logger.log(isikud)
// logger.log('posikud')
