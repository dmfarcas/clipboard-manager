'use strict';
const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const clipboard = require('electron').clipboard;
const globalShortcut = electron.globalShortcut;
const ipcMain = require('electron').ipcMain;
const ipcRender = require('electron').ipcMain;
const Tray = electron.Tray;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var appIcon = null;

  let oldhotkeys = [];


// Seems to be needed to keep the application alive.
app.on('window-all-closed', function() {
  // woopwoopwoop
});

// Create a window!
function createWindow() {
  mainWindow = new BrowserWindow({width: 1003,
    height: 750,
    minWidth: 1000,
    frame: false,
    overlayScrollbar: true,
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

function unregisterkeys(arg) {
  oldhotkeys.push(arg);
  if(oldhotkeys[oldhotkeys.length-2])
    globalShortcut.unregister(oldhotkeys[oldhotkeys.length -2] );
}

ipcMain.on('change-copy-hotkey', function() {
  console.log("Changing copy hot key...");
});

ipcMain.on('change-hide-hotkey', function(event, arg) {
  unregisterkeys(arg);
  hideShow(arg);
});

  // Unfortunately, because of an Electron limitation, CTRL + C cannot be captured because it overwrites the system default copy shortcut.
var retHtml = (function(hotkey) {
   globalShortcut.register(hotkey, function() {
    mainWindow.webContents.send('copied', clipboard.readText());
    console.log(clipboard.availableFormats());
  });
})("CmdorCtrl+Shift+A");

  // var retPlain = globalShortcut.register('CmdorCtrl+Alt+C', function() {
  //   mainWindow.webContents.send('copied', clipboard.readText());
  // });
  // if (!retPlain) {
  //   console.log('registration failed');
  // }

function hideShow(hotkey) {
  globalShortcut.register(hotkey, function() {
  console.log("The window is now: " + mainWindow.isVisible());
  if (mainWindow.isVisible() === true) {
    mainWindow.hide();
  }
  else {
    mainWindow.show();
  }
 });
}

  ipcMain.on('quit', function() {
    app.quit();
  });

ipcMain.on('ready', function(event, arg) {
  unregisterkeys(arg);
  hideShow(arg);
});

mainWindow.on('blur', () => {
  if(mainWindow !== null && mainWindow.isVisible()) {
    console.log("This is a weird case in which the window loses focus, and it's gone until it's focused manually. Huh.");
  }
});

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
