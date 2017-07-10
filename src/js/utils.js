
Array.prototype.contains = function(v) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === v) {
      return true;
    }
  }
  return false;
};
Array.prototype.last = function() {
  if (this.length === 0) {
    return null;
  }
  return this[this.length - 1];
};

var join = function(target, separator) {
  if ($.isArray(target)) {
    return target.join(separator);
  }
  return target;
};
