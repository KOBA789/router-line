var Z = require('./util').Z;
var combine = require('./util').combine;

var parse = require('./parser').parse;

module.exports = (function () {
  function Map () {
    this._routingTable = {};
  }

  Map.prototype.add = function (path, value) {
    var ast = parse(path);
    var patterns = this._expandCondition(ast);
    patterns.forEach(function (pattern) {
      var length = pattern.length;
      var table = (this._routingTable.hasOwnProperty(length))
            ? this._routingTable[length]
            : this._routingTable[length] = {};
      
    }.bind(this));
  };

  Map.prototype._expandCondition = function (ast) {
    return Z(function (expand) {
      return function (ast) {
        if (typeof ast === 'string') {
          return [[ast, '/']];
        }
        var result = combine(ast.map(expand), function (a, b) {
          return a.concat(b).filter(function (val) {
            return val !== '/';
          }).concat('/');
        });
        result.push(['/']);
        return result;
      };
    })(ast).map(function(val){
      return val.reverse().slice(1).reverse();
    }).reverse().slice(1);
  };

  return Map;
})();