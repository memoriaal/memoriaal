var path = require('path')
var util = require('util')
var async = require('async')
var fs = require('fs')
var YAML = require('yamljs')

var isikud = YAML.load('memento.yaml')

var logger = require(path.resolve(__dirname, 'logging.js'))('out.log')

logger.log('isikud')
logger.log(isikud)
logger.log('posikud')
