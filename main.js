'use strict';
const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const clipboard = require('electron').clipboard;
const globalShortcut = electron.globalShortcut;
const ipcMain = require('electron').ipcMain;
const ipcRender = require('electron').ipcMain;
const Tray = electron.Tray;
const Menu = electron.Menu;


// Notifications
const notifier = require('node-notifier');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let appIcon = null;

// shortcut memory
let oldcopykeys = [];
let oldhidekeys = [];
let notiftoggle;


// Seems to be needed to keep the application alive when closed.
app.on('window-all-closed', function() {
  // woopwoopwoop
});

// Create a window!
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1003,
    height: 750,
    minWidth: 1000,
    frame: true,
    overlayScrollbar: true,
    icon: __dirname + '/assets/images/logo.png'
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.setMenu(null);
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
  const contextMenu = Menu.buildFromTemplate([
      { label: 'Quit', click: function() { app.quit(); } }
    ]);

    appIcon.setContextMenu(contextMenu);


  // Show and hide the application
  appIcon.on('click', function() {
    if (mainWindow !== null && mainWindow.isVisible()) {
      mainWindow.hide();
    } else if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    if (mainWindow === null) {
      createWindow();
    }
  });


  // Store old key values and unregister them when needed
  function unregisterhidekey(arg) {
    oldhidekeys.push(arg);
    if (oldhidekeys[oldhidekeys.length - 2])
      globalShortcut.unregister(oldhidekeys[oldhidekeys.length - 2]);
  }


  function unregistercopykey(arg) {
    oldcopykeys.push(arg);
    if (oldcopykeys[oldcopykeys.length - 2])
      globalShortcut.unregister(oldcopykeys[oldcopykeys.length - 2]);
  }


  ipcMain.on('change-copy-hotkey', function(event, arg) {
    unregistercopykey(arg);
    copyPlain(arg);
  });

  ipcMain.on('change-hide-hotkey', function(event, arg) {
    unregisterhidekey(arg);
    hideShow(arg);
  });


  // Unfortunately, because of a limitation, CTRL + C cannot be captured because it overwrites the system default copy shortcut.
  function copyPlain(hotkey) {
    globalShortcut.register(hotkey, function() {
      mainWindow.webContents.send('copied', clipboard.readText());
      notification(hotkey);
    });
  }


  // notifications
  function notification(content) {
    if (notiftoggle == 'true') {
      notifier.notify({
        title: 'Content copied!',
        message: clipboard.readText(),
        icon: path.join(__dirname, '/assets/images/logo.png'),
        sound: false,
        wait: false
      }, function(err, response) {
        if (err) {
          console.log("Cannot send notification: " + err);
        }
      });
    }
  }

  // var retPlain = globalShortcut.register('CmdorCtrl+Alt+C', function() {
  //   mainWindow.webContents.send('copied', clipboard.readText());
  // });
  // if (!retPlain) {
  //   console.log('registration failed');
  // }

  function hideShow(hotkey) {
    globalShortcut.register(hotkey, function() {
      if (mainWindow.isVisible() === true) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    });
  }

  ipcMain.on('quit', function() {
    app.quit();
  });

  ipcMain.on('readyhide', function(event, arg) {
    unregisterhidekey(arg);
    hideShow(arg);
  });

  ipcMain.on('readycopy', function(event, arg) {
    unregistercopykey(arg);
    copyPlain(arg);
  });

  ipcMain.on('shownotif', function(event, arg) {
    notiftoggle = arg;
  });


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    app.quit();
  });

});
