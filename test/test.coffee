router_line = require '../lib'
util = require 'util'

testUrl = '/users(/:user_id/(profile))/(page)'

describe 'Parser', ->
  describe '#_tokenize', ->
    it 'should return tokens', ->
      router_line.parser._tokenize(testUrl)
        .should.eql ['users', '(', ':user_id', '(', 'profile', ')', ')', '(', 'page', ')']

  describe '#parse', ->
    it 'should return an AST', ->
      router_line.parser.parse(testUrl)
        .should.eql ['users', [':user_id', ['profile']], ['page']]

describe 'Map', ->
  describe '#_expandConditions', ->
    it 'should be return an array', ->
      ast = router_line.parser.parse testUrl
      router_line.Map.prototype._expandCondition(ast)
        .should.be.an.instanceof(Array)
    it 'should be able to expand a pattern', ->
      router_line.Map.prototype._expandCondition([['profile']])
        .should.eql [
          []
          ['profile']
        ]

    it 'should be able to expand a little difficult pattern', ->
      router_line.Map.prototype._expandCondition([':user_id', ['profile']])
        .should.eql [
            [':user_id']
            [':user_id', 'profile']
          ]

    it 'should be able to expand a pattern contains plural optional grammer', ->
      router_line.Map.prototype._expandCondition([':user_id', ['profile'], ['page']])
        .should.eql [
            [':user_id']
            [':user_id', 'page']
            [':user_id', 'profile']
            [':user_id', 'profile', 'page']
          ]

  describe '#add', ->
    it 'should be success', ->
      map = new router_line.Map
      map.add('/users/own/profile').should.be.true
      map.add('/users/:user_id/profile').should.be.true

    it 'should be failed', ->
      map = new router_line.Map
      map.add('/users/:user_name/profile').should.be.true
      map.add('/users/:user_id/profile').should.be.false

describe 'Router', ->

# describe 'Matcher#generate', ->
#   describe 'matcher', ->
#     it 'should return true when matched', ->
#       ast = router_line.parser.parse testUrl
#       matcher = router_line.matcher.generate ast
#       matcher('/users/0/profile')
#         .should.equal true

