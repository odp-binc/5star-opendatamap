var GeoPosition = function(latitude, longitude) {
  this.latitude = latitude;
  this.longitude = longitude;
  this.text = new Number(latitude).toFixed(6) + "," + new Number(longitude).toFixed(6);
};
GeoPosition.prototype.toGeo3x3 = function(level) {
  var lat = (90 - this.latitude) / 180;
  var lng = (this.longitude < 0 ? this.longitude + 180 : this.longitude) / 180;
  var res = this.longitude < 0 ? 'W' : 'E';
  for (var i = 1; i < level; i++) {
    lng *= 3;
    lat *= 3;
    var x = Math.floor(lng);
    var y = Math.floor(lat);
    res += x + y * 3 + 1;
    lng -= x;
    lat -= y;
  }
  return new Geo3x3(res);
};

GeoPosition.prototype.getLatLng = function() {
  if (google.maps.LatLng) {
    return new google.maps.LatLng(this.latitude, this.longitude);
  }
  return { lat: this.latitude, lng: this.longitude };
};

var Geo3x3 = function(code) {
  if (!code || code.length === 0) {
    return;
  }
  var isWest = code.charAt(0) === 'W';
  var x = 0;
  var y = 0;
  var level = 1;
  var unit = 1;
  for (var i = 1; i < code.length; i++) {
    var n = "0123456789".indexOf(code.charAt(i));
    if (n < 0) {
      return;
    } else if (n === 0) {
      break;;
    }
    unit *= 3;
    level++;
    n--;
    if (n > 0) {
      x += (n % 3) / unit;
      y += Math.floor(n / 3) / unit;
    }
  }
  this.unit = 180 / unit;
  unit *= 2;
  this.code = code;
  this.lat = 90 - (y + 1 / unit) * 180;
  this.lng = (x + 1 / unit) * 180 - (isWest ? 180 : 0);
  this.level = level;
};

Geo3x3.prototype.getAncestor = function(level) {
  var l = level;
  if (l > this.level) {
    l = this.level;
  }
  return new Geo3x3(this.code.substring(0, l));
};
