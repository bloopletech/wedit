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

        $("#editor").val(text);
        save_key(document_id(), text);
        document_last_text = text;
      }
    });
  }

  function save_document() {
    if($("#key").val() == "") return;

    var text = $("#editor").val(); 
    if(text == document_last_text) return;
    save_key(document_id(), text);
    save_key(document_id() + "-last-modified", (new Date().getTime()));

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
      },
      error: function(xhr) {
        $("#save-status").text("Server failed; saved locally ✓");
      }
    });

    document_last_text = text;
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
