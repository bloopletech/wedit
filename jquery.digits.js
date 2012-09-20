(function($) {
  $.digits = function(text) {
    return text.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  };
})(jQuery);
