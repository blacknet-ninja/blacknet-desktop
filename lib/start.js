
const {  dialog } = require('electron');

module.exports = function (app, callback) {
  
    let command = 'java -version';

    require('child_process').exec(command, function (error, stdout, stderr) {

        if (error || /java|Java/.test(stderr.toString()) == false) {
            dialog.showMessageBox({ message: "Blacknet need Java installed" });
            app.quit();
        } else {
            callback();
        }
    });

}