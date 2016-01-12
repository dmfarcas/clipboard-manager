'use strict';

// Database
var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd();
var Doc = new LinvoDB("doc", { text: String, time: Date});
var doc = new Doc();

const clipboard = require('electron').clipboard;

// QR Imagconst clipboard = require('electron').clipboard;
// var qr = require('qr-image');
// var fs = require('fs');


// receiving events from main process
require('electron').ipcRenderer.on('copied', function(event, message) {
  appendRow(message);
});


let method = (function() {
  let delRow = function(id) {
    Doc.remove({ _id: id }, {}, function (err, numRemoved) {
      doc.save(function(err) { /* saving the document */ });
      console.log("This is the item's ID that will be deleted: " + id);
    });
  };
  let updateRow = function(id, text) {
    Doc.update({ _id: id }, { $set: { text: text } }, function (err, numReplaced) {
      doc.save(function(err) { /* saving the document */ });
});
    console.log("This is the update function." + id);
  };
  let qrcode = function() {
    console.log("This is the qrcode function.");
  };
  return {
    delRow: delRow,
    updateRow: updateRow,
    qrcode: qrcode
  };
})();

// Initial database loading + temp bugfix

Doc.find({}).sort({time: 1}).filter(e => (e.text !== undefined)).exec(function (err, docs) {
  if(err) {
    console.error("Cannot load database.");
  }
  for (var i = 0; i < docs.length; i++) {
    populateTable(docs[i].text, moment.unix(docs[i].time).format("HH:MM:ss"), docs[i]._id);
  }
});



function appendRow(text) {
  var time = moment().unix();
  Doc.save([ doc, { text: text, time: time } ], function(err, docs) {
    populateTable(docs[1].text, moment.unix(time).format("HH:MM:ss"), docs[1]._id);
    console.log("The id: " + docs[1]._id);
    if(err) {
      console.error("Something went wrong while saving data.");
    }
  });
}


function populateTable(text, time, id) {
  // to do: populate table with \n as well
  $('#dasTable').prepend('<tr><td>' + text +
                                                    '</td><td>' +
                                                    '<i class="fa fa-pencil"></i>' +
                                                    '<i class="fa fa-qrcode"></i>' +
                                                    '<i class="fa fa-trash-o"></i>' +
                                                    '</td><td>' +
                                                    time +
                                                    '</td><td hidden>' +
                                                    id +                                                                // a hidden ID is needed for update and delete functions
                                                    '</td></tr>');
  $("i").addClass("hidden");
  $("td").closest('tr').children('td:eq(0)').click(function(){
    let currText = $(this).text();
    copyText(currText);
  });
  $("tr").hover(function() {
      $(this).find("i").removeClass("hidden");
  }, function() {
    $(this).find("i").addClass("hidden");
  });
  // Remove row function
  $(".fa-trash-o").unbind().click(function(){
    let id = $(this).closest('tr').find('td:nth-child(4)').text();
    $(this).closest('tr').remove();
    method.delRow(id);
  });
  // Update function
  $(".fa-pencil").unbind().click(function(){
    let id = $(this).closest('tr').find('td:nth-child(4)').text();
    let editText = $(this).closest('tr').find('td:nth-child(1)').text();
    let self = this;
    $('#editContent').openModal();
    $("#modalContent").val(editText);
    $("#modalContent").trigger('autoresize');
    //Update database when done is clicked
    $('#editDone').unbind().click(function() {
      let newText = $("#modalContent").val();
      method.updateRow(id, newText);
      $(self).closest('tr').find('td:nth-child(1)').text(newText);
      $('#editContent').closeModal();
    });
  });
  //QR Code goes here...
}


// to fix: some write text things eg. the clipboard writes only unformatted text
function copyText(text) {
  clipboard.writeText(text);
  Materialize.toast('Copied to clipboard!', 2000);
}


$(function() {
  $(".hider").click(function() {
    $('.cardcontainer').hide();
  });
});
