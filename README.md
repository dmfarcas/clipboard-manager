# clipboard-manager
A simple cross platform clipboard manager created in Electron

### Installation instructions
```
git clone https://github.com/dmfarcas/clipboard-manager.git 
npm install
npm start
```

### Features
You can copy text

 
![Copy](https://media.giphy.com/media/Je0VtvAOii8JG/giphy.gif "Copy")

...and images!

![image](https://media.giphy.com/media/cfFkywZVc8sRq/giphy.gif "Image")


Edit clipboard


![image](https://media.giphy.com/media/142v5imr1LgVoY/giphy.gif "Image")


QR Codes!

![image](https://media.giphy.com/media/dS24CPNRrJE88/giphy.gif "Image")

 
 
Works on OS X, Windows and Linux. Tested only on Arch Linux + KDE, though.

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
