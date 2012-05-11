$(function() {
  var document_last_text = null;

  function load_document() {
    if($("#key").val() == "") return;

    if($.localStorage.get("bloopletech-wedit-document") != null) {
      text = $.localStorage.get("bloopletech-wedit-document");
      $("#editor").val(text);
      document_last_text = text;
      $("#save-status").text("Loaded from cache; save overwrites");
      alert("Loaded document from cache, not server. Saving it will override the version on the server, even if " +
       "the version on the server has been updated since you last worked on it.");
    }
    else {
      $.ajax("/api.php", {
        data: {
          action: "load",
          key: $("#key").val()
        },
        success: function(text) {
          $("#editor").val(text);
          document_last_text = text;
          $("#save-status").text("Loaded and up to date");
        },
        error: function() {
          document_last_text = "";
          $("#save-status").text("Could not load; refresh to retry");
          alert("Could not load document from server. Adding any text and then saving it will override the version "
           + "on the server.");
        }
      });
    }
  }

  function save_document() {
    if($("#key").val() == "") return;

    var text = $("#editor").val(); 
    if(text == document_last_text && $.localStorage.get("bloopletech-wedit-document") == null) return;
    $.ajax("/api.php", {
      data: {
        action: "save",
        key: $("#key").val(),
        text: text
      },
      type: 'POST',
      success: function() {
        document_last_text = text;
        $.localStorage.set("bloopletech-wedit-document", null, 1000 * 3600 * 24 * 365);
        $("#save-status").text("Saved and up to date");     
      },
      error: function() {
        document_last_text = text;
        $.localStorage.set("bloopletech-wedit-document", text, 1000 * 3600 * 24 * 365);
        $("#save-status").text("Could not be saved; cached in browser");
      }
    });
  }

  window.setInterval(save_document, 60000);

  $(document).keydown(function(event) {
    if (!( String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey) && !(event.which == 19)) return true;
    save_document();
    event.preventDefault();
    return false;
  });

  function check_save_document() {
    if($("#editor").val() != document_last_text) $("#save-status").text("Unsaved");
  }

  window.setInterval(check_save_document, 1000);

  window.onbeforeunload = function() {
    return ($("#editor").val() != document_last_text) ? "Your document is unsaved, please save it before leaving this page." : null;
  };

  function word_count() {
    var s = $("#editor").val();
    var wc = !s ? 0 : (s.split(/^\s+$/).length === 2 ? 0 : 2 + s.split(/\s+/).length - s.split(/^\s+/).length - s.split(/\s+$/).length);
    $("#word-count").text(wc + (wc == 1 ? " word" : " words"));
  }

  window.setInterval(word_count, 1000);
  word_count();

  $(window).resize(function() {
    $("#editor").css("height", $(window).height() - 30);
  }).resize();


  $("#key").change(function() {
    $.localStorage.set("bloopletech-wedit-key", $("#key").val(), 1000 * 3600 * 24 * 365);
    load_document();
  });
  var key = $.localStorage.get("bloopletech-wedit-key");
  if(key == null) key = "key-" + Math.random().toString(36).substring(10); 
  $("#key").val(key).change();

  check_save_document();

  $("#editor").focus();
});
