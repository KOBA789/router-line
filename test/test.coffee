router_line = require '../lib'
util = require 'util'

testUrl = '/users(/:user_id/(profile))'

describe 'Parser', ->
  describe '#_tokenize', ->
    it 'should return tokens', ->
      router_line.parser._tokenize(testUrl)
        .should.eql ['users', '(', ':user_id', '(', 'profile', ')', ')']

  describe '#parse', ->
    it 'should return an AST', ->
      router_line.parser.parse(testUrl)
        .should.eql ['users', [':user_id', ['profile']]]

describe 'Matcher#_expandCondition', ->
  ast = router_line.parser.parse testUrl
  it 'should be return an array', ->
    router_line.matcher._expandCondition(ast)
      .should.be.an.instanceof(Array)

describe 'Router', ->
  it '', ->

# describe 'Matcher#generate', ->
#   describe 'matcher', ->
#     it 'should return true when matched', ->
#       ast = router_line.parser.parse testUrl
#       matcher = router_line.matcher.generate ast
#       matcher('/users/0/profile')
#         .should.equal true

