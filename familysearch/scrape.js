// read results from familysearch.org
//
// https://www.familysearch.org/service/search/hr/v2/personas?c.deathLikePlace1=on&count=10&f.deathLikePlace0=10&m.defaultFacets=on&m.facetNestCollectionInCategory=on&m.queryRequireDefault=on&offset=100&q.birthLikeDate.from=1870&q.birthLikeDate.to=1945&q.birthLikePlace=Estonia
// Accept: application/json, text/plain, */*
// Authorization: Bearer 4d459d29-e3f1-48d3-80ad-175ca8ddd59a-prod
// Referer: https://www.familysearch.org
// User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36

const fs = require("fs")
const path = require("path")

const personsFile = path.join(__dirname, "persons.json")
const persons = JSON.parse(fs.readFileSync(personsFile))

const pageSize = 100
const minOffset = 0
const maxOffset = 5800
// const maxOffset = 31000

const url = `https://www.familysearch.org/service/search/hr/v2/personas?c.deathLikePlace1=on&count=${pageSize}&f.deathLikePlace0=3&m.defaultFacets=on&m.facetNestCollectionInCategory=on&m.queryRequireDefault=on&offset={{offset}}&q.birthLikeDate.from=1870&q.birthLikeDate.to=1945&q.birthLikePlace=Estonia`

const headers = {
    "Accept": "application/json, text/plain, */*",
    "Authorization": "Bearer e631e934-5102-419c-9e06-2663896793a8-prod",
    "Referer": "https://www.familysearch.org",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
}

// synchronously loop through all pages by incrementing offset
async function fetchPage() {
    for (let offset = minOffset; offset < maxOffset; offset += pageSize) {
        console.log(`fetching page ${offset/pageSize+1}...`)
        const pageUrl = url.replace("{{offset}}", offset)
        console.log(pageUrl)

        // synchronously fetch page awaiting for response
        const response = await fetch(pageUrl, { headers })

        // synchronously read response body awaiting for data
        const json = await response.json()

        // exit script if json.results is 2
        if (json.results === 2) {
            console.log('Stopped at ' + (offset) + ' results')
            break
        }
        try {
            console.log('Read ' + (offset + pageSize) + ' of ' + json.results)
            if (json.error) {
                console.log(json.error)
                break
            }
        }
        catch (e) { console.log(e) }

        const list = json.entries
        .map(e => e.content.gedcomx.persons)
        .map(i => i[0])
        .map(p => ({ gender: p.gender, ...p.display, id:p.id, link:p.identifiers['http://gedcomx.org/Persistent'][0] }))

        // reduce list to object with id as key
        const newPersons = list.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {})
        // merge new persons into persons
        console.log(`merging ${Object.keys(newPersons).length} persons to existing ${Object.keys(persons).length}`)
        Object.assign(persons, newPersons)
        console.log(`total persons: ${Object.keys(persons).length}`)
        fs.writeFileSync(personsFile, JSON.stringify(persons, null, 2))

        console.log(`fetched page ${offset/pageSize + 1}`)
        // wait for a second
        await new Promise(resolve => setTimeout(resolve, 2000))
    }
}

// convert persons.json to persons.csv
function saveAsCsv() {
    // read persons.json
    const persons = JSON.parse(fs.readFileSync(personsFile))
    const createCsvWriter = require('csv-writer').createObjectCsvWriter
    const personsCSV = path.join(__dirname, "persons.csv")
    const csvWriter = createCsvWriter({
        path: personsCSV,
        header: [
            {id: 'gender', title: 'GENDER'},
            {id: 'birthDate', title: 'BIRTH_DATE'},
            {id: 'birthPlace', title: 'BIRTH_PLACE'},
            {id: 'deathDate', title: 'DEATH_DATE'},
            {id: 'deathPlace', title: 'DEATH_PLACE'},
            {id: 'name', title: 'NAME'},
            {id: 'role', title: 'ROLE'},
            {id: 'id', title: 'ID'},
            {id: 'link', title: 'LINK'},
        ]
    })

    csvWriter.writeRecords(Object.values(persons))
    .then(() => {
        console.log('...Done')
    })
}

saveAsCsv()

// fetchPage()
