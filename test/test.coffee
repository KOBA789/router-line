router_line = if process.env.TEST_COV then require '../lib-cov' else require '../lib'
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
  describe '#_expandRules', ->
    it 'should be return an array', ->
      ast = router_line.parser.parse testUrl
      router_line.Router.prototype._expandRules(ast)
        .should.be.an.instanceof(Array)
    it 'should be able to expand a pattern', ->
      router_line.Router.prototype._expandRules([['profile']])
        .should.eql [
          ['profile']
          []
        ]

    it 'should be able to expand a little difficult pattern', ->
      router_line.Router.prototype._expandRules([':user_id', ['profile']])
        .should.eql [
            [':user_id', 'profile']
            [':user_id']
          ]

    it 'should be able to expand a pattern contains plural optional grammer', ->
      router_line.Router.prototype._expandRules([':user_id', ['profile'], ['page']])
        .should.eql [
            [':user_id', 'profile', 'page']
            [':user_id', 'profile']
            [':user_id', 'page']
            [':user_id']
          ]

  describe '#add', ->
    it 'should be success', ->
      router = new router_line.Router
      router.add('GET', '/users/own/profile', 'someA').should.be.true
      router.add('GET', '/users/:user_id/profile', 'someB').should.be.true

    it 'should be success in different method each other, even if the table has conflict patterns when they are in different method', ->
      router = new router_line.Router
      router.add('GET', '/users/:user_name/profile', 'someA').should.be.true
      router.add('POST', '/users/:user_id/profile', 'someB').should.be.true

    it 'should be failed', ->
      router = new router_line.Router
      router.add('GET', '/users/:user_name/profile', 'someA').should.be.true
      router.add('GET', '/users/:user_id/profile', 'someB').should.be.false

  describe '#route', ->
    router = new router_line.Router

    router.GET '/', 'root'
    router.GET '/users/:user_name/profile', 'someone\'s profile'
    router.GET '/users/own(/profile)', 'my profile'
    router.POST '/article/post', 'post page'

    it 'should route', ->
      router.route('GET', '/users/own').should.eql
        params: {}
        value: 'my profile'

    it 'should route successful', ->
      router.route('GET', '/users/koba789/profile').should.eql
        params: {user_name: 'koba789'}
        value: 'someone\'s profile'

    it 'should route successful when the method is POST', ->
      router.route('POST', '/article/post').should.eql
        params: {}
        value: 'post page'

    it 'should route to root', ->
      router.route('GET', '/').should.eql
        params: {}
        value: 'root'

    it 'should be failed to route', ->
      router.route('GET', '/undefined/route') == undefined

