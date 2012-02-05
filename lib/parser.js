var Z = require('./util').Z;

module.exports.parse = function (pathStr) {
  var tokens = this._tokenize(pathStr);
  var ast = this._parse(tokens);
  return ast;
};

module.exports._parse = Z(function (parse) {
  var join = function () {
    return function (f) {
      
    };
  };

  var one = function () {
    
  };

  var epsilon = function ($1) {
    return $1;
  };

  var grammer = {};

  grammer.optional = one(
    join('open', 'fullpath', 'close')
    (function ($1, $2, $3) {
      return {
        type: 'optional',
        value: $2
      };
    })
  );

  grammer.pathname = one(
    join('name')(epsilon),
    join('variable')(epsilon),
    join('optional')(epsilon)
  );

  grammer.fullpath = one(
    join('pathname')(function ($1) {
      return [$1];
    }),
    join('fullpath', 'pathname')(function ($1, $2) {
      return $1.concat($2);
    })
  );

  return function (tokens) {
    
  };
});

module.exports._tokenize = Z(function (tokenize) {
  var tokensDef = [
    [/^\//],
    [/^\(/, 'open'],
    [/^\)/, 'close'],
    [/^:\w+/, 'variable'],
    [/^\w+/, 'name']
  ];

  return function (target) {
    var shortestToken = '';
    var shortestValue = '';
    var shortestLength = target.length + 1;
    var isIgnore = false;
    for (var i = 0; i < tokensDef.length; i ++) {
      var condition = tokensDef[i][0];
      var matchResult = target.match(condition);
      if (matchResult !== null) {
        var matchedValue = matchResult[0];
        var matchedLength = matchedValue.length;
        if (shortestLength > matchedLength) {
          var token = tokensDef[i][1];
          isIgnore = (token === undefined);
          shortestValue = matchedValue;
          shortestToken = token;
          shortestLength = matchedLength;
        }
      }
    }
    var result = [];
    if (!isIgnore) {
      result = [{
        token: shortestToken,
        value: shortestValue
      }];
    }
    var nextTarget = target.substring(shortestLength);
    var nextResult = (nextTarget.length === 0)
          ? []
          : tokenize(nextTarget);
    return result.concat(nextResult);
  };
});