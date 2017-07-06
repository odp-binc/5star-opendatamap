var SpotCategory = function(key, text) {
  this.key = key;
  this.text = text;
};

var Spot = function(data) {
  this.uri = data.uri;
  this.position = new GeoPosition(parseFloat(data.lat), parseFloat(data.lng));
  this.type = data.type2 || data.type1;
  this.genre = data.genre1
  this.category = getCategory(this.type, this.genre);
};

var lastOpenInfoWindow;

Spot.prototype.getMarker = function(map) {
  if (this.marker) {
    this.marker.setTitle(this.title);
  } else {
    this.marker = new google.maps.Marker({
      position: this.position.getLatLng(),
      title: this.title,
      icon: getPinIcon(this.category.key)
    });
  }
  if (map) {
    var infoWindow = new google.maps.InfoWindow({
      content: this.getInfoContent(),
      maxWidth: 300
    });
    infoWindow.setPosition(this.position.getLatLng());
    if (this.markerClickListener) {
      marker.removeListener(this.markerClickListener);
    }
    this.markerClickListener = this.marker.addListener('click', function() {
      if (lastOpenInfoWindow) {
        lastOpenInfoWindow.close();
      }
      if (infoWindow !== lastOpenInfoWindow) {
        infoWindow.open(map, this);
        lastOpenInfoWindow = infoWindow;
      } else {
        lastOpenInfoWindow = undefined;
      }
    });
  }
  return this.marker;
};

Spot.prototype.getInfoContent = function() {
  var content = '<div id="info"><dl>';
  if (this.title) {
    content += '<dt>タイトル</dt><dd>' + this.title + '</dd>';
  }
  content += '<dt>分類</dt><dd>' + this.category.text + '</dd>';
  if (this.genre) {
    content += '<dt>種別</dt><dd>' + this.genre + '</dd>';
  }
  return content
    +   '<dt>地理座標</dt><dd>' + this.position.text + '</dd>'
    +   '</dl>'
    +   '<div style="text-align:right;">'
    +     '<a href="#" onclick="showDetail(this);return false;" data-spoturi="' + encodeURIComponent(this.uri) + '">詳細はこちら</a>'
    +   '</div>'
    + '</div>';
};

var categories = {
  "event":    new SpotCategory("event", "イベント"),
  "hazard":   new SpotCategory("hazard", "防災"),
  "tourspot": new SpotCategory("tourspot", "観光"),
  "facility": new SpotCategory("facility", "施設"),
  "other":    new SpotCategory("other", "その他")
};

var typeMap = {
  "http://purl.org/jrrk#CivicEvent": "event",
  "http://purl.org/jrrk#CivicPOI": "tourspot",
  "http://purl.org/jrrk#CulturalProperty": "tourspot",
  "http://purl.org/jrrk#EmergencyFacility": "hazard",
  "http://purl.org/jrrk#TemporaryGatheringLocation": "hazard",
  "http://purl.org/jrrk#RequiringAssistanceAuthorizedUsersFacilityDisaster": "hazard",
  "http://purl.org/jrrk#CivicFacility": "facility",
  "http://purl.org/jrrk#MedicalInstitute": "facility",
  "http://purl.org/jrrk#ParkingFacility": "facility",
  "http://purl.org/jrrk#Polls": "facility",
  "http://purl.org/jrrk#PosterPlace": "facility",
  "http://purl.org/jrrk#BusStop": "facility",
  "http://purl.org/jrrk#FarmersMarket": "facility",
  "http://odp.jig.jp/odp/1.0#TourSpot": "tourspot",
  "http://odp.jig.jp/odp/1.0#Polls": "facility",
  "http://odp.jig.jp/odp/1.0#PosterPlace": "facility",
  "http://imi.go.jp/ns/core/rdf#施設型": "facility",
  "http://imi.go.jp/ns/core/rdf#イベント型": "event",
  "http://datashelf.jp/ns/dsv#観光スポット型": "tourspot",
  "http://datashelf.jp/ns/dsv#観光スポット": "tourspot",
  "http://datashelf.jp/ns/dsv#応急給水拠点": "hazard",
  last: false
};

