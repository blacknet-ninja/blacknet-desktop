const requestPromise = require('minimal-request-promise');
const walletPageUrl = 'https://blacknet.ninja/wallet.html';
const fs = require('fs');
const cheerio = require('cheerio');
const version = fs.readFileSync( __dirname + '/../version').toString();
const https = require('https');
const path = require('path');
var extract = require('extract-zip');

global.progessData = {
    progress: 0,
    total: 0,
    cur: 0
}

module.exports = function ( ipc, callback) {
    

    requestPromise.get(walletPageUrl).then(function (response) {
        let $ = cheerio.load(response.body);

        let links = $('#content li a'), walletUrl;

        walletUrl = links[0].attribs.href;

        let filename = path.basename(walletUrl);
        let v = filename.replace('blacknet-', '');
        
        progessData.version = v.slice(0, -4);
        progessData.downloadUrl = walletUrl;
        progessData.isDownLoading = false;

        if (v == version + '.zip') {
            console.log('need update');
            ipc.reply('dontneedupdate', progessData);
            return callback(false);
        }

        
        console.log(filename)

        const file = fs.createWriteStream(__dirname + '/../' + filename);
        
        ipc.reply('try', progessData);

        https.get(walletUrl, function (response) {
            response.pipe(file);

            progessData.isDownLoading = true;

            let len = parseInt(response.headers['content-length'], 10), cur = 0;
            progessData.total = len;

            ipc.reply('start', progessData);

            response.on("data", function (chunk) {
                cur += chunk.length;
                progessData.cur = cur;
                progessData.percent = cur * 100/ len;

                ipc.reply('data', progessData);
            });


            file.on('finish', function () {

                ipc.reply('extracting', progessData);
                extract(__dirname + '/../' + filename, { dir: __dirname + '/../' }, function (err) {
                    fs.writeFileSync(__dirname + '/../version', progessData.version);

                    let jqueryPath = 'blacknet-' + progessData.version + '/bin/html/js/jquery-3.4.1.min.js';
                    let jquery = fs.readFileSync(__dirname + '/../'+jqueryPath).toString();
                    if(jquery.indexOf('window.nodeRequire = require') === -1){
                        fs.writeFileSync(__dirname + '/../'+jqueryPath, getPrependScript() + jquery);
                    }

                    ipc.reply('end', progessData);
                    fs.unlinkSync(__dirname + '/../' + filename)

                });
            });
        });


    }, function (response, err) {
        console.log(response, err)
    });
}

function getPrependScript(){

    return `
    window.nodeRequire = require;
    delete window.require;
    delete window.exports;
    delete window.module;
    `;
}