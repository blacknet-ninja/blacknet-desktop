
const { app, BrowserWindow, dialog } = require('electron');
const cwd = app.getAppPath() + '/blacknet-dist/bin';
const platform = process.platform;

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('ready', () => {
    checkJava(startUp);
});


let appUrl = 'http://127.0.0.1:8283/static/index.html';

const openWindow = function () {
    mainWindow = new BrowserWindow({
        title: 'Blacknet',
        width: 1340,
        height: 800,
        backgroundColor: "#2D2D2D"
    });

    mainWindow.loadURL(appUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.on('close', function (e) {
        if (serverProcess) {
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
};

const startUp = function () {
    const requestPromise = require('minimal-request-promise');

    requestPromise.get(appUrl).then(function (response) {
        console.log('Server started!');
        openWindow();
    }, function (response) {
        console.log('Waiting for the server start...');
        setTimeout(function () {
            startUp();
        }, 200);
    });
};


function checkJava(callback) {
  
    let command = 'java -version';
    let spawnPath = app.getAppPath() + '/blacknet-dist/bin/blacknet';
    
    if (platform === 'win32' || platform == 'win64') {
        spawnPath = spawnPath + '.bat';
        command = 'java.exe -version';
    }

    require('child_process').exec(command, function (error, stdout, stderr) {

        if (error || /java|Java/.test(stderr.toString()) == false) {
            dialog.showMessageBox({ message: "Blacknet need Java installed" });
            app.quit();
        } else {

            serverProcess = require('child_process').spawn(spawnPath, { cwd });
            callback();
        }
    });

}
