var initMenu = function() {
  $('#content_overlay').click(function(e) {
    $(this).hide();
    hideMenu();
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
      } else if (item === 'about') {
        closeMenu();
        showContent();
      } else {
        hideMenu();
      }
    });
  });
};

var showMenu = function() {
  $('#content_overlay').show();
  $('#content_container').hide();
  $('.menu.hidden').show();
  $('#menu_link').addClass('open');
  $('.menu.head a').addClass('disabled');
};

var hideMenu = function() {
  hideContent();
  closeMenu();
};

var closeMenu = function() {
  $('.menu.hidden').hide();
  $('#menu_link').removeClass('open');
  $('.menu.head a').removeClass('disabled');
};

var showContent = function() {
  $('#content_overlay').show();
  $('#content_container').show();
};

var hideContent = function() {
    $('#content_overlay').hide();
    $('#content_container').hide();
};

