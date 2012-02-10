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

describe 'Router', ->
  describe '#_expandConditions', ->
    it 'should be return an array', ->
      ast = router_line.parser.parse testUrl
      router_line.Router.prototype._expandCondition(ast)
        .should.be.an.instanceof(Array)
    it 'should be able to expand a pattern', ->
      router_line.Router.prototype._expandCondition([['profile']])
        .should.eql [
          ['profile']
          []
        ]

    it 'should be able to expand a little difficult pattern', ->
      router_line.Router.prototype._expandCondition([':user_id', ['profile']])
        .should.eql [
            [':user_id', 'profile']
            [':user_id']
          ]

    it 'should be able to expand a pattern contains plural optional grammer', ->
      router_line.Router.prototype._expandCondition([':user_id', ['profile'], ['page']])
        .should.eql [
            [':user_id', 'profile', 'page']
            [':user_id', 'profile']
            [':user_id', 'page']
            [':user_id']
          ]

  describe '#add', ->
    it 'should be success', ->
      map = new router_line.Router
      map.add('/users/own/profile', 'someA').should.be.true
      map.add('/users/:user_id/profile', 'someB').should.be.true

    it 'should be failed', ->
      map = new router_line.Router
      map.add('/users/:user_name/profile', 'someA').should.be.true
      map.add('/users/:user_id/profile', 'someB').should.be.false

    describe '#route', ->
      router = new router_line.Router

      router.add '/', 'root'
      router.add '/users/:user_name/profile', 'someone\'s profile'
      router.add '/users/own(/profile)', 'my profile'

      it 'should route', ->
        router.route('/users/own').should.eql
          params: {}
          value: 'my profile'

      it 'should route successful', ->
        router.route('/users/koba789/profile').should.eql
          params: {user_name: 'koba789'}
          value: 'someone\'s profile'

      it 'should route to root', ->
        router.route('/').should.eql
          params: {}
          value: 'root'

      it 'should be failed to route', ->
        router.route('/undefined/route') == undefined