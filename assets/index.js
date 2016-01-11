'use strict';

// Database
var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd();
var Doc = new LinvoDB("doc", { text: String, time: Date});
var doc = new Doc();


// QR Images
var qr = require('qr-image');
var fs = require('fs');


// receiving events from main process
require('electron').ipcRenderer.on('copied', function(event, message) {
appendRow(message);
});


let method = (function() {
  let delRow = function(id) {
    // Doc.remove({ _id: id }, {}, function (err, numRemoved) {
      console.log("This is the item's ID that will be deleted: " + id);
// });
    init();
  };
  let updateRow = function() {
    console.log("This is the update function.");
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
function init () {
  Doc.find({}).sort({time: 1}).filter(e => (e.text !== undefined)).exec(function (err, docs) {
    if(err) {
      console.error("Cannot load database.");
    }
    for (var i = 0; i < docs.length; i++) {
      populateTable(docs[i].text, moment.unix(docs[i].time).format("HH:MM:ss"), docs[i]._id);
    }
  });
}
init();


function appendRow(text) {
  var time = moment().unix();
  populateTable(text, moment.unix(time).format("HH:MM:ss"));
  Doc.save([ doc, { text: text, time: time } ], function(err, docs) {
    if(err) {
      console.error("Something went wrong while saving data.");
    }
  });
}


function populateTable(text, time, id) {
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
    copyText();
  });
  $("tr").hover(function() {
      $(this).find("i").removeClass("hidden");
  }, function() {
    $(this).find("i").addClass("hidden");
  });
  $(".fa-trash-o").click(function(){
    let id = $(this).closest('tr').find('td:nth-child(4)').text();
    method.delRow(id);
  });

}


// function getQR(text) {
//   var code = qr.image(text, { type: 'svg' });
//   var output = fs.createWriteStream('qr.svg');
// }


function copyText() {
  document.execCommand('Copy', false, null);
  $('#copied').fadeIn("fast");
  setTimeout(function(){ $('#copied').css({"display":"none"}); }, 400);
}
