
const { app, ipcMain, BrowserWindow, dialog } = require('electron');
const platform = process.platform;
const requestPromise = require('minimal-request-promise');
const checkJava = require('./lib/start');
const checkUpdates = require('./lib/update');

const events = require('events');
// 创建 eventEmitter 对象
let mainWindow;
let serverProcess;
let isStartDamon = false;


let appUrl = 'http://127.0.0.1:8283/static/index.html';



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('ready', () => {
    if(isStartDamon){
        return openWindow(appUrl);
    }
    openWindow();
    checkJava(app, startUp);
});



function startUp() {

    // check updateinfo

    ipcMain.on('start_proccess', (event, arg) => {
        event.reply('sync-status-reply', 'pong')

        checkUpdates(event, function (ret) {

            startBlacknetMainProcess();

        });
    });

    ipcMain.on('update_end', (event, arg) => {

        startBlacknetMainProcess();

    });

};



function startBlacknetMainProcess() {


    const version = require('fs').readFileSync(__dirname + '/version').toString();
    const cwd = __dirname + '/blacknet-' + version + '/bin';

    let spawnPath = __dirname + '/blacknet-' + version + '/bin/blacknet';

    if (platform === 'win32' || platform == 'win64') {
        spawnPath = spawnPath + '.bat';
    }
    serverProcess = require('child_process').spawn(spawnPath, { cwd });

    serverProcess.stdout.on('data', (data) => {
        // console.log(`stdout: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    reloadWindow();

}
// 在主进程中.

function reloadWindow(){

    requestPromise.get(appUrl).then(function (response) {
        console.log('Server started!');
        mainWindow.loadURL(appUrl);

    }, function (response) {
        console.log('Waiting for the server start...');

        setTimeout(function () {
            reloadWindow();
        }, 1000);
    });
}




function openWindow(url) {

    mainWindow = new BrowserWindow({
        title: 'Blacknet',
        width: 1340,
        height: 800,
        backgroundColor: "#2D2D2D",
        webPreferences: {
            nodeIntegration: true
        }
    });

    if(url){
        mainWindow.loadURL(appUrl);
    }else{
        mainWindow.loadFile('./static/index.html');
    }
    
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    // mainWindow.webContents.openDevTools()

    mainWindow.on('close', function (e) {
        if (serverProcess && serverProcess.pid) {
            e.preventDefault();
            // kill Java executable
            const kill = require('tree-kill');
            kill(serverProcess.pid, 'SIGTERM', function () {
                console.log('Server process killed');

                serverProcess = null;

                mainWindow.close();
                process.exit(0);
            });
        }
    });
    mainWindow.setMenu(null);
    return mainWindow;
};