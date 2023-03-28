// Scrape contents from https://www.ra.ee/apps/leinakuulutused/index.php/et/data/searchAdvanced
// and save to leinakuulutused.json

const puppeteer = require('puppeteer');

const baseUrl = 'https://www.ra.ee';
const url = baseUrl + '/apps/leinakuulutused/index.php/et/data/searchAdvanced';

(async () => {    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const numPages = await page.evaluate(() => {
        const lastButton = document.querySelector('#yw2 .last a');
        const numPages = lastButton.href.split('page=')[1];
        return numPages;
    });
    const data = {
        numPages: numPages,
        items: []
    }
    // for (let i = 1; i <= 1; i++) {
    for (let i = 1; i <= numPages; i++) {
        await page.goto(url + '?page=' + i);
        console.log('Scraping page ' + i + ' of ' + numPages);
        const items = await page.evaluate(() => {
            // find date in string, then transform it
            // from d.m.YYYY to YYYY-MM-DD
            // If day is missing or equal to ?, then output is YYYY-MM
            // if month is missing or or equal to ?, then output is YYYY
            // date and day are zero-filled
            function transformDate(dateString) {
                const re = /([\d?]{1,2})\.([\d?]{1,2})\.(\d{4})/
                let match = dateString.match(re)
                if (match) {
                    let day = match[1].padStart(2, '0')
                    let month = match[2].padStart(2, '0')
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

            const items = [];
            const rows = document.querySelectorAll('#yw0 tbody tr');
            rows.forEach(row => {
                const permalink = row.querySelector('td:nth-child(1) a').href.split('&')[0];
                const nr = row.querySelector('td:nth-child(1)').innerText;
                const perekonnanimi = row.querySelector('td:nth-child(2)').innerText;
                const eesnimed = row.querySelector('td:nth-child(3)').innerText;
                const neiupõlvenimed = row.querySelector('td:nth-child(4)').innerText;
                const sündinud = row.querySelector('td:nth-child(5)').innerText;
                const sünnikoht = row.querySelector('td:nth-child(6)').innerText;
                const surnud = row.querySelector('td:nth-child(7)').innerText;
                const surmakoht = row.querySelector('td:nth-child(8)').innerText;


                items.push({
                    Nr: nr,
                    Perekonnanimi: perekonnanimi,
                    Eesnimed: eesnimed,
                    Neiupõlvenimed: neiupõlvenimed,
                    Sündinud: transformDate(sündinud),
                    Sünnikoht: sünnikoht,
                    Surnud: transformDate(surnud),
                    Surmakoht: surmakoht,
                    permalink: permalink
                });
            });
            return items;
        });
        data.items = data.items.concat(items);
    }

    const json = JSON.stringify(data, null, 2);
    // console.log(json);

    const fs = require('fs');
    const path = require('path');
    const outFileJSON = path.join(__dirname, 'leinakuulutused.json');
    fs.writeFileSync(outFileJSON, json);

    // Save data.items as CSV
    const outFileCSV = path.join(__dirname, 'leinakuulutused.csv');
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: outFileCSV,
        header: [
            {id: 'Nr', title: 'Nr'},
            {id: 'Perekonnanimi', title: 'Perekonnanimi'},
            {id: 'Eesnimed', title: 'Eesnimed'},
            {id: 'Neiupõlvenimed', title: 'Neiupõlvenimed'},
            {id: 'Sündinud', title: 'Sündinud'},
            {id: 'Sünnikoht', title: 'Sünnikoht'},
            {id: 'Surnud', title: 'Surnud'},
            {id: 'Surmakoht', title: 'Surmakoht'},
            {id: 'permalink', title: 'permalink'},
        ]
    });
    csvWriter.writeRecords(data.items)
        .then(() => console.log('The CSV file was written successfully'));

    await browser.close();


})();