var getCategory = function(type) {
  var key = typeMap[type];
  if (!key && !unknownType[type]) {
    unknownType[type] = true;
  }
  return categories[key];
};

var unknownType = {};


var RequestSpot = function(callback) {
  this.name = 'Spot';
  this.offset = 0;
  this.limit = 10000;
  this.executed = false;
  this.spots = {};
  this.callback = callback || function() { console.log('spot data has loaded.') };
};

RequestSpot.prototype.query = function() {
  var query =
        'PREFIX ic: <http://imi.go.jp/ns/core/rdf#> '
      + 'PREFIX odp: <http://odp.jig.jp/odp/1.0#> '
      + 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
      + 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> '

      + 'SELECT ?s1 ?type1 ?s2 ?type2 ?genre1 ?lat ?lng { '
      +   '?s1 ic:地理座標 [ ic:緯度 ?lat ; ic:経度 ?lng ] ; a ?type1 . '
      +     'OPTIONAL { '
      +       '{ ?s1 ic:種別 ?genre1 } '
      +       'UNION { '
      +         '?s1 odp:genre/rdf:_1/odp:genre* [ a odp:LargeGenre ; rdfs:label ?genre1 ] '
      +       '} } . '
      +     'OPTIONAL { ?s2 ?p1 ?s1 ; a ?type2 } '
      +   'FILTER ( !BOUND(?p1) || ?p1 != <http://www.w3.org/2002/07/owl#sameAs> ) '
      + '} '
      + 'ORDER BY ?s1 ?s2 '
      + 'OFFSET ' + this.offset
      + ' LIMIT ' + this.limit;
  return query;
}

RequestSpot.prototype.parse = function(results) {
  for (var i = 0; i < results.length; i++) {
    var data = results[i];
    data.uri = data.s2 || data.s1;
    var spot = new Spot(data);
    if (!this.spots.hasOwnProperty(spot.uri)) {
      this.spots[spot.uri] = spot;
    }
  }
  if (false && results.length === this.limit) {
    this.offset += this.limit;
    executeSparql(this);
  } else {
    var reqSpot = this;
    var requestSpotTitle = new RequestSpotTitle(this.spots, function() {
      reqSpot.callback(reqSpot.spots);
    });
    executeSparql(requestSpotTitle);
  }
};

var RequestSpotTitle = function(spots, callback) {
  this.name = 'SpotTitle';
  this.offset = 0;
  this.limit = 10000;
  this.spots = spots;
  this.executed = false;
  this.callback = callback || function() { console.log('spot title has loaded.') };
};

RequestSpotTitle.prototype.getRange = function() {
  var first = null;
  var last = null;
  for (var key in this.spots) {
    if (!first || key < first) {
      first = key;
    }
    if (!last || last < key) {
      last = key;
    }
  }
  return { first: first, last: last };
};

RequestSpotTitle.prototype.query = function() {
  var filter = "";
  var range = this.getRange();
  if (range.first && range.last) {
    filter = ' && str(?s)>"' + range.first + '" && str(?s)<"' + range.last + '" ';
  }
  var query =
        'PREFIX ic: <http://imi.go.jp/ns/core/rdf#> '
      + 'PREFIX odp: <http://odp.jig.jp/odp/1.0#> '
      + 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
      + 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> '

      + 'SELECT ?s ?title { '
      +   '?s ic:名称/ic:表記 ?title . '
      +   'FILTER (!isBlank(?s)' + filter + ') '
      + '} '
      + 'ORDER BY ?s '
      + 'OFFSET ' + this.offset
      + ' LIMIT ' + this.limit;
  return query;
};

