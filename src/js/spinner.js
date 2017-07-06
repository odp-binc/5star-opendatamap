
var initSpinner = function() {
  $('#spinner_overlay').click(function(e) {
    e.stopPropagation();
  });
}

var stopSpinner = function() {
  $('#spinner_overlay').fadeOut();
}
