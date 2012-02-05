var Z = require('./util').Z;

module.exports.generate = Z(function (gen) {
  return function (ast) {
    return function (names) {
      
    };
  };
});

module.exports._expandCondition = Z(function (expand) {
  return function (ast) {
    return ast.map(function (part) {
      if (Array.isArray(part)) {
        return expand(part);
      } else {
        return ['/', part];
      }
    });
  };
});