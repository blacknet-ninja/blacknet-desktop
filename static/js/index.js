
window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js');

const ipc = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow

ipc.on('try', function (event, data) {
    $('.tips').html('Found new version: ' + data.version );
})

ipc.on('start', function (event, data) {
    $('.tips').html('Start download: ' + data.version);
})

ipc.on('data', function (event, data) {
    $('.tips').html('Blacknet v' +data.version+ ' is Downloading: '+ data.percent.toFixed(2) + "%");
})


ipc.on('extracting', function (event, data) {
    $('.tips').html('Extracting......');
});


ipc.on('end', function (event, data) {
    $('.tips').html('Relaunch new version soon......');
    ipc.send('update_end');
});

ipc.on('dontneedupdate', function (event, data) {
    $('.tips').html('Blacknet ' + data.version + ' is the lastest version, starting......');
});




ipc.send('start_proccess');