'use strict';

var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd();
var Doc = new LinvoDB("doc", { text: String, time: Date});
var doc = new Doc();


// receiving events from main process
require('electron').ipcRenderer.on('copied', function(event, message) {
appendRow(message);
});


// Initial database loading + temp bugfix
Doc.find({}).sort({time: 1}).filter(e => (e.text !== undefined)).exec(function (err, docs) {
  if(err) {
    console.error("Cannot load database.");
  }
  for (var i = 0; i < docs.length; i++) {
    populateTable(docs[i].text, moment.unix(docs[i].time).format("HH:MM:ss"));
  }
});


function appendRow(text) {
  var time = moment().unix();
  populateTable(text, moment.unix(time).format("HH:MM:ss"));

  Doc.save([ doc, { text: text, time: time } ], function(err, docs) {
    if(err) {
      console.error("Something went wrong while saving data.");
    }
  });
}


function populateTable(text, time) {
  var table=document.getElementById('dasTable');
  var row=table.insertRow(1);
  var textCell=row.insertCell(0);
  var timeCell=row.insertCell(1);
  textCell.setAttribute('contenteditable', 'true');
  textCell.setAttribute('onclick', 'copyText();');
  var newText  = document.createTextNode(text);
  textCell.appendChild(newText);
  timeCell.innerHTML = time;
}


function copyText() {
  document.execCommand('selectAll',false,null);
  document.execCommand('Copy', false, null);
  // too lazy to use jQuery
  document.getElementById('copied').style.visibility = "visible";
  setTimeout(function(){ document.getElementById('copied').style.visibility = "hidden"; }, 300);
}
