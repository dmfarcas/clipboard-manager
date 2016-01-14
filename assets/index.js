'use strict';

// Database
var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd();
var Doc = new LinvoDB("doc", { text: String, time: Date});
var doc = new Doc();

const clipboard = require('electron').clipboard;
const shell = require('electron').shell;

// receiving events from main process
require('electron').ipcRenderer.on('copied', function(event, message) {
  appendRow(message);
});


let method = (() => {
  let delRow = (id) => {
    Doc.remove({ _id: id }, {}, function (err, numRemoved) {
      doc.save(function(err) {
        if (err) {
          console.error("Delete error:" + err);
        }
      });
      console.log("This is the item's ID that will be deleted: " + id);
    });
  };
  let updateRow = (id, text) => {
    Doc.update({ _id: id }, { $set: { text: text } }, function (err, numReplaced) {
      doc.save(function(err) { /* saving the document */ });
});
    console.log("This is the update function." + id);
  };
  let qrcode = (text) => {
    let fs = require('fs');
    let qr = require('qr-image');
    let qr_svg = qr.image(text, { type: 'svg' });
    qr_svg.pipe(fs.createWriteStream('assets/images/qr_code.svg'));
    console.log("This is the qrcode function." + text);
  };

  return {
    delRow: delRow,
    updateRow: updateRow,
    qrcode: qrcode
  };
})();

// Initial database loading
function init() {
  $("#searchbar").show();
  $('.brand-logo').text("Clipboard Manager");
  $('.button-collapse').sideNav('hide');
  $('#settings').hide();
  $("#container").html("");
  $( "<table id=\"dasTable\"></table>" ).appendTo( "#container" );
  $("#dasTable").addClass("centered striped");
  $("<thead></thead").appendTo("#dasTable");
   $("<tr></tr>").appendTo("thead");
   $("<th id=\"contentsth\"></th>").appendTo("tr").text("Contents");
   $("<th id=\"functionsth\"></th>").appendTo("tr").text("");
   // Is there such a thing as too much jQuery?
   $("<th id=\"timeth\"></th>").appendTo("tr").text("Time");
   $("<th hidden></th>").appendTo("tr").text("");
   $("<tbody></tbody>").appendTo("#dasTable");
   $("<tr></tr>").appendTo("tbody");
  if ($("#search").val()) {
    search($("#search").val());
  } else {
    populate();
  }
}

function populate() {
  Doc.find({}).sort({time: 1})
  .filter(e => (e.text !== undefined))
  .map(res => {populateTable(res.text, moment.unix(res.time).format($("#time").val()), res._id);})
  .exec(function(err, res) {
  });
}

function search(str) {
  let regex = new RegExp(str,"i");
  $("#dasTable > tbody").empty();
  Doc.find({}).sort({time: 1})
  .filter(e => (e.text !== undefined && e.text.match(regex)))
  .map(res => {populateTable(res.text, moment.unix(res.time).format($("#time").val()), res._id);})
  .exec(function(err, res) {
  });
}

function settings() {
  $("#searchbar").hide("");
  $("#container").html("");
  $('.button-collapse').sideNav('hide');
  $('#settings').show();
  $('.brand-logo').text("Settings");
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
  $("td").closest('tr').children('td:eq(0)').click(function() {
    let currText = $(this).text();
    copyText(currText);
  });
  $("tr").hover(function() {
      $(this).find(".controlIcons").removeClass("hidden");
  }, function() {
    $(this).find(".controlIcons").addClass("hidden");
  });
  // Remove row function
  $(".fa-trash-o").unbind().click(function() {
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
   $('#editDone').unbind().click(() => {
     let newText = $("#modalContent").val();
     method.updateRow(id, newText);
     $(this).closest('tr').find('td:nth-child(1)').text(newText);
     $('#editContent').closeModal();
     Materialize.toast('Done!', 2000);
   });
 });

   $(".fa-qrcode").unbind().click(function() {
     let text = $(this).closest('tr').find('td:nth-child(1)').text();
     method.qrcode(text);
     $("#qrimg").hide();
     $('#qrcode').openModal();
     // Poor man's promise
     setTimeout(() => {
       $("#qrimg").attr("src", "assets/images/qr_code.svg?"+ Math.random());
       $("#qrimg").show();
     }, 100);
   });
}


// to fix: some write text things eg. the clipboard writes only unformatted text sometimes
function copyText(text) {
  clipboard.writeText(text);
  Materialize.toast('Copied to clipboard!', 2000);
}


$(() => {
  init();
  $("#clearform").hide();
  $(".hider").click(() => {
    $('.cardcontainer').hide();
  });
  $(".button-collapse").sideNav();
  $( "#time" ).val("HH:MM:ss").hide();
  $("#advTime").click(() => {
    $("#time").show();
    $("#advTime").hide(200);
  });
  $("#search").focus(() => {
    $("#clearform").show();
  }).focusout(() => {
    $("#clearform").hide(200);
  });

  $("#search").keyup(function() {
    let timer;
    clearTimeout(timer);
    let ms = 150; // milliseconds
    let val = this.value;
    timer = setTimeout(function() {
      search(val);
    }, ms);
  });
  $("#clearform").click(() => {
    $("#search").val('');
    init();
  });

});
