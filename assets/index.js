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


let method = (() => {
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
function init() {
  // Why am I doing this to myself... Oh well:
  $("#settings").hide();
  $( "<table id=\"dasTable\"></table>" ).appendTo( "#container" );
  $("#dasTable").addClass("centered striped");
  $("<thead></thead").appendTo("#dasTable");
   $("<tr></tr>").appendTo("thead");
   $("<th id=\"contents\"></th>").appendTo("tr").text("Contents");
   $("<th id=\"functions\"></th>").appendTo("tr").text("");
   // Is there such a thing as too much jQuery?
   $("<th></th>").appendTo("tr").text("Time");
   $("<th hidden></th>").appendTo("tr").text("");
   $("<tbody></tbody>").appendTo("#dasTable");
   $("<tr></tr>").appendTo("tbody");
  Doc.find({}).sort({time: 1})
  .filter(e => (e.text !== undefined))
  .map(res => {populateTable(res.text, moment.unix(res.time).format("HH:MM:ss"), res._id);})
  .exec(function(err, res) {
  });
}


function home() {
  $('.button-collapse').sideNav('hide');
  $("#settings").hide();
  $("#container").show();
}


function settings() {
  $("#container").hide();
  $('.button-collapse').sideNav('hide');
  $('#settings').show();
}


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
                                                    '<i class="controlIcons fa fa-pencil"></i>' +
                                                    '<i class="controlIcons fa fa-qrcode"></i>' +
                                                    '<i class="controlIcons fa fa-trash-o"></i>' +
                                                    '</td><td>' +
                                                    time +
                                                    '</td><td hidden>' +
                                                    id +                                                                // a hidden ID is needed for update and delete functions
                                                    '</td></tr>');
  $(".controlIcons").addClass("hidden");
  $("td").closest('tr').children('td:eq(0)').click(function(){
    let currText = $(this).text();
    copyText(currText);
  });
  $("tr").hover(function() {
      $(this).find(".controlIcons").removeClass("hidden");
  }, function() {
    $(this).find(".controlIcons").addClass("hidden");
  });
  // Remove row function
  $(".fa-trash-o").unbind().click(function(){
    let id = $(this).closest('tr').find('td:nth-child(4)').text();
    $(this).closest('tr').remove();
    method.delRow(id);
    Materialize.toast('Deleted!', 2000);
  });
  // Update function
  $(".fa-pencil").unbind().click(function(e){
    e.stopImmediatePropagation();
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
      Materialize.toast('Done!', 2000);
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
  init();
  $(".hider").click(function() {
    $('.cardcontainer').hide();
  });
  $(".button-collapse").sideNav();

});
