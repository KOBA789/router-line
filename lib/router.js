var url = require('url'),
    Z = require('./util').Z,
    combine = require('./util').combine,
    parse = require('./parser').parse;

module.exports = (function () {
  function Router () {
    this.routingTable = {};
  }

  Router.createRouter = function () {
    return new Router;
  };

  Router.prototype._set = Z(function (set) {
    return function (table, query, value) {
      var nextKey = query.shift();
      if (nextKey.length <= 0) {
        throw new Error('Invalid query.');
      }

      if (nextKey[0] === ':') {
        var n = nextKey.substring(1);
        if (table.hasOwnProperty('^n') && table['^n'] !== n) {
          return false;
        }
        table['^n'] = n;
        nextKey = '^v';
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
    var ast = parse(path),
        patterns = this._expandRules(ast);

    if (patterns.length === 0) {
      var query = [method, 0];
      return this._set(this.routingTable, query, value);
    }

    return patterns.every(function (pattern) {
      var length = pattern.length,
          query = [method, length].concat(pattern);
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

  Router.prototype.routeWithQuery = function (method, path) {
    var parsedUrl = url.parse(path, true),
        dest = this.route(method, parsedUrl.pathname);
    if (dest === undefined) {
      return undefined;
    } else {
      for (var key in parsedUrl.query) {
        dest.params[key] = parsedUrl.query[key];
      }
      return dest;
    }
  };

  Router.prototype.route = function (method, path) {
    path = path.trim();
    var splitted = path.split('/'),
        query = Array(splitted.length),
        index = 0,
        params = {},
        table = [],
        val, key, j;
    for (var i = 0; i < splitted.length; ++ i) {
      val = splitted[i];
      if (val.length !== 0) {
        query[index] = val;
        index ++;
      }
    }
    query.length = index;
    table = this.routingTable[method];
    if (table === undefined) return undefined;
    table = table[query.length];
    if (table === undefined) return undefined;
    for (j = 0; j < query.length; ++ j) {
      key = query[j];
      if (table.hasOwnProperty(key)) {
        table = table[key];
      } else if (table.hasOwnProperty('^v')) {
        params[table['^n']] = key;
        table = table['^v'];
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