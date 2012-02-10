var Z = require('./util').Z;
var combine = require('./util').combine;

var parse = require('./parser').parse;

module.exports = (function () {
  function Router () {
    this.routingTable = {};
  }

  Router.prototype._set = Z(function (set) {
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

  Router.prototype.add = function (path, value) {
    var ast = parse(path);
    var patterns = this._expandCondition(ast);

    if (patterns.length === 0) {
      var query = [0];
      return this._set(this.routingTable, query, value);
    }

    return patterns.every(function (pattern) {
      var length = pattern.length;
      var query = [length].concat(pattern);
      return this._set(this.routingTable, query, value);
    }.bind(this));
  };

  Router.prototype.route = function (path) {
    path = path.trim();
    var query = path.split('/').filter(function (val) {
      return val.length !== 0;
    });
    var params = {};
    var table = this.routingTable[query.length];
    if (table === undefined) return undefined;
    for (var i = 0; i < query.length; i ++) {
      var key = query[i];
      if (table.hasOwnProperty(key)) {
        table = table[key];
      } else if (table.hasOwnProperty(':v')) {
        params[table[':n']] = key;
        table = table[':v'];
      } else {
        return undefined;
      }
    }
    return {params: params, value: table};
  };


  Router.prototype._expandCondition = Z(function (expand) {
    return function (ast) {
      if (Array.isArray(ast) && ast.length === 0) {
        return [];
      }
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

  return Router;
})();