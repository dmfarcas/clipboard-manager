'use strict';
const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const clipboard = require('electron').clipboard;
const globalShortcut = electron.globalShortcut;
const Tray = electron.Tray;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var appIcon = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit();
  // }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.

function createWindow() {
  mainWindow = new BrowserWindow({width: 800,
    height: 600,
    icon: __dirname + '/images/logo.png'
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {

  	 		mainWindow = null;
  		});
}


app.on('ready', function() {
  // Create the browser window.
  createWindow();

  // Create a tray icon
  appIcon = new Tray('images/logo.png');
  appIcon.setToolTip('This is my application.');

  // Show and hide the application
  appIcon.on('click', function() {

    if (mainWindow != null && mainWindow.isVisible()) {
      mainWindow.hide();
    }
    else if(mainWindow !== null && mainWindow.isVisible() == 0) {
      mainWindow.show();
    }
   if(mainWindow == null) {
    createWindow();
  }
  });

  // Load the index.html of the app.



  // Unfortunately, because of an Electron limitation, CTRL + C cannot be captured because it overwrites the system default copy shortcut.
  var ret = globalShortcut.register('CmdorCtrl+Shift+C', function() {
    console.log(clipboard.readText());
  });
  if (!ret) {
    console.log('registration failed');
  }
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null;

  });

});
