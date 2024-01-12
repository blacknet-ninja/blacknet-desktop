const request = require('request');
const walletPageUrl = 'https://blnexplorer.io/api/wallet/releases';
const fs = require('fs');
const version = fs.readFileSync( __dirname + '/../version').toString();
const https = require('https');
const path = require('path');
var extract = require('extract-zip');

global.progessData = {
    progress: 0,
    total: 0,
    cur: 0
}

module.exports = async function ( ipc, localVersion, callback) {


    let body = await process(walletPageUrl), version = body.version;
    
    // requestPromise.get(walletPageUrl).then(function (response) {
        
    let walletUrl = 'https://vasin.nl/blacknet-' + version+ '.zip';

    let filename = path.basename(walletUrl);
    
    progessData.version = version;
    progessData.downloadUrl = walletUrl;
    progessData.isDownLoading = false;

    if ( version == localVersion) {
        console.log('dont need update');
        ipc.reply('dontneedupdate', progessData);
        return callback(false);
    }

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
}

function getPrependScript(){

    return `
    window.nodeRequire = require;
    delete window.require;
    delete window.exports;
    delete window.module;
    `;
}

const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Mobile Safari/537.36'
};

function process(url){

    return new Promise((resolve)=>{
        request({
            url: encodeURI(url),
            headers: headers,
            forever: true,
            json: true
        }, (err, res, body)=>{

            if(err && err.code === 'ECONNREFUSED'){
                return resolve({error: 'ECONNREFUSED'});
            }
        
            if(err){
                console.log(err.stack);
                return resolve(null);
            }
            resolve(body);
        });
    });
}

