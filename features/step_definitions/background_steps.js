var async = require('async')
var expect = require('expect.js')
var _ = require('underscore')
var Trello = require('node-trello')

Given(/^I have connected to the Trello API$/, function(step) {
  var self = this
  self.trello = new Trello(settings.key, settings.token)
  self.trello.get(
    '/1/members/me/boards', 
    { fields: 'name' }, 
    function(err, boards) {
      expect(err).to.be(null)
      self.boards = boards
      step.done()
    }
  )
})

Given(/^the test board is available$/, function(step) {
  this.board = _.find(
    this.boards, 
    function(board) { return board.name === settings.board }
  )
  expect(this.board).not.to.be(undefined)
  step.done()
})

Given(/^I have reset the test board$/, function(step) {
  var self = this
  self.trello.get(
    '/1/boards/' + this.board.id + '/lists', 
    { open: true}, 
    function(err, lists) {
      expect(err).to.be(null)
      var listIds = _.pluck(lists, 'id')
      async.forEach(
        listIds, 
        function(listId, next) {
          self.trello.put('/1/lists/' + listId, {closed: true }, next)
        }, 
        function(err) {
          if (err) throw err
          step.done()
        }
      )
    }
  )
})
