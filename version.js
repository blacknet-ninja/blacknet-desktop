


const fs = require('fs');



const version = fs.readFileSync('./version').toString();


let package = require('./package.json');

package.version = version.replace(/\n/, '');

fs.writeFileSync('./package.json', JSON.stringify(package, null, '   '))