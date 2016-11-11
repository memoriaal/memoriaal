const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')

var isikud = YAML.load('memento.yaml')
const sugulused = YAML.load('sugulused.yaml')
var hukkunud = []

var perekond = isikud[0].memento
isikud.forEach(function(isik) {
  isik.kirje = String(isik.kirje)
  let perenimi = isik.nimi.split(',')[0]
  if (perenimi === perenimi.toUpperCase()) {
    perekond = isik.memento
  }
  isik.perekond = perekond

  sugulused.forEach(function(sugulus) {
    if (isik.kirje.indexOf('<s>') !== -1) {
      let re = /\<s\>(.*)\<\/s\>/
      isik.sugulus = re.exec(isik.kirje)[1]
      return
    }
    let re = new RegExp('[ ,]' + sugulus + '[ ,]','')
    isik.kirje = isik.kirje.replace(re, ' <s>' + sugulus + '</s> ')
  })

  // Sünd
  ;((isik) => {
    let re = /s\. ([0-9\.]*)/
    let match = re.exec(isik.kirje)
    if (match !== null) { isik['sünd'] = match[1] }
  })(isik)

  // Hukkunud isikud
  ;((isik) => {
    let re = /(((otsus täide viidud|mõrva|[Ss]ur[mn]|tapetud)[a-zA-ZÕÜÄÖõüäö \-\.]*)([\.0123456789]*))/
    let match = re.exec(isik.kirje)
    if (isik.kirje.match(re) !== null) {
      hukkunud.push(isik)
      // isik.hukkunud = match
      isik.hukkunud = []
      isik.hukkunud.push(match[2].replace(/[ \.]*$/,''))
      isik.hukkunud.push(match[4].replace(/[ \.]*$/,''))
      // isik.hukkunud = match[1].replace(/[ \.]*$/,'')
    }
  })(isik)

  // Arreteerimised
  ;((isik) => {
    let re = /(arr\.) ?([\.0123456789]*)/g
    let match = re.exec(isik.kirje)
    // if (match !== null) { isik.arreteerimised = match }
    if (match !== null) { isik.arreteerimised = [match[1], match[2]] }
  })(isik)

  // Vabanemised
  ;((isik) => {
    let re = /(vab\. asum\.) ?([\.0123456789]*)/g
    let match = re.exec(isik.kirje)
    // if (match !== null) { isik.arreteerimised = match }
    if (match !== null) { isik.vabanemised = [match[1], match[2]] }
  })(isik)

  // Allikaviited
  ;((isik) => {
    let re = /\[(.*)\]/
    let match = re.exec(isik.kirje)
    if (match !== null) { isik.allikad = match[1].split(',').map(function(a){return a.trim()}) }
  })(isik)

})

let hukkunudY = YAML.stringify(hukkunud, 3, 4)
fs.writeFileSync('hukkunud.yaml', hukkunudY)

let isikudY = YAML.stringify(isikud, 3, 2)
fs.writeFileSync('rich_memento.yaml', isikudY)
// logger.log('isikud')
// logger.log(isikud)
// logger.log('posikud')
