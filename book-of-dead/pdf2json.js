
const fs = require("fs")
const path = require("path")
// To convert PDF to JSON, use library pdf-parse
const pdf = require("pdf-parse")
// To convert JSON to CSV, use library json2csv
const json2csv = require('json2csv').parse


// const docName = 'Swedish_Death_Index_ryssland1'
// const docName = 'Swedish_Death_Index_ryssland2'
// const docName = 'Swedish_Death_Index_lettland'
// const docName = 'comment_estland_kuni_84'
const docName = 'comment_estland_84_kuni'
// const docName = 'Swedish_Death_Index_1987_2020'
// const docName = 'Swedish_Death_Index_1830_1986'
const input = path.join(__dirname, docName + '.pdf')
const out2JSON = path.join(__dirname, docName + '.json')
const out2CSV = path.join(__dirname, docName + '.csv')

// Read the PDF file
var dataBuffer = fs.readFileSync(input)

// Parse the PDF file
pdf(dataBuffer).then(function(data) {

    // Get the text
    var text = data.text

    // Split text separated by newlines, then remove:
    // - empty lines;
    // - lines that match 'Page \d+$';

    var lines = text.split('\n')
        .map(function(line) {
            return line.trim()
        })
        .filter(function(line) {
            return line.length > 0
        })
        .filter(function(line) {
            return !line.match(/Page\s+\d+$|Records,\sby\sname/)
        })

    // split lines into records by finding the first line that starts with "Records, by name, 03/20/2023"
    let records = []
    let record = new Record()
    let mark = false
    let readyForRecordId = true
    const separatorRe = /^\d{4}[‐-\d]+$/
    const recordIdRe = /^Record\sID:/

    console.log("Found " + lines.length + " lines")
    for (let i = 0; i < lines.length; i++) {
        // if (i % 1000 === 0) {
        //     console.log("Processing line " + i)
        // }
        // if (i === 1000) {
        //     return
        // }
        let line = lines[i].trim()
        // console.log(`line ${i}: "${line}"`)

        if (readyForRecordId && line.match(separatorRe)) {
            // console.log("Found separator")
            readyForRecordId = false
            record.parse()
            record = new Record(line)
            records.push(record)
            continue
        }

        if (mark) {
            mark = false
            readyForRecordId = true
            record.id = line
            // console.log("Found record id: " + line)
            continue
        }
        if (line.match(recordIdRe)) {
            // console.log("Found record id mark on line " + i)
            mark = true
            continue
        }
        record.lines.push(line)
    }
    record.parse()
    console.log("Found " + records.length + " records")

    let jsonText = JSON.stringify(records, null, 2)
    fs.writeFileSync(out2JSON, jsonText)

    // convert JSON to CSV
    const fields = ['id', 'code', 'surname', 'forename', 'dead', 'born', 'martialStatus', 'lines']
    const opts = { fields }
    try {
        const csv = json2csv(records, opts)
        fs.writeFileSync(out2CSV, csv)
    }   catch (err) {
        console.error(err)
    }
})

class Record {
    constructor(code) {
        this.id = ""
        this.code = code
        this.surname = ""
        this.forename = ""
        this.dead = ""
        this.born = ""
        this.martialStatus = ""
        this.lines = []
    }

    parse() {
        if (this.lines.length === 0) {
            return
        }
        let nameParts = this.lines[0].split(",")
        if (nameParts.length > 1) {
            this.surname = nameParts[0].trim()
            this.forename = nameParts[1].trim()
        } else {
            this.surname = this.name
        }
        let martialStatusLine = false
        for (let i = 1; i < this.lines.length; i++) {
            let line = this.lines[i]
            if (line.match(/^Dead/)) {
                this.dead = transformDate(line)
                continue
            }
            if (line.match(/^Born/)) {
                this.born = transformDate(line)
                martialStatusLine = true
                continue
            }
            if (martialStatusLine) {
                //remove trailing period
                this.martialStatus = line.replace(/\.$/, "")
                return
            }
        }
    }
}

// find date in string, then transform it
// from m/d/YYYY to YYYY-MM-DD
// If day is missing or equal to ?, then output is YYYY-MM
// if month is missing or or equal to ?, then output is YYYY
// date and day are zero-filled
function transformDate(dateString) {
    const re = /([\d?]{1,2})\/([\d?]{1,2})\/(\d{4})/
    let match = dateString.match(re)
    if (match) {
        let month = match[1].padStart(2, '0')
        let day = match[2].padStart(2, '0')
        let year = match[3]
        if (month === "0?") { // month is missing
            return year
        }
        if (day === "0?") {  // day is missing
            return `${year}-${month}`
        }
        return `${year}-${month}-${day}`
    }
    return ""
}
