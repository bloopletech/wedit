// Tweak of code by Lea Verou, see http://bytesizematters.com/bytesize.js
(function($) {
  $.bytesize = function(text) {
    var crlf = /(\r?\n|\r)/g;

    var length = text.length, nonAscii = length - text.replace(/[\u0100-\uFFFF]/g, '').length,
     lineBreaks = length - text.replace(crlf, '').length; 
		
    return length + nonAscii + Math.max(0, lineBreaks - 1);
  };

  $.format_bytes = function(count) {
    var level = 0;
		
    while(count > 1024) {
      count /= 1024;
      level++;
    }

    //Round to 2 decimals
    count = Math.round(count * 10) / 10;
    level = ['', 'k', 'm', 'g', 't'][level];
	
    return count + ' ' + level + 'b';
  };
})(jQuery);
