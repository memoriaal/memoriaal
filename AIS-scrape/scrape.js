// Scrape contents from https://ais.ra.ee/et/description-unit/view?id=110701615553
// and save to ais.json

const { log } = require('console');
const puppeteer = require('puppeteer');

const baseUrl = 'https://ais.ra.ee';
const url = baseUrl + '/et/description-unit/view?id=';

const firstID = 110701615553;
const lastID = 110701618237;
// const lastID = 110701615554;

const data = [];

(async () => {
    const browser = await puppeteer.launch();
    for (let id = firstID; id <= lastID; id++) {
        console.log('Reading url ' + url + id);
        const page = await browser.newPage();

        page.on('console', async (msg) => {
            const msgArgs = msg.args();
            for (let i = 0; i < msgArgs.length; ++i) {
              console.log(await msgArgs[i].jsonValue());
            }
          });

        await page.goto(url + id);

        // find <table id="w0" class="table table-minimal mb-4"><tbody>
        // and iterate over its rows
        const datapoint = await page.evaluate(() => {
            // console.log('evaluating page ' + document.title);
            const innerData = {};
            const items = document.querySelectorAll('table#w0>tbody>tr');

            // console.log(document.innerText);
            let rowIndex = 0;
            items.forEach(item => {
                rowIndex++;
                // console.log(`innerText ${rowIndex}: ${item.innerText}`);
                const key = item.querySelector('th').innerText;
                // if key is not 'Leidandmed' or 'Pealkiri', then skip
                if (key !== 'Leidandmed' && key !== 'Pealkiri') {
                    return
                }
                const value = item.querySelector('td').innerText;
                innerData[key] = value;
                // console.log(`row ${rowIndex}: ${key} = ${value}`);
            });
            return innerData;
        });
        data.push(datapoint);
        // console.log('data', datapoint);
        await page.close();
    }


    const json = JSON.stringify(data, null, 2);

    console.log('saving data to ais.json');

    const fs = require('fs');
    const path = require('path');
    const outFileJSON = path.join(__dirname, 'ais.json');
    fs.writeFileSync(outFileJSON, json);

    console.log('saving data to ais.csv');

    // Save data as CSV
    const outFileCSV = path.join(__dirname, 'ais.csv');
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: outFileCSV,
        header: [
            {id: 'Leidandmed', title: 'Leidandmed'},
            {id: 'Pealkiri', title: 'Pealkiri'},
        ]
    });
    csvWriter.writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));

    await browser.close();

})();

