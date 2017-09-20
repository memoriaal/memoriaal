var fs = require('fs')

const book = 'r6-2-'
const source_file = book + 'lines.txt'
const target_file = book + 'records.txt'

let text = fs.readFileSync(source_file, 'utf-8')
// console.log(text);

function readLines(input, callback) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      callback(line.trim());
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      callback(remaining);
    }
    // console.log(text);
    let last_record_at = 0
    let out = ''
    text.split('\n').forEach((line) => {
      line = line.replace(/ *$/, '')
      if (out === '') {
        out = line
      } else if (line.trim().startsWith('===')) {
        out += '\n' + line
      } else {
        out += ' ' + line.trim()
      }
    })
    fs.writeFileSync(target_file, out, 'utf-8')
  });
}

function replaceName(name) {
  // console.log(name);
  let re = new RegExp('(:?^|\n)( *' + name + ')')
  if (text.includes(name)) {
    // console.log('found ' + re);
    text = text.replace(re, '$1===' + '$2' + '===')
  } else {
    // console.log('not found ' + re);
  }
}

var input = fs.createReadStream('R6-nimed.txt', 'utf-8');
readLines(input, replaceName);