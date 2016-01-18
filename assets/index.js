'use strict';

// Database
let LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd();
let Doc = new LinvoDB("doc", { text: String, time: Date});
let doc = new Doc();

let htmlspecialchars = require('htmlspecialchars');

// receiving events from main process
const ipcRender = require('electron').ipcRenderer;
const clipboard = require('electron').clipboard;
const shell = require('electron').shell;
const nativeImage = require('electron').nativeImage;

let fs = require('fs');

let rmdir = require('rimraf');

 fs.stat('doc.db/images', function(err, stat) {
     if(err === null) {
         console.log('File exists!');
     } else if(err.code == 'ENOENT') {
       fs.mkdirSync("doc.db/images");
     } else {
         console.log('Error: ', err.code);
     }
 });

ipcRender.on('copied', function(event, message) {
  appendRow(message);
});


let method = (() => {
  let delRow = (id) => {
    // got to query in case there is a png in the database, didn't find any better way with LinvoDB
    Doc.findOne({ _id: id }, function (err, doc) {
      if (doc.text.startsWith("doc.db/images/image")) {
        fs.unlink(doc.text, function(res, error) {
          console.log(error);
        });
      }
      if (err) {
        console.log(err);
      }
    });
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
  };
  let qrcode = (text) => {
    let qr = require('qr-image');
    let qr_svg = qr.image(text, { type: 'svg' });
    qr_svg.pipe(fs.createWriteStream('assets/images/qr_code.svg'));
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
  $("#dasTable").addClass("striped");
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


function checkFormat() {
  let contentType =  clipboard.availableFormats();
  if (jQuery.inArray( "image/png", contentType) !== -1) {
    return "image/png";
  }
  if (jQuery.inArray( "text/plain", contentType) !== -1) {
    return "text/plain";
  }
  if (jQuery.inArray( "text/html", contentType) !== -1) {
    return "text/html";
  }
  if (contentType.length === 0) {
    return "blank";
  }
}

function appendRow(text) {
  var time = moment().unix();
  if (checkFormat() === "image/png") {
    // quick and dirty file name generator
    let counterinit = 0;
    let filenumber = parseInt(localStorage.pictureCounter) + counterinit;
    localStorage.pictureCounter++;
    let filename = 'doc.db/images/image' + localStorage.pictureCounter + '.png';
    // write clipboard contents to file, saving it as PNG... while hanging a few seconds
    // because the function seems to be synchronous...
    // graphics magix or easy image?
    let picture = clipboard.readImage().toPng();
    fs.writeFile(filename, picture, function (err) {
            if (err)
                throw err;
            console.log('Save successful!');
        });
    Doc.save([ doc, { text: filename, time: time } ], function(err, docs) {
      populateTable(docs[1].text, moment.unix(time).format("HH:MM:ss"), docs[1]._id);
      if(err) {
        console.error("Something went wrong while saving data.");
      }
    });
   }

 if (checkFormat() === "text/plain" || checkFormat() === "text/html") {
   Doc.save([ doc, { text: text, time: time } ], function(err, docs) {
     populateTable(docs[1].text, moment.unix(time).format("HH:MM:ss"), docs[1]._id);
     if(err) {
       console.error("Something went wrong while saving data.");
     }
   });

  }
}


function populateTable(text, time, id) {
  let item;
  if(text.startsWith("doc.db/images/")) {
    item = "<img id=\"picture\" src=\"" + text + "\">";
    $('#dasTable')
    .prepend('<tr><td>' + item +
                        '</td><td>' +
                        '<i class="controlIcons fa fa-trash-o"></i>' +
                        '</td><td>' + time + '</td>' +
                        '<td hidden>' + id + '</td></tr>');
  }
  else {
    item = htmlspecialchars(text);
    $('#dasTable')
    .prepend('<tr><td>' + item +
                        '</td><td>' +
                        '<i class="controlIcons fa fa-pencil"></i>' +
                        '<i class="controlIcons fa fa-qrcode"></i>' +
                        '<i class="controlIcons fa fa-trash-o"></i>' +
                        '</td><td>' + time + '</td>' +
                        '<td hidden>' + id + '</td></tr>');
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
    // qr code function
     $(".fa-qrcode").unbind().click(function() {
       let text = $(this).closest('tr').find('td:nth-child(1)').text();
       method.qrcode(text);
       $("#qrimg").hide();
       $('#qrcode').openModal();
       // Poor man's promise
       setTimeout(() => {
         // update image name so it doesn't get one from cache
         $("#qrimg").attr("src", "assets/images/qr_code.svg?"+ Math.random());
         $("#qrimg").show();
       }, 100);
     });
    }

  $(".controlIcons").addClass("hidden");
  $("td").closest('tr').children('td:eq(0)').click(function() {
    // assign the selection as plaintext or html, but if it's null(e.g an image) it'll get the image's source
    let selection = $(this).text();
    if ($(this).text() === '')
      selection = $(this).children('img').attr('src');
    copyText(selection);
  });

  // Controls appear on hover, and disappear on hoverout
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
}


// to fix: some write text things eg. the clipboard writes only unformatted text sometimes
function copyText(text) {
  if (text.startsWith("doc.db/images")) {
    // var stream = fs.createWriteStream(text);
    clipboard.writeImage(text);
  } else {
  clipboard.writeText(text);
  }
  Materialize.toast('Copied to clipboard!', 2000);
}


function changeHotKeys(event, hotkey) {
  ipcRender.send(event, hotkey);
}

function copyShortcut(hotkey) {
  localStorage.copyshortcut = hotkey;
  $("#copycurrshortcut").text(localStorage.copyshortcut);
  changeHotKeys('change-copy-hotkey', hotkey);
}

function quitapp() {
  ipcRender.send('quit');
  Doc.store.db.db.compact(function() { /* now you can exit*/ });
}

// this REALLY needs to be refactored
$(() => {
  init();
  let newcopyshortcut;
  if (!localStorage.hidehotkey) {
    localStorage.hidehotkey = "F10";
  }
  if (!localStorage.copyshortcut) {
    localStorage.copyshortcut = "CmdorCtrl+Shift+C";
  }
  if (!localStorage.time) {
    localStorage.time = "HH:MM:ss";
  }
  if (!localStorage.notif) {
    localStorage.notif = "true";
  }
  ipcRender.send('readyhide', localStorage.hidehotkey);
  ipcRender.send('readycopy', localStorage.copyshortcut);
  ipcRender.send('shownotif', localStorage.shownotif);
  $('select').material_select();
  // getting local storage stuff
  $("#time").val(localStorage.time);
  $(".copycurrshortcut").text(localStorage.copyshortcut);
  $(".hidecurrshortcut").text(localStorage.hidehotkey);
  $("#notiftoggle").prop('checked', localStorage.notif);
  $("#clearform").hide();

  // readme closer
  $(".hider").click(() => {
    localStorage.hidetips = 1;
    $('.cardcontainer').hide();
  });
  if (localStorage.hidetips)
    $('.cardcontainer').hide();


  $(".button-collapse").sideNav();
  $( "#time" ).hide();

  // moment js edit confirmation
  if ($("#advTime").val() !== 'undefined') {
    $("#time").show();
    $("#advTime").hide();
  } else {
    $("#advTime").click(() => {
      $("#time").show();
      $("#advTime").hide(200);
    });
  }

  // set time on keyup
  $("#time").keyup(function() {
    localStorage.time = $("#time").val();
  });

  // Search function
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

  $("#notiftoggle").on('change', function() {
    localStorage.notif = $(this).prop('checked');
  });

  $("#changehidehotkey").on('change', () => {
    let newhotkey = $("#changehidehotkey option:selected").text();
    localStorage.hidehotkey = newhotkey;
    $("#hidecurrshortcut").text(localStorage.hidehotkey);
    changeHotKeys('change-hide-hotkey', newhotkey);
  });
  $("#csecondkey").keyup(function() {
  });

  // string logic. lots of it.
  $("#cletter").keyup(function(event) {
    if ($("#cletter").val() !== "" || (event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode >= 65 && event.keyCode <= 90)) {
      if ($("#csecondkey option:selected").text() === "DISABLED"){
      newcopyshortcut = "CmdorCtrl" + "+" +
        $("#cletter").val();
        localStorage.copyshortcut = newcopyshortcut;
        copyShortcut(newcopyshortcut);

      } else {
      localStorage.csecondkey = $("#csecondkey option:selected").text();
      newcopyshortcut = "CmdorCtrl" + "+" +
        $("#csecondkey option:selected").text() + "+" +
        $("#cletter").val();
        localStorage.copyshortcut = newcopyshortcut;
        copyShortcut(newcopyshortcut);

      }
    }
  });
  // but wait, there's more!
  $("#csecondkey").on('change', () => {
    if ($("#cletter").val() !== "") {
      if ($("#csecondkey option:selected").text() === "DISABLED"){
      newcopyshortcut = "CmdorCtrl" + "+" +
        $("#cletter").val();
        localStorage.copyshortcut = newcopyshortcut;
        copyShortcut(newcopyshortcut);

      } else {
      newcopyshortcut = "CmdorCtrl" + "+" +
        $("#csecondkey option:selected").text() + "+" +
        $("#cletter").val();
        copyShortcut(newcopyshortcut);
        localStorage.copyshortcut = newcopyshortcut;
      }
    }
  });

  // Delete database
  $("#deletedatabase").click(() => {
    $("#deleteconfirm").openModal();
  });
  $("#confirmdelete").click(() => {
    Doc.remove({ }, { multi: true }, function (err, numRemoved) {
      console.log("Removed: " + numRemoved);
    });
    rmdir("doc.db/images/*", function(error){
      console.log("Deletion info: " + error);
    });
  });
});
