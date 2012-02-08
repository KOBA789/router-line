var Z = require('./util').Z;
var combine = require('./util').combine;

module.exports = (function () {
  function Map () {

  }

  Map.prototype.add = function () {
    
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
    })(ast).reverse().slice(1);
  };

  return Map;
})();