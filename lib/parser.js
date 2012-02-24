var Z = require('./util').Z;

var parser = module.exports;

parser.parse = function (pathStr) {
  var tokens = parser._tokenize(pathStr);
  var ast = parser._parse(tokens);
  return ast;
};

parser._parse = Z(function (parse) {
  return function (tokens) {
    var smallAst = [];
    var token;
    while ((token = tokens.shift()) !== undefined) {
      if (token.length <= 0) {
        continue;
      }
      switch (token) {
      case '(':
        smallAst.push(parse(tokens));
        break;
      case ')':
        return smallAst;
      default:
        smallAst.push(token);
      }
    }
    return smallAst;
  };
});

parser._tokenize = function (pathStr) {
  var stack = [''];
  for (var i = 0; i < pathStr.length; i ++) {
    var chr = pathStr[i];
    if (chr === '/') {
      stack.push('');
      continue;
    } else if (chr === '(') {
      stack.push('(');
      stack.push('');
    } else if (chr === ')') {      
      stack.push(')');
      stack.push('');
    } else {
      stack[stack.length - 1] += chr;
    }
  }
  return stack.filter(function (str) {
    return str.length !== 0;
  });
};