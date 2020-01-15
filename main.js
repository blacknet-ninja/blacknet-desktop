
const { app, BrowserWindow,ipcMain } = require('electron');

const request = require('request');
let mainWindow;

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
        app.quit()
    // }
});

const versionURL = 'https://gitlab.com/api/v4/projects/blacknet-ninja%2Fblacknet-desktop/repository/tags';
app.on('ready', () => {
    openWindow();

    ipcMain.on('start_listen', (event, arg) => {

        request({url: versionURL, json: true}, function(err, res, req){
            if(!err){
                let data = {};
                data.version = res.body[0].name;
                data.message = res.body[0].message;
                event.reply('version_check', data);
            }

        });

    });

});


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

    mainWindow.loadFile('./static/index.html');
    
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    // mainWindow.webContents.openDevTools()

    mainWindow.on('close', function (e) {
        
    });
    mainWindow.setMenu(null);

    return mainWindow;
};