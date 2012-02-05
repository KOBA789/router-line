var Z = require('./util').Z;

module.exports.parse = function (pathStr) {
  var tokens = this._tokenize(pathStr);
  var ast = this._parse(tokens);
  return ast;
};

module.exports._parse = Z(function (parse) {
  var grammer = {};

  var p = function (parserName) {
    return grammer[parserName];
  };

  var either = function (a, b) {
    return function (tokens) {
      
    };
  };

  var join = function (a, b) {
    return function (tokens) {
      
    };
  };

  var many1 = function (a) {
    return either(a, join(a, a));
  };

  var match = function (target) {
    return function (tokens) {
      var token = tokens[0];
      return (token.token === target) ? token : null;
    };
  };

  var hundle = function (parser, hundler) {
    return function (tokens) {
      var result = parser(tokens);
      return (result === null)
        ? null
        : hundler(result);
    };
  };

  grammer.purename = match('name');
  grammer.variable = match('variable');
  grammer.open = match('open');
  grammer.close = match('close');
  grammer.optional =
    join(p('open'),
         join(many1(p('pathname')),
              p('close'),
              function (left, right) {
                
              }),
         function (left, right) {
           
         });
  grammer.pathname =
    either(p('purename'), p('variable'), p('optional'));
  
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