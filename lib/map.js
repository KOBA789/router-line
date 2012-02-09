var Z = require('./util').Z;
var combine = require('./util').combine;

var parse = require('./parser').parse;

module.exports = (function () {
  function Map () {
    this.routingTable = {};
  }

  Map.prototype._set = Z(function (set) {
    return function (table, query, value) {
      var nextKey = query.shift();
      if (nextKey.length <= 0) {
        throw new Error('Invalid query.');
      }

      if (nextKey[0] === ':') {
        if (table.hasOwnProperty(':n')) {
          return false;
        }
        table[':n'] = nextKey.substring(1);
        nextKey = ':v';
      }
      if (query.length === 0) {
        table[nextKey] = value;
        return true;
      } else {
        var nextTable = table.hasOwnProperty(nextKey)
              ? table[nextKey]
              : table[nextKey] = {};
      }
      return set(nextTable, query, value);
    };
  });

  Map.prototype.add = function (path, value) {
    var ast = parse(path);
    var patterns = this._expandCondition(ast);
    return patterns.every(function (pattern) {
      var length = pattern.length;
      var query = [length].concat(pattern);
      return this._set(this.routingTable, query, value);
    }.bind(this));
  };

  Map.prototype._expandCondition = Z(function (expand) {
    return function (ast) {
      var result = combine(ast.map(function (val) {
        if (typeof val === 'string') {
          return [[val]];
        } else if (Array.isArray(val)) {
          return expand(val).concat([[]]);
        } else {
          throw new Error('Invalid AST. Unexpected neither a string nor an array.');
        }
      }), function (a, b) {
        return a.concat(b);
      });
      return result;
    };
  });

  return Map;
})();