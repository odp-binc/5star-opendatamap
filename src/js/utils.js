
Array.prototype.contains = function(v) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === v) {
      return true;
    }
  }
  return false;
};

var join = function(target, separator) {
  if ($.isArray(target)) {
    return target.join(separator);
  }
  return target;
};
