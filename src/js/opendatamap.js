var windowSize = false;

$(function() {
  var map;
  var spots;

  var adjustSize = function() {
    windowSize = {
      width: window.innerWidth || $(window).width(),
      height: window.innerHeight || $(window).height()
    };

    $('#map_canvas').height(windowSize.height - $('#header').height());
    if (map) {
      google.maps.event.trigger(map, 'resize');
    }
    setDetailViewHeight();
  };

  adjustSize();
  var adjustTask = false;
  var resetAdjustTask = function() {
    if (adjustTask) {
      clearTimeout(adjustTask);
    }
    adjustTask = setTimeout(adjustSize, 200);
  };
  $(window).resize(resetAdjustTask);

  var onHashChange = function() {
    if (!location.hash || location.hash.length === 0) {
      hideDetail();
      return;
    }
    var uri = decodeURIComponent(location.hash.substring(1));
    showDetail(uri);
  };

  $(window).bind("hashchange", onHashChange);

  initSpinner();
  initDetailView();
  initMenu();

  loadGoogleMaps(function() {
    var pos = new google.maps.LatLng(38.5, 137);
    var options = {
      center: pos,
      zoom: 3,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), options);
    var bounds = {
      south: 31,
      north: 45,
      west: 130,
      east: 145,
    };
    map.fitBounds(bounds);
    initAreaRectangles();
    adjustSize();
  });

  onHashChange();

  var rectArray = [];

  var initAreaRectangles = function() {
    for (var i = 0; i < areas.length; i++) {
      var area = areas[i];
      var rect = new google.maps.Rectangle({
        strokeColor: area.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: area.color,
        fillOpacity: 0.4,
        map: map,
        bounds: area.bounds
      });
      rectArray.push(rect);
      google.maps.event.addListener(rect, 'click', function(e) {
        var bounds = getBounds(this);
        resetMarkers(bounds);
        showAreaRectangles();
        this.setVisible(false);
        map.fitBounds(bounds);
      });
    }
  };

  var getBounds = function(rect) {
    var bounds = rect.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    return {
      south: sw.lat(),
      north: ne.lat(),
      west: sw.lng(),
      east: ne.lng()
    };
  };

  var showAreaRectangles = function() {
    for (var i = 0; i < rectArray.length; i++) {
      rectArray[i].setVisible(true);
    }
  };

  var resetMarkers = function(bounds) {
    if (clusterer) {
      clusterer.clearMarkers();
      markersMap = {};
    }
    $('form#ui').empty();
    showSpinner();
    var requestSpot = new RequestSpot(bounds, function(results) {
      spots = results;
      initMarkers();
    });
    executeSparql(requestSpot);
  };

  var markersMap = {};
  var getMarkers = function(key) {
    if (!markersMap.hasOwnProperty(key)) {
      markersMap[key] = [];
    }
    return markersMap[key];
  };

  var clusterer;
 	var redrawMarkers = function() {
    clusterer.clearMarkers();
    for (var key in markersMap) {
      if ($(".filter[value='" + key + "']").prop('checked')) {
        clusterer.addMarkers(getMarkers(key));
      }
    }
  };
  var initMarkers = function() {
    console.log("spots count", Object.keys(spots).length);
    $.each(spots, function(index, spot) {
      getMarkers(spot.category.key).push(spot.getMarker(map));
    });
    clusterer = new MarkerClusterer(map, [], {
      imagePath: 'images/clusterer-m',
      maxZoom: 17
    });
    var form = $('form#ui');
    form.empty();
    for (var key in markersMap) {
			var attr = {
      	id: key,
        type: 'checkbox',
        name: 'filter',
        value: key
			};
      var filter = $('<input>').addClass('filter').attr(attr).prop('checked', true).change(redrawMarkers);
      form.append(filter).append($('<label>').attr('for', key).text(categories[key].text));
      clusterer.addMarkers(getMarkers(key));
    }
    resetAdjustTask();
    stopSpinner();
  };
});