RequestSpotTitle.prototype.parse = function(results) {
  for (var i = 0; i < results.length; i++) {
    var data = results[i];
    var spot = this.spots[data.s];
    if (spot) {
      spot.title = data.title;
    }
  }
  if (results.length == this.limit) {
    this.offset += this.limit;
    executeSparql(this);
  } else {
    this.callback();
  }
};

var RequestSpotDetail = function(uri, callback) {
  this.name = 'SpotDetail';
  this.offset = 0;
  this.limit = 10000;
  this.uri = uri;
  this.executed = false;
  this.callback = callback || function(result) { console.log('spot detail has loaded.', result) };
  this.result = {};
};

RequestSpotDetail.prototype.query = function() {
  var query =
        'PREFIX ic: <http://imi.go.jp/ns/core/rdf#> '
      + 'PREFIX odp: <http://odp.jig.jp/odp/1.0#> '
      + 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
      + 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> '

      + 'SELECT ?p1 ?o1 ?p2 ?o2 ?p3 ?o3 { '
      +   '<' + this.uri + '> ?p1 ?o1 . '
      +   'OPTIONAL { ?o1 ?p2 ?o2 . OPTIONAL { ?o2 ?p3 ?o3 } } '
      + '} '
      + 'ORDER BY ?p1 ?o1 ?p2 ?o2 ?p3 ?o3 '
      + 'OFFSET ' + this.offset
      + ' LIMIT ' + this.limit;
  return query;
};

RequestSpotDetail.prototype.parse = function(results) {
  for (var i = 0; i < results.length; i++) {
    var data = this.getPropertyAndObject(results[i]);
    if (!this.result[data.property]) {
      this.result[data.property] = data.object;
    } else if ($.isArray(this.result[data.property])) {
      this.result[data.property].push(data.object);
    } else {
      var array = [];
      array.push(this.result[data.property]);
      array.push(data.object);
      this.result[data.property] = array;
    }
  }
  if (results.length == this.limit) {
    this.offset += this.limit;
    executeSparql(this);
  } else {
    this.callback(new SpotDetail(this.result));
  }
};

RequestSpotDetail.prototype.getPropertyAndObject = function(data) {
  var path = toShortForm(data.p1);
  var object = data.o1;
  for (var i = 2; i <= 3; i++) {
    var key = 'p' + i;
    if (!data[key]) {
      break;
    }
    path += "/" + toShortForm(data[key]);
    object = data['o' + i];
  }
  return { property: path, object: object };
}

var SpotDetail = function(data) {
  this.data = data;
  this.title = data["ic:名称/ic:表記"] || data["rdfs:label"];
  this.category = getCategory(data["rdf:type"]);
  this.description = data["ic:説明"] || data["schema:description"];
  this.note = data["kobe:ScheduleNotice"];
  var url = data["ic:Webサイト"] || data["schema:url"];
  if (url && !url.startsWith("http")) {
    url = null;
  }
  this.url = url;
  this.address = data["ic:住所/ic:表記"] || data["ic:開催場所/ic:住所/ic:表記"];
  this.place = data["ic:開催場所/ic:名称/ic:表記"];
  this.price = data["ic:料金/ic:表記"];
  this.genre = join(data["ic:種別"], ' / ');
  this.image = data["ic:画像"] || data["schema:image"];
  this.contact = data["ic:連絡先/ic:名称/ic:表記"];
  var phone = data["ic:連絡先/ic:電話番号"];
  if (phone && phone.length > 6) {
    this.phone = phone;
  }
  this.latitude = data["ic:地理座標/ic:緯度"] || data["ic:開催場所/ic:地理座標/ic:緯度"] || data["geo:lat"];
  this.longitude = data["ic:地理座標/ic:経度"] || data["ic:開催場所/ic:地理座標/ic:経度"] || data["geo:long"];
};

SpotDetail.prototype.getPosition = function() {
  if (this.latitude && this.longitude) {
    return new GeoPosition(this.latitude, this.longitude);
  }
  return null;
};

SpotDetail.prototype.getCategory = function() {
  if (this.type) {
    return getCategory(this.type);
  }
  return null;
};

