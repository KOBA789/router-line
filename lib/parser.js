var Z = require('./util').Z;

module.exports.parse = function (pathStr) {
  var tokens = this._tokenize(pathStr);
  var ast = this._parse(tokens);
  return ast;
};

var grammer = {};

var aToken = function (tokenType) {
  return function (tokens) {
    var token = tokens.shift();
    return token.token === tokenType
      ? token
      : null;
  };
};

var p = function (pName) {
  return grammer[pName];
};

var join = function () {
  var parserNames = Array.prototype.slice.call(arguments);
  return function (f) {
    return function (tokens) {
      var parsers = parserNames.map(function (pName) {
        return p(pName);
      });
      var $ = [];
      for (var i = 0; i < parsers.length; i ++) {
        var workingTokens = tokens.slice();
        console.log(parsers);
        var result = parsers[i](workingTokens);
        if (result === null) {
          $ = [];
          break;
        } else {
          $.push(result);
          while (workingTokens.length < tokens.length) {
            tokens.shift();
          }
        }
      }
      if ($.length === 0) {
        return null;
      }
      return f.apply(this, $);
    };
  };
};

var one = function () {
  var parsers = Array.prototype.slice.call(arguments);
  return function (tokens) {
    var workingTokens;
    var result;
    for (var i = 0; i < parsers.length; i ++) {
      workingTokens = tokens.slice();
      result = parsers[i](workingTokens);
      if (result !== null) {
        break;
      }
    }
    if (result !== null) {
      while (workingTokens.length < tokens.length) {
        tokens.shift();
      }
    }
    return result;
  };
};

var epsilon = function ($1) {
  return $1;
};

grammer.name = aToken('name');
grammer.open = aToken('open');
grammer.close = aToken('close');
grammer.variable = aToken('variable');

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


module.exports._parse = function (tokens) {
  tokens.shift();
  var result = grammer.fullpath(tokens);
  console.log(tokens);
  return result;
};

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