$(function() {
  function scan_back_for_word() {
    var text = $("#editor").val();
    var original_position = $("#editor").caret();

    var i, j;
    for(i = original_position - 1, j = 0; i >= 0 && j < 20; i--, j++) {
      if(text[i].match(/[^A-Za-z]/)) break;
    }
    if(j == 20) return;

    var match_text = text.substring(i + 1, original_position);
    if(match_text == "") return;

    var fix = word_list[match_text];
    if(fix) {
      var before = text.substring(0, i + 1);
      var after = text.substring(original_position);
      $("#editor").val(before + fix + after);
      $("#editor").caret(original_position + (fix.length - match_text.length));
    }
  };

  $("#editor").keydown(function(event) {
    if(event.which == 32) scan_back_for_word();
  });
});
