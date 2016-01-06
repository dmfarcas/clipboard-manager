// receiving events from main process
require('electron').ipcRenderer.on('copied', function(event, message) {
appendRow(message);
});


function appendRow(text) {
  const clipboard = require('electron').clipboard;
  var table=document.getElementById('dasTable');
  var row=table.insertRow(1);
  var newCell=row.insertCell(0);
  var newCell2=row.insertCell(1);
  newCell.setAttribute('contenteditable', 'true');
  // It works, hooray.
  newCell.setAttribute('onclick', 'copyText();');
  var newText  = document.createTextNode(text);
  newCell.appendChild(newText);
  newCell2.innerHTML = moment().format("HH:MM:ss");
}


function copyText() {
  document.execCommand('selectAll',false,null);
  document.execCommand('Copy', false, null);
  // too lazy to use jQuery
  document.getElementById('copied').style.visibility = "visible";
  setTimeout(function(){ document.getElementById('copied').style.visibility = "hidden"; }, 300);
}
