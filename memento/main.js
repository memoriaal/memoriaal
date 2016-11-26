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
    +   '"' + isik.memento + '"'
    + ', "' + isik.nimi + '"'
    + ', "' + isik.perekond + '"'
    + ', "' + isik['sünd'] + '"'
    + ', "' + isik.hukkunud + '"'
    + ', "' + isik['küüditamine'] + '"'
    + ', "' + isik.arreteerimine + '"'
    + ', "' + isik.vabanemine + '"'
    + ', "' + isik.allikad + '"'
    + ', "' + isik.kirje + '"'
    + ', "' + isik.kasutamataKirjeosa + '"'
    + '\n'
  )
}

const guessDate = function guessDate(datestring) {
  // make sure we only have numbers and '.' or '-' in our datestring
  if (datestring === '') { return ['No date', datestring] }
  if (!/^[\.0123456789\-]*$/.test(datestring)) { return ['Can\'t convert', datestring] }

  const guessYear = function(yearstring) {
    if (Number(yearstring) > 1850) { return yearstring }
    else { return '19' + yearstring }
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
var hukkunud = []

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

  // mitte küüditatud
  ;((isik) => {
    let re = /(mitte küüditatud|küüditamata)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['mitte küüditatud'] = '+'
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@MITTEKÜÜDITATUD@')
    }
  })(isik)

  // Sünd
  ;((isik) => {
    let re = /s\. ([0-9\.]*)/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      isik['sünd'] = guessDate(match[1])[0]
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@SÜND@')
    }
  })(isik)

  // Hukkunud isikud
  ;((isik) => {
    let re = /(((otsus t(ä|a\u0308)ide viidud|m[õõ]rv[a\.]|[Ss]urn|tapetud)[a-zA-ZÕÜÄÖõüäö \-\.]*)([\.0123456789]*))/
    let match = re.exec(isik.kasutamataKirjeosa)
    if (match !== null) {
      hukkunud.push(isik)
      isik.hukkunud = guessDate(match[5])[0]
      isik.kasutamataKirjeosa = isik.kasutamataKirjeosa.replace(re, '@HUKKUNUD@')
    }
  })(isik)

  // Küüditamised
  ;((isik) => {
    // paraku saab ü tähte esitada enam kui ühel moel
    let re = /(k(ü|u\u0308){1,2}dit(\.|ati)) ?([\.0123456789]*)/g
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
    if (isik.vabanemine) isik.vabanemine = isik.vabanemine.join('; ')
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

  csvWrite(isik)
})

let hukkunudY = YAML.stringify(hukkunud, 3, 4)
fs.writeFileSync('hukkunud.yaml', hukkunudY)

let isikudY = YAML.stringify(isikud, 3, 2)
fs.writeFileSync('rich_memento.yaml', isikudY)
// logger.log('isikud')
// logger.log(isikud)
// logger.log('posikud')
