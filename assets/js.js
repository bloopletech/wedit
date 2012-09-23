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
    var rand_chars = "ABCDEFGHIJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 7; i++) out += rand_chars.charAt(Math.floor(Math.random() * rand_chars.length + 1) - 1);
    return out;
  }

  function document_id() {
    return "document-" + $("#key").val().replace(/[^A-Za-z0-9]+/, "_");
  }

  var document_last_text = null;

  function sync() {
    if($("#key").val() == "") return;

    if($("#editor").val() == document_last_text) {
      load_document_online();
    }
    else {
      save_document_online();
    }
  }

  function edit_document(text) {
    $("#editor").val(text).focus();
    $("#editor").caret(parseInt(load_key(document_id() + "-caret")));
    save_key(document_id(), text);
    document_last_text = text;
  }

  function load_document_locally() {
    console.log("Loading document locally");
    var text = load_key(document_id());
    if(text == null) {
      load_document_online();
    }
    else {
      edit_document(text);
      $("#local-save-status").text("Loaded ✓");
    }
  }

  function load_document_online() {
    console.log("Loading document online");
    var text = load_key(document_id());

    $.ajax("/api.php", {
      data: {
        action: "load",
        key: $("#key").val(),
        last_modified: load_key(document_id() + "-last-modified")
      },
      complete: function(xhr, status) {
        if(status == "success") {
          if(xhr.status == 200) text = xhr.responseText;
          $("#online-save-status").text("Loaded ✓");
        }
        else {
          $("#online-save-status").text("Failed ⚠");
        }

        edit_document(text);
      }
    });
  }

  function finish_edit_document() {
    var text = $("#editor").val();
    save_key(document_id(), text);
    save_key(document_id() + "-last-modified", (new Date().getTime()));
    save_key(document_id() + "-caret", $("#editor").caret());
  }

  function save_document_locally() {
    if($("#editor").val() == document_last_text) return;
    console.log("Saving document locally");
    finish_edit_document();
    $("#local-save-status").text("Saved ✓");
  }

  window.setInterval(save_document_locally, 10000);

  function save_document_online() {
    console.log("Saving document online");
    save_document_locally();
    var text = $("#editor").val();
    if(text == document_last_text) return;

    $.ajax("/api.php", {
      data: {
        action: "save",
        key: $("#key").val(),
        text: text,
        last_modified: load_key(document_id() + "-last-modified")
      },
      type: 'POST',
      success: function() {
        $("#online-save-status").text("Saved ✓");
        document_last_text = text;
      },
      error: function(xhr) {
        $("#online-save-status").text("Failed ⚠");
        document_last_text = text;
      }
    });
  }

  function export_document() {
    location.href = "/api.php?action=export&key=" + encodeURIComponent($("#key").val());
  }

  $(document).keydown(function(e) {
    if(!(String.fromCharCode(e.which).toLowerCase() == 's' && e.ctrlKey) && !(e.which == 19)) return true;
    sync();
    e.preventDefault();
    return false;
  });

  function check_save_document() {
    if($("#editor").val() != document_last_text) $("#local-save-status, #online-save-status").text("Unsaved");
  }

  window.setInterval(check_save_document, 1000);

  window.onbeforeunload = function() {
    return ($("#editor").val() != document_last_text) ? "Your document is unsaved, please save it before leaving this page." : null;
  };

  function statistics() {
    var s = $("#editor").val();
    var wc = !s ? 0 : (s.split(/^\s+$/).length === 2 ? 0 : 2 + s.split(/\s+/).length - s.split(/^\s+/).length - s.split(/\s+$/).length);
    $("#statistics").text(($.digits(wc) + (wc == 1 ? " word" : " words")) + " / " + $.format_bytes($.bytesize(s)));
  }

  window.setInterval(statistics, 1000);
  statistics();

  $(window).resize(function() {
    $("#editor").css("height", $(window).height() - 28);
  }).resize();

  $("#key").change(function() {
    var key = $("#key").val();
    if(key.length < 7) {
      alert("Please enter a key of at least 7 characters (letters and numbers); please make it hard to guess.\n" +
       "Your document key is like a password; with this, anyone can access and edit your document.");
      return;
    }
    save_key("key", $("#key").val());
    load_document_locally();
    $("#online-save-status").text("Not checked");
  });

  $("#key-new").click(function(e) {
    $("#key").val(generate_key()).change();
    e.preventDefault();
  });

  $("#sync").click(function(e) {
    sync();
    e.preventDefault();
  });

  $("#key-export").click(function(e) {
    export_document();
    e.preventDefault();
  });

  $("#key").val(load_key("key") || generate_key()).change();

  $("#editor").focus();
});
