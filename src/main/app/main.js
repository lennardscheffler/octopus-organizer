const { app, BrowserWindow, Menu } = require('electron');
var Storage = require('node-storage');
var store = new Storage('octopus.conf');

function createWindow () {

  const win = new BrowserWindow({
    width: 1024,
    height: 786,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  /*if (store.get('intro') || store.get('intro') == undefined) {
    win.loadFile(__dirname + '/html/introduction.html');
    store.put('intro', false);
  }
  else {*/
    win.loadFile(__dirname + '/html/stack-canvas-view.html');
  /*}*/

  //  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})