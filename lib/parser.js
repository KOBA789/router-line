var Z = require('./util').Z;

module.exports.parse = function (pathStr) {
  var tokens = this._tokenize(pathStr);
  var ast = this._parse(tokens);
  return ast;
};

module.exports._parse = Z(function (parse) {
  var p = function () {
    
  };

  var either = function (a, b) {
    return function (token) {
      
    };
  };

  var join = function (a, b) {
    
  };

  var many1 = function (a) {

  };

  var grammer = {
    purename: 1,
    variable: 2,
    open: 3,
    close: 4,
    optional: join(p('open'), join(many1(p('pathname')), p('close'))),
    pathname: either(p('purename'), p('variable'), p('optional'))
  };
  
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