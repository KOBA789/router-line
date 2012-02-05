var Z = require('./util').Z;

module.exports.parse = function (pathStr) {
  var tokens = this._tokenize(pathStr);
  var ast = this._parse(tokens);
  return ast;
};

module.exports._parse = Z(function (parse) {
  var grammer = {};

  var p = function (parserName) {
    if (typeof parserName === 'function') {
      return parserName;
    } else {
      var parser = grammer[parserName];
      return parser;
    }
  };

  var either = function (a, b) {
    a = p(a);
    b = p(b);
    return function (tokens) {
      return a(tokens) || b(tokens);
    };
  };

  var join = function (a, b) {
    a = p(a);
    b = p(b);
    return function (tokens) {
      var first = tokens;
      var left = a(first);
      if (left === null) {
        return null;
      }
      var second = tokens.slice(1);
      var right = b(second);
      if (right === null) {
        return null;
      }
      return [left, right];
    };
  };

  var many1 = function (a) {
    a = p(a);
    return either(join(a, a), a);
  };

  var match = function (target) {
    return function (tokens) {
      var token = tokens[0];
      return [(token.token === target) ? token : null];
    };
  };

  var hundle = function (parser, hundler) {
    return function (tokens) {
      var result = parser(tokens);
      if (result === null) {
        return null;
      } else {
        return hundler(result[0], result[1]);
      }
    };
  };

  var flatten = function (left, right) {
    console.log(left, right);
  };

  grammer.purename = match('name');
  grammer.variable = match('variable');
  grammer.open = match('open');
  grammer.close = match('close');
  grammer.optional =
    join('open', join(hundle(many1('pathname'), flatten), 'close'));
  grammer.pathname =
    either('purename', either('variable', 'optional'));
  grammer.fullpath = many1('pathname');
  
  return function (tokens) {
    return grammer.fullpath(tokens);
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