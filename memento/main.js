const path = require('path')
const util = require('util')
const async = require('async')
const fs = require('fs')
const YAML = require('yamljs')
// const replace = require('replace')

const logger = require(path.resolve(__dirname, 'logging.js'))('out.log')

var isikud = YAML.load('memento.yaml')
const sugulused = YAML.load('sugulused.yaml')
var tapetud = []

var perekond = isikud[0]['memento id']
isikud.forEach(function(isik) {
  isik.kirje = String(isik.kirje)
  let perenimi = isik.nimi.split(',')[0]
  if (perenimi === perenimi.toUpperCase()) {
    perekond = isik['memento id']
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

  // Allikaviited
  ;((isik) => {
    let re = /\[(.*)\]/
    let match = re.exec(isik.kirje)
    if (match !== null) { isik.allikad = match[1] }
  })(isik)

  // Tapetud isikud
  ;((isik) => {
    let re = /(surn\.|otsus täide viidud|surnud|tapetud)/
    let match = re.exec(isik.kirje)
    if (isik.kirje.match(re) !== null) {
      tapetud.push(isik)
      isik.tapetud = match[0]
    }
  })(isik)
})

let tapetudY = YAML.stringify(tapetud)
fs.writeFileSync('tapetud.yaml', tapetudY)

let isikudY = YAML.stringify(isikud)
fs.writeFileSync('rich_memento.yaml', isikudY)
// logger.log('isikud')
// logger.log(isikud)
// logger.log('posikud')
