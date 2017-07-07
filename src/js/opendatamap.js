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
    map.fitBounds({
      south: 34.5,
      north: 42.5,
      west: 131,
      east: 144,
    });
    var requestSpot = new RequestSpot(function(results) {
      spots = results;
      initMarkers();
    });
    executeSparql(requestSpot);
  });

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
    $.each(spots, function(index, spot) {
      getMarkers(spot.category.key).push(spot.getMarker(map));
    });
    clusterer = new MarkerClusterer(map, [], {
      imagePath: 'images/clusterer-m',
      maxZoom: 17
    });
    var form = $('form#ui');
    for (var key in markersMap) {
			var attr = {
      	id: key,
        type: 'checkbox',
        name: 'filter',
        value: key
			};
      var filter = $('<input>').addClass('filter').attr(attr).prop('checked', true).change(redrawMarkers);
      form.append(filter).append($('<label>').attr('for', key).text(categories[key].text));
      clusterer.addMarkers(getMarkers(key))
    }
    resetAdjustTask();
    stopSpinner();
  };
});

