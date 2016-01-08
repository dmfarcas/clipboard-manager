'use strict';

var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd();
var Doc = new LinvoDB("doc", { /* schema, can be empty */ })
var doc = new Doc();

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

  Doc.save([ doc, { paste: text } ], function(err, docs) {

});

}


function copyText() {
  document.execCommand('selectAll',false,null);
  document.execCommand('Copy', false, null);
  // too lazy to use jQuery
  document.getElementById('copied').style.visibility = "visible";
  setTimeout(function(){ document.getElementById('copied').style.visibility = "hidden"; }, 300);
}
