var fs = require('fs')
var util = require('util')

Object.defineProperty(global, '__stack', {
  get: function() {
    var orig = Error.prepareStackTrace
    Error.prepareStackTrace = function(_, stack) {
        return stack
    }
    var err = new Error
    Error.captureStackTrace(err, arguments.callee)
    var stack = err.stack
    Error.prepareStackTrace = orig
    return stack
  }
})


module.exports = (outfile) => {
  let logstream = fs.createWriteStream(outfile)
  logstream.setDefaultEncoding('utf8')
  logstream.log = function(text, id) {
    let when = new Date().toJSON().slice(11).replace(/[TZ]/g, ' ')
    let stack = __stack[1].toString()
    let method = stack.split(' ')[0].split('.').pop()
    let where = (
      (
        (stack.split('/').pop().split(':')[0])
        .split('.')[0]
        + ':' + stack.split('/').pop().split(':')[1]
        + new Array(15).join(' ')
      ).slice(0,15)
      + ' ' + method
      + new Array(35).join(' ')
    ).slice(0,35)

    if (typeof text === 'object') {
      text = util.inspect(text)
    }
    logstream.write(when + where + (id ? ' [' + id + ']' : '') + ' ' + text + '\n')
  }
  return logstream
}
