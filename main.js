'use strict';
const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const clipboard = require('electron').clipboard;
const globalShortcut = electron.globalShortcut;
const ipcMain = require('electron').ipcMain;
const Tray = electron.Tray;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var appIcon = null;

// Seems to be needed to keep the application alive.
app.on('window-all-closed', function() {
  // woopwoopwoop
});

// Create a window!
function createWindow() {
  mainWindow = new BrowserWindow({width: 1003,
    height: 750,
    minWidth: 1000,
    icon: __dirname + '/assets/images/logo.png'
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // mainWindow.setMenu(null);
  mainWindow.on('closed', function() {

  	 		mainWindow = null;
  		});
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  createWindow();

  // Create a tray icon
  appIcon = new Tray('assets/images/logo.png');
  appIcon.setToolTip('Clipboard Manager.');




  // Show and hide the application
  appIcon.on('click', function() {

    if (mainWindow !== null && mainWindow.isVisible()) {
      mainWindow.hide();
    }
    else if(mainWindow !== null && mainWindow.isVisible() === 0) {
      mainWindow.show();
    }
   if(mainWindow === null) {
    createWindow();
  }
  });

  // Unfortunately, because of an Electron limitation, CTRL + C cannot be captured because it overwrites the system default copy shortcut.
  var retHtml = globalShortcut.register('CmdorCtrl+Shift+C', function() {
    mainWindow.webContents.send('copied', clipboard.readText());
  });
  if (!retHtml) {
    console.log('registration failed');
  }

  // var retPlain = globalShortcut.register('CmdorCtrl+Alt+C', function() {
  //   mainWindow.webContents.send('copied', clipboard.readText());
  // });
  // if (!retPlain) {
  //   console.log('registration failed');
  // }



  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

  });

});
