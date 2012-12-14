var async = require('async')
var expect = require('expect.js')
var _ = require('underscore')
//var Trello = require('../../lib/trello/node-trello')
var Trello = require('node-trello')

Given(/^I have connected to the Trello API$/, function(step) {
  var self = this
  self.trello = new Trello(settings.key, settings.token)
  self.trello.get('/1/members/me/boards', { fields: 'name' }, function(err, boards) {
    expect(err).to.be(null)
    self.boards = boards
    step.done()
  })
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
  self.trello.get('/1/boards/' + this.board.id + '/lists', { open: true}, function(err, lists) {
    expect(err).to.be(null)
    var listIds = _.pluck(lists, 'id')
    async.forEach(
      listIds, 
      function(listId, next) {
        self.trello.put(
          '/1/lists/' + listId, 
          {closed: true }, 
          function(err) { expect(err).to.be(null); next(err) }
        )
      }, 
      function(err) {
        if (err) throw err
        step.done()
      }
    )
  })
})

Given(/^I create lanes$/, function(step, table) {
  var self = this
  self.newLanes = []
  async.forEach(
    table.hashes(),
    function(item, next) {
      self.newLanes.push(item.lane)
      self.trello.post('/1/lists', { name: item.lane, idBoard: self.board.id }, next)
    },
    function(err) {
      expect(err).to.be(null)
      step.done()
    }
  )
})

var getLanes = function(self, step) {
  self.trello.get('/1/boards/' + self.board.id + '/lists', { open: true}, function(err, lists) {
    expect(err).to.be(null)
    self.lanes = lists
    step.done()
  })
}

Given(/^I retrieve the lanes$/, function(step) {
  getLanes(this, step)
})

When(/^I retrieve the lanes$/, function(step) {
  getLanes(this, step)
})

Then(/^I should I should see the lanes that were created$/, function(step) {
  var self = this
  var listNames = _.pluck(this.lanes, 'name')
  _.each(listNames, function(name) {
    expect(_.contains(self.newLanes, name)).to.be(true)
  })
  step.done()
})

Given(/^I add cards$/, function(step, table) {
  var self = this
  self.newCards = []
  async.forEach(
    table.hashes(),
    function(item, next) {
      self.newCards.push(item.card)
      self.trello.post('/1/cards', { name: item.card, idList: self.lanes[0].id }, next)
    },
    function(err) {
      expect(err).to.be(null)
      step.done()
    }
  )
})

When(/^I retrieve the cards$/, function(step) {
  var self = this
  self.trello.get(
    '/1/lists/' + self.lanes[0].id + '/cards', 
    { fields: 'name' }, 
    function(err, cards) {
      self.cards = cards
      step.done()
    }
  )
})

Then(/^I should see the cards that were created$/, function(step) {
  var self = this
  var cardNames = _.pluck(this.cards, 'name')
  _.each(cardNames, function(name) {
    expect(_.contains(self.newCards, name)).to.be(true)
  })
  step.done()
})
