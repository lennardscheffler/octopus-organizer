const uuid = require('uuid/v4');
var Storage = require('node-storage');

var store;
if (process.platform == 'win32') {
    store = new Storage(process.env.APPDATA + '/octopus-organizer/settings.conf');
}
else if (process.platform == 'darwin') {    
    store = new Storage(process.env.HOME + '/Library/Preferences/octopus-organizer/settings.conf');
} 
else {
    store = new Storage('~/.octopus-organizer/settings.conf');
}

var events = new Vue();

