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

  function load_document() {
    if($("#key").val() == "") return;

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
          $("#save-status").text("Loaded ✓");
        }
        else {
          $("#save-status").text("Server failed; loaded locally ✓");
        }

        $("#editor").val(text).focus();
        $("#editor").caret(parseInt(load_key(document_id() + "-caret")));
        save_key(document_id(), text);
        document_last_text = text;
        $("body").show();
      }
    });
  }

  function save_document_locally() {
    if($("#key").val() == "") return;

    var text = $("#editor").val();
    save_key(document_id(), text);
    save_key(document_id() + "-last-modified", (new Date().getTime()));
    save_key(document_id() + "-caret", $("#editor").caret());

    return text;
  }

  function save_document() {
    if($("#key").val() == "") return;

    var text = save_document_locally();
    if(document_last_text == text) return;

    $.ajax("/api.php", {
      data: {
        action: "save",
        key: $("#key").val(),
        text: text,
        last_modified: load_key(document_id() + "-last-modified")
      },
      type: 'POST',
      success: function() {
        $("#save-status").text("Saved ✓");
        document_last_text = text;
      },
      error: function(xhr) {
        $("#save-status").text("Server failed; saved locally ✓");
        document_last_text = text;
      }
    });
  }

  function export_document() {
    location.href = "/api.php?action=export&key=" + encodeURIComponent($("#key").val());
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
      $("body").show();
      return;
    }
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

  $("body").hide();
  $("#key").val(load_key("key") || generate_key()).change();

  $("#editor").focus();
});
