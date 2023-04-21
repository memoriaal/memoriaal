// Path: leinakuulutused\index.js
// Run scrape.js and parse.js

const { exec } = require('child_process');

exec('node scrape.js', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
}
);

exec('node parse.js', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
}
);
