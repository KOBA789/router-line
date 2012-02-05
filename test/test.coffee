router_line = require '../lib'
util = require 'util'

testUrl = '/users(/:user_id/(profile))/(page)'

describe 'Parser', ->
  describe '#_tokenize', ->
    it 'should return tokens', ->
      router_line.parser._tokenize(testUrl)
        .should.eql [{token:'name',value:'users'},{token:'open',value:'('},{token:'variable',value:':user_id'},{token:'open',value:'('},{token:'name',value:'profile'},{token:'close',value:')'},{token:'close',value:')'},{token:'open',value:'('},{token:'name',value:'page'},{token:'close',value:')'},]

  describe '#parse', ->
    it 'should return an AST', ->
      router_line.parser.parse(testUrl)
        .should.eql ['users', [':user_id', ['profile']], ['page']]

describe 'Matcher#_expandCondition', ->
  it 'should be return an array', ->
    ast = router_line.parser.parse testUrl
    router_line.matcher._expandCondition(ast)
      .should.be.an.instanceof(Array)
  it 'should return patterns', ->
    router_line.matcher._expandCondition([['profile']])
      .should.equal [
          ['/']
          ['profile', '/']
        ]

  it 'should return patterns', ->
    router_line.matcher._expandCondition([':user_id', ['profile']])
      .should.equal [
          [':user_id', '/']
          [':user_id', 'profile', '/']
        ]


describe 'Router', ->
  it '', ->

# describe 'Matcher#generate', ->
#   describe 'matcher', ->
#     it 'should return true when matched', ->
#       ast = router_line.parser.parse testUrl
#       matcher = router_line.matcher.generate ast
#       matcher('/users/0/profile')
#         .should.equal true

