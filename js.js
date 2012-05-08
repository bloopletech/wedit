$(function() {
  var document_last_text = null;

  function load_document() {
/*    $.ajax("/load", {
      success: function(data) {
        $.localStorage.set("bloopletech-wedit-document", $("#editor").text());
        $.
      }
      
      function(data) {
      
    });*/
    var text = $.localStorage.get("bloopletech-wedit-document");
    /*$.post("/save", { text: $("#editor").text() });*/
    if(text == null) text = "";
    $("#editor").val(text);
    document_last_text = text;
    $("#save-status").text("Document loaded and up to date");
  }


  function save_document() {
    var text = $("#editor").val(); 
    if(text != document_last_text) {
      $.localStorage.set("bloopletech-wedit-document", text, 1000 * 3600 * 24 * 365);
/*    $.post("/save", { text: $("#editor").text() });*/
      document_last_text = text;
      $("#save-status").text("Document saved and up to date");
    }
  }

  window.setInterval(save_document, 30000);

  $(document).keydown(function(event) {
    if (!( String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey) && !(event.which == 19)) return true;
    save_document();
    event.preventDefault();
    return false;
  });

  function check_save_document() {
    if($("#editor").val() != document_last_text) $("#save-status").text("Document unsaved");
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

  load_document();
  check_save_document();

  $("#editor").focus();
});
