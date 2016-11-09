var path = require('path')
var util = require('util')
var async = require('async')
var fs = require('fs')
var YAML = require('yamljs')
// var replace = require('replace')

var logger = require(path.resolve(__dirname, 'logging.js'))('out.log')

var isikud = YAML.load('memento.yaml')
var sugulused = YAML.load('sugulused.yaml')

var perekond = isikud[0]['memento id']
isikud.forEach(function(isik) {
  let perenimi = isik.nimi.split(',')[0]
  if (perenimi === perenimi.toUpperCase()) {
    perekond = isik['memento id']
  }
  // console.log(isik)
  sugulused.forEach(function(sugulus) {
    if (String(isik.kirje).indexOf('<s>') !== -1) {
      let re = /\<s\>(.*)\<\/s\>/
      isik.sugulus = re.exec(isik.kirje)[1]
      return
    }

    let re = new RegExp('[ ,]' + sugulus + '[ ,]','')
    isik.kirje = String(isik.kirje).replace(re, ' <s>' + sugulus + '</s> ')
  })
  isik.perekond = perekond
})

let yamlString = YAML.stringify(isikud)
fs.writeFileSync('rich_memento.yaml', yamlString)
// logger.log('isikud')
// logger.log(isikud)
// logger.log('posikud')
