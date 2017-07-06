var detailOverlay;
var detailContainer;
var detailView;

var initDetailView = function() {
  if (!windowSize || detailView) {
    return;
  }
  detailView = $('#detail_view');
  detailContainer = $('#detail_container');
  detailContainer.click(function(e) {
    e.stopPropagation();
  });
  detailOverlay = $('#detail_overlay');
  detailOverlay.click(function() {
    detailOverlay.hide();
  });
  $('#detail_close').click(function() {
    detailOverlay.hide();
    return false;
  });

  var observer = new MutationObserver(function(e) {
    setDetailViewHeight();
  });
  observer.observe($('#detail_title')[0], {childList: true});
};

var setDetailViewHeight = function() {
  if (windowSize && $('#detail_overlay').is(':visible')) {
    var ch = Math.floor(windowSize.height * 0.8);
    detailContainer.height(ch);
    detailView.height(ch - $('#detail_header').outerHeight() - 20);
  }
};

var showDetail = function(anchor) {
  var uri = decodeURIComponent($(anchor).data('spoturi'));
  var request = new RequestSpotDetail(uri, function(detail) {
    if (detailView) {
      var title = $('<h3 />').text(normalizeLiteral(detail.title, "ja"));
      $('#detail_title').empty().append(title)

      detailView.empty();
      var mapLink = function(text) {
        return $('<a />').attr({
          href: 'https://www.google.co.jp/maps/?q=' + detail.getPosition().text,
          target: "_blank"
        }).text(normalizeLiteral(text, 'ja'));
      }
      var dl = $('<dl>');
      if (detail.category) {
        dl.append($('<dt>').text('分類'))
          .append($('<dd>').text(detail.category.text));
      }
      if (detail.genre) {
        dl.append($('<dt>').text('種別'))
          .append($('<dd>').text(detail.genre));
      }
      if (detail.place) {
        dl.append($('<dt>').text('開催場所'))
          .append($('<dd>').append(mapLink(detail.place)));
      } else if (detail.address) {
        dl.append($('<dt>').text('住所'))
          .append($('<dd>').append(mapLink(detail.address)));
      }
      if (detail.contact) {
        dl.append($('<dt>').text('連絡先'))
          .append($('<dd>').text(normalizeLiteral(detail.contact, 'ja')));
      }
      if (detail.phone) {
        dl.append($('<dt>').text('電話番号'))
          .append($('<dd>').text(detail.phone));
      }
      if (detail.price) {
        dl.append($('<dt>').text('料金'))
          .append($('<dd>').text(normalizeLiteral(detail.price, 'ja')));
      }
      if (detail.url) {
        dl.append($('<dt>').text('webサイト'))
          .append($('<dd>')
            .append($('<a />')
              .attr({ href: detail.url, target: '_blank' })
              .html(detail.url.replace(/(\/+)/g, '$1<wbr>'))));
      }
      if (detail.image) {
        dl.append($('<dt>').text('画像'))
          .append($('<dd>')
            .append($('<img>').attr({ src: detail.image })));
      }
      if (detail.description) {
        var desc = normalizeLiteral(detail.description, 'ja', '\n\n');
        if (desc.length > 0) {
          dl.append($('<dt>').text('説明'))
            .append($('<dd>').addClass('description').html(desc.replace(/\n/g, '<br>')));
        }
      }
      detailView.append(dl);
      detailOverlay.show();
    }
  });
  executeSparql(request);
};
