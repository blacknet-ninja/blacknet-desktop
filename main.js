
const { app, BrowserWindow } = require('electron');

// 创建 eventEmitter 对象
let mainWindow;

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('ready', () => {
    openWindow();
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