
var initSpinner = function() {
  $('#spinner_overlay').click(function(e) {
    e.stopPropagation();
  });
}

var showSpinner = function() {
  $('#spinner_overlay').fadeIn();
};

var stopSpinner = function() {
  $('#spinner_overlay').fadeOut();
}
