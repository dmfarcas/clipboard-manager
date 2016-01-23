# clipboard-manager
A simple cross platform clipboard manager created in Electron

### Features
* It saves images!
* Can show the content as QR Codes
* Works on OS X, Windows and Linux. Tested only on Arch Linux + KDE, though.

### Installation instructions
```
git clone https://github.com/dmfarcas/clipboard-manager.git 
npm install
npm start
```
### To do
* Paste formatted text. Without executing the javascript that's contained, that is.
* Pagination
* Change database to mongo, load the database into an array or whatever.
* Notifications
* Modal to show image larger?
* More image formats. Image Magick would be required tho
 
### Known bugs
* Image saving is not async - it freezes the app for a second or two.
* A weird case in which the window loses focus, and it's gone until it's focused manually. Huh.
* Database sometimes decides to go crazy. Might be my fault, either way it'll be moved to mongodb or something.
