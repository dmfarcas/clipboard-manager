# clipboard-manager
A simple cross platform clipboard manager.

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

 
 
Works on OS X, Windows and Linux. Tested only on Arch Linux + KDE and OSX, though.

### To do
* Paste formatted text. Without executing the javascript that's contained, that is.
* Pagination
* Notifications
* More image formats. Image Magick would be required tho
* Image tagging
* Macro shortcuts

### Known bugs
* Image saving is not async - it freezes the app for a second or two.
* A weird case in which the window loses focus, and it's gone until it's focused manually. Huh. Doesn't happen on OSX, dunno about Windows.
