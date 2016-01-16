# clipboard-manager
A simple cross platform clipboard manager created in Electron

### Features
* It saves images!
* Can show the content as QR Codes

### Installation instructions
```
git clone https://github.com/dmfarcas/clipboard-manager.git 
npm install
npm start
```


### Known bugs
* Image saving is not async - it freezes the app for a second or two.
* A weird case in which the window loses focus, and it's gone until it's focused manually. Huh.
* Database sometimes decides to go crazy. Might be my fault, either way it'll be moved to mongodb or something.
