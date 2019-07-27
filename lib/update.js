const requestPromise = require('minimal-request-promise');
const walletPageUrl = 'https://blacknet.ninja/wallet.html';
const fs = require('fs');
const cheerio = require('cheerio');
const version = fs.readFileSync('version').toString();

const https = require('https');
const path = require('path');
var extract = require('extract-zip');

console.log(version)

// extract('blacknet-0.2.3.zip', {dir: __dirname + '/../'}, function (err) {
//  // extraction is complete. make sure to handle the err
// })
requestPromise.get(walletPageUrl).then(function (response) {
    let $ = cheerio.load(response.body);

    let links = $('#content li a'), walletUrl;

    walletUrl = links[0].attribs.href;

    let filename = path.basename(walletUrl);
    let v = filename.replace('blacknet-', '');

    if(v!= version){
        console.log('need update')
    }
    console.log(filename)
    
    // const file = fs.createWriteStream(filename);
    // const request = https.get(walletUrl, function(response) {
    //   response.pipe(file);
    //   file.on('finish', function() {
    //     console.log('download complete')

    //     fs.createReadStream(filename).pipe(unzip.Extract({ path: __dirname+'/' }));
    //   });
    // });


}, function (response) {
    
});