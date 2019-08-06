
window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js');

const ipc = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow

ipc.on('try', function (event, data) {
    $('.tips').html('New version available: ' + data.version );
})

ipc.on('start', function (event, data) {
    $('.tips').html('Start download: ' + data.version);
})

ipc.on('data', function (event, data) {
    $('.tips').html('Blacknet v' +data.version+ ' is downloading: '+ data.percent.toFixed(2) + "%");
})


ipc.on('extracting', function (event, data) {
    $('.tips').html('Extracting......');
});


ipc.on('end', function (event, data) {
    $('.tips').html('Launch new version soon......');
    ipc.send('update_end');
});

ipc.on('dontneedupdate', function (event, data) {
    $('.tips').html('Blacknet ' + data.version + ' is the lastest version, launch soon......');
});



ipc.send('start_proccess');