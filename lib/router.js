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
        var nextTable = table.hasOwnProperty(nextKey) ?
              table[nextKey] : table[nextKey] = {};
        return set(nextTable, query, value);
      }
    };
  });

  Router.prototype.add = function (method, path, value) {
    var ast = parse(path);
    var patterns = this._expandRules(ast);

    if (patterns.length === 0) {
      var query = [method, 0];
      return this._set(this.routingTable, query, value);
    }

    return patterns.every(function (pattern) {
      var length = pattern.length;
      var query = [method, length].concat(pattern);
      return this._set(this.routingTable, query, value);
    }.bind(this));
  };

  var methods = [
    'GET',
    'POST',
    'PUT',
    'DELETE'
  ];

  methods.forEach(function (method) {
    (function (method) {
      Router.prototype[method] = function (path, value) {
        return this.add(method, path, value);
      };
    })(method);
  });

  Router.prototype.ANY = function (path, value) {
    return methods.every(function (method) {
      return this.add(method, path, value);      
    });
  };

  Router.prototype.route = function (method, path) {
    path = path.trim();
    var splitted = path.split('/');
    var query = Array(splitted.length);
    var index = 0;
    var val;
    for (var i = 0; i < splitted.length; ++ i) {
      val = splitted[i];
      if (val.length !== 0) {
        query[index] = val;
        index ++;
      }
    }
    query.length = index;
    var params = {};
    var table = this.routingTable[method];
    if (table === undefined) return undefined;
    table = table[query.length];
    if (table === undefined) return undefined;
    for (var j = 0; j < query.length; ++ j) {
      var key = query[j];
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


  Router.prototype._expandRules = Z(function (expand) {
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