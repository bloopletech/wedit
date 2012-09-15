$(function() {
  var key_prefix = "bloopletech-wedit-";

  function load_key(key) {
    var value = $.localStorage.get(key_prefix + key);
    save_key(key, value);
    return value;
  }

  function save_key(key, value) {
    $.localStorage.set(key_prefix + key, value, 1000 * 3600 * 24 * 365);
  }

  function generate_key() {
    var out = "";
    var rand_chars = "abcdefghijkmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 7; i++) out += rand_chars.charAt(Math.floor(Math.random() * rand_chars.length + 1) - 1);
    return out;
  }

  var document_last_text = null;
  var lock = generate_key();
  var lock_violated = false;

  function load_document() {
    if($("#key").val() == "") return;

    if(load_key("document") != null) {
      var text = load_key("document");
      $("#editor").val(text);
      document_last_text = text;
      save_key("document", null);
      $("#save-status").text("Loaded cache from browser ✓");
      alert("Loaded cached version of your document; you can save the document, overwriting "
       + "the version online, or reload the page, which will delete your cached version.");
      return;
    }

    lock = generate_key();

    $.ajax("/api.php", {
      data: {
        action: "load",
        key: $("#key").val(),
        lock: lock
      },
      success: function(text) {
        $("#editor").val(text);
        document_last_text = text;
        $("#save-status").text("Loaded ✓");
      },
      error: function() {
        document_last_text = "";
        $("#save-status").text("Could not load; refresh to retry");
        alert("Could not load online version of your document. Please reload the page. Saving your document will override the version online.");
      }
    });
  }

  function export_document() {
    location.href = "/api.php?action=export&key=" + encodeURIComponent($("#key").val());
  }

  function save_document() {
    if($("#key").val() == "" || lock_violated) return;

    var text = $("#editor").val(); 
    if(text == document_last_text) return;
    $.ajax("/api.php", {
      data: {
        action: "save",
        key: $("#key").val(),
        lock: lock,
        text: text
      },
      type: 'POST',
      success: function() {
        document_last_text = text;
        save_key("document", null);
        $("#save-status").text("Saved ✓");
      },
      error: function(xhr) {
        document_last_text = text;
        save_key("document", text);

        if(xhr.status == 409) {
          lock_violated = true;
          window.clearInterval(save_interval);
          alert("This document is now being edited in another location. To prevent changes being lost, "
           + "this document will not save. Instead, refresh the page to reload the document and allow editing.");  
        }

        $("#save-status").text("Could not be saved; cached in browser");
      }
    });
  }

  var save_interval = window.setInterval(save_document, 300000);

  $(document).keydown(function(event) {
    if (!(String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey) && !(event.which == 19)) return true;
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
    $("#editor").css("height", $(window).height() - 28);
  }).resize();


  $("#key").change(function() {
    save_key("key", $("#key").val());
    load_document();
  });

  $("#key-new").click(function(e) {
    $("#key").val(generate_key()).change();
    e.preventDefault();
  });

  $("#key-export").click(function(e) {
    export_document();
    e.preventDefault();
  });

  $("#key").val(load_key("key") || generate_key()).change();

  $("#editor").focus();
});
