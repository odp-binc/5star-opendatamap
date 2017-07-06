var initMenu = function() {
  $('#content_overlay').click(function(e) {
    $(this).hide();
  });
  $('#content_container').click(function(e) {
    e.stopPropagation();
  });

  $('.menu a').each(function(index, element) {
    $(element).click(function(e) {
      var item = $(this).data().item;
      if (item) {
        e.preventDefault();
      }
      if (item === 'open') {
        showMenu();
      } else {
        hideMenu();
        if (item === 'about') {
          showAbout();
        }
      }
    });
  });
};


var showAbout = function() {
  $('#content_overlay').show();
};

var showMenu = function() {
  $('.menu.hidden').show();
  $('#menu_link').css({
    'background-color': 'white',
    'border-left': '1px solid #e0e0f0',
    'border-bottom': '1px solid #e0e0f0'
  });
  $('.menu.head').css('background-color', '#f0f0f8');
};

var hideMenu = function() {
  $('.menu.hidden').hide();
  $('.menu.head').css('background-color', '');
  $('#menu_link').css({
    'background-color': '',
    'border-left': '',
    'border-bottom': ''
  });
};
