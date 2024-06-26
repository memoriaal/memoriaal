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
    +   '"' + ( isik.memento            ? isik.memento             : '' )+ '"'
    + ', "' + ( isik['sünniaasta']      ? isik['sünniaasta']       : '' )+ '"'
    + ', "' + ( isik.perekond           ? isik.perekond            : '' )+ '"'
    + ', "' + ( isik.nimi               ? isik.nimi                : '' )+ '"'
    + ', "' + ( isik.nimekujud          ? isik.nimekujud           : '' )+ '"'
    + ', "' + ( isik['sünd']            ? isik['sünd']             : '' )+ '"'
    + ', "' + ( isik.sugulus            ? isik.sugulus             : '' )+ '"'
    + ', "' + ( isik.rahvus             ? isik.rahvus              : '' )+ '"'
    + ', "' + ( isik.haridus            ? isik.haridus             : '' )+ '"'
    + ', "' + ( isik['küüditamine']     ? isik['küüditamine']      : '' )+ '"'
    + ', "' + ( isik.arreteerimine      ? isik.arreteerimine       : '' )+ '"'
    + ', "' + ( isik.vabanemine         ? isik.vabanemine          : '' )+ '"'
    + ', "' + ( isik.surmaotsus         ? isik.surmaotsus          : '' )+ '"'
    + ', "' + ( isik.hukkunud           ? isik.hukkunud            : '' )+ '"'
    + ', "' + ( isik.kasVabanenud       ? isik.kasVabanenud        : '' )+ '"'
    + ', "' + ( isik.kasHukkunud        ? isik.kasHukkunud         : '' )+ '"'
    + ', "' + ( isik.kasMitteküüditatud ? isik.kasMitteküüditatud  : '' )+ '"'
    + ', "' + ( isik.kasSaatusTeadmata  ? isik.kasSaatusTeadmata   : '' )+ '"'
    + ', "' + ( isik.allikad            ? isik.allikad             : '' )+ '"'
    + ', "' + ( isik.kirje              ? isik.kirje               : '' )+ '"'
    + ', "' + ( isik.kasutamataKirjeosa ? isik.kasutamataKirjeosa  : '' )+ '"'
    + '\n'
  )
}
csvWrite({
  memento: 'memento',
  sünniaasta: 'sünniaasta',
  perekond: 'perekond',
  nimi: 'nimi',
  nimekujud: 'nimekujud',
  sünd: 'sünd',
  sugulus: 'sugulus',
  rahvus: 'rahvus',
  haridus: 'haridus',
  küüditamine: 'küüditamine',
  arreteerimine: 'arreteerimine',
  vabanemine: 'vabanemine',
  surmaotsus: 'surmaotsus',
  hukkunud: 'hukkunud',
  kasVabanenud: 'kasVabanenud',
  kasHukkunud: 'kasHukkunud',
  kasMitteküüditatud: 'kasMitteküüditatud',
  kasSaatusTeadmata: 'kasSaatusTeadmata',
  allikad: 'allikad',
  kirje: 'kirje',
  kasutamataKirjeosa: 'kasutamataKirjeosa'
})

const guessDate = function guessDate(datestring) {
  // make sure we only have numbers and '.' or '-' in our datestring
  if (datestring === '') { return ['0000', datestring] }
  if (!/^[\.0123456789\-]*$/.test(datestring)) { return ['Can\'t convert', datestring] }

  const guessYear = function(yearstring) {
    if (Number(yearstring) > 1850) { return yearstring }
    if (yearstring.length === 2) {
      if (Number(yearstring) > 50) { return '18' + yearstring }
      return '19' + yearstring
    }
    return '-'
  }

  datestring = datestring.replace(/[\. ]*$/, '')
  datestring = datestring.replace(/^[\. ]*/, '')
  dateparts = datestring.split(/[\.\-]/)

  let returndate = ''
  if (dateparts.length === 1) {
    returndate = guessYear(dateparts[0])
  }
  else if (dateparts.length === 2) {
    returndate = guessYear(dateparts[1]) + '-' + dateparts[0]
  }
  else if (dateparts.length === 3) {
    returndate = guessYear(dateparts[2]) + '-' + dateparts[1] + '-' + dateparts[0]
  }
  else { return ['Can\'t tokenize', datestring] }

  return[returndate, datestring]
}

var isikud = YAML.load('memento.yaml')
const sugulused = YAML.load('sugulused.yaml')
const rahvused = YAML.load('rahvused.yaml')
// var hukkunud = []

var perekond = isikud[0].memento
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

let isikudY = YAML.stringify(isikud, 3, 2)
fs.writeFileSync('rich_memento.yaml', isikudY)
// logger.log('isikud')
// logger.log(isikud)
// logger.log('posikud')
