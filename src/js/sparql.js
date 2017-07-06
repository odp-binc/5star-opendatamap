
var parseSparqlResult = function(result) {
  var data = [];
  var vars = result.head.vars;
  var bindings = result.results.bindings;
  for (var i = 0; i < bindings.length; i++) {
    var row = {};
    for (var j = 0; j < vars.length; j++) {
      var k = vars[j];
      var v = bindings[i][k];
      if (!v) {
      } else if (!'type' in v || v.type !== 'typed-literal') {
        row[k] = v.value;
      } else if (v.datatype === 'http://www.w3.org/2001/XMLSchema#integer') {
        row[k] = parseInt(v.value);
      } else if (v.datatype === 'http://www.w3.org/2001/XMLSchema#float') {
        row[k] = parseFloat(v.value);
      } else if (v.datatype === 'http://www.w3.org/2001/XMLSchema#gYear') {
        row[k] = parseInt(v.value);
      } else if (v.datatype === 'http://www.w3.org/2001/XMLSchema#dateTime') {
        row[k] = newDate(v.value);
      } else {
        row[k] = v.value;
      }
    }
    data.push(row);
  }
  return data;
};

var parser = function(request) {
  return function(result) {
    request.parse(parseSparqlResult(result));
  };
};

var executeSparql = function(request) {
  var query = request.query();
  if (!query) {
    return;
  }
  $.ajax({
    type: 'GET',
    url: request.endpoint || getEnv().sparql_endpoint,
    dataType: 'jsonp',
    accepts: {
        json: "application/javascript"
    },
    jsonpCallback: 'receive' + request.name,
    data: {
      query: query,
      output: 'json',
      app_name: getEnv().app_name
    },
    success: parser(request)
  });
}

var Prefix = function(name, uri) {
  this.name = name;
  this.uri = uri;
};

Prefix.prototype.match = function(uri) {
  return uri.startsWith(this.uri);
};

Prefix.prototype.toShortForm = function(uri) {
  return this.name + ":" + uri.substring(this.uri.length);
};

var prefixArray = [
  new Prefix("ic", "http://imi.go.jp/ns/core/rdf#"),
  new Prefix("odp", "http://odp.jig.jp/odp/1.0#"),
  new Prefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#"),
  new Prefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  new Prefix("schema", "http://schema.org/"),
  new Prefix("dct", "http://purl.org/dc/terms/"),
  new Prefix("geo", "http://www.w3.org/2003/01/geo/wgs84_pos#"),
  new Prefix("dsv", "http://datashelf.jp/ns/dsv#"),
  new Prefix("kobe", "http://data.city.kobe.lg.jp/ns/kobetoday#")
];

var toShortForm = function(uri) {
  for (var i = 0; i < prefixArray.length; i++) {
    var prefix = prefixArray[i];
    if (prefix.match(uri)) {
      return prefix.toShortForm(uri);
    }
  }
  return "<" + uri + ">";
}

