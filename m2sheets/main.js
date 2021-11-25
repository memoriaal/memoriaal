// main.js

if (require.main === module) {
  main();
} else {
  console.log(module)
}

function main() {
  const mysql = require('mysql')
  const GSS = require('google-spreadsheet')

  const conn = mysql.createConnection({
    host: "localhost",
    user: process.env.M_MYSQL_U,
    password: process.env.M_MYSQL_P,
    database: "repis"
  })

  conn.connect(function(err) {
    if (err) throw err
    conn.query("SELECT * FROM kirjed LIMIT 10", function (err, result, fields) {
      if (err) throw err
      for (row in result) {
        console.log({fields, row})
      }
    })
    conn.end()
  })


  console.log("Hello world");
  console.log(module)
}


export default {main}
