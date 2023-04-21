// Path: leinakuulutused\parse.js
// Parse leinakuulutused.json and save to leinakuulutused.csv

const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const results = [];

fs.createReadStream('leinakuulutused.json')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        const csvWriter = createCsvWriter({
            path: 'leinakuulutused.csv',
            header: [
                {id: 'date', title: 'date'},
                {id: 'name', title: 'name'},
                {id: 'place', title: 'place'},
                {id: 'time', title: 'time'},
                {id: 'text', title: 'text'},
            ]
        });
        csvWriter.writeRecords(results)
            .then(() => console.log('The CSV file was written successfully'));
    }
);

