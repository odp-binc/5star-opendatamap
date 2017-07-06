var isGoogleLoading = false;
var waitGoogleQueue = [];
var isGoogleLoaded = function() {
  return window.google != null && google.maps != null;
};
var loadGoogleMaps = function(callback, errcallback) {
  var timeout = 2000;
  if (isGoogleLoaded()) {
    if (callback) {
      callback();
    }
  } else if (isGoogleLoading) {
    var callbacks = { success: callback || function() {}, error: errcallback || function() {} };
    waitGoogleQueue.push(callbacks);
    setTimeout(function() {
      if (waitGoogleQueue.contains(callbacks)) {
          callbacks.error();
          waitGoogleQueue.remove(callbacks);
      }
    }, timeout);
  } else {
    var done = false;
    isGoogleLoading = true;
    if (window.google) {
      window.google = null;
    }
    $.getScript("https://maps.googleapis.com/maps/api/js?key=" + env.googlemaps_api_key, function() {
      if (!done) {
        done = true;
        if (callback) {
          callback();
        }
        while (waitGoogleQueue.length > 0) {
          waitGoogleQueue.pop().success();
        }
      }
      isGoogleLoading = false;
    });
    setTimeout(function() {
      if (!done) {
        done = true;
        if (errcallback) {
          errcallback();
        }
        while (waitGoogleQueue.length > 0) {
          waitGoogleQueue.pop().error();
        }
        isGoogleLoading = false;
      }
    }, timeout);
  }
};
loadGoogleMaps(function() {console.log("Google Map has loaded.");});

