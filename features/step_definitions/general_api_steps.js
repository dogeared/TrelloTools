var async = require('async')
var expect = require('expect.js')
var _ = require('underscore')
var Trello = require('node-trello')

var createLane = function(self, lane, cb) {
  self.trello.post(
    '/1/lists', 
    { name: lane, idBoard: self.board.id }, 
    cb
  )
}

Given(/^I create lanes$/, function(step, table) {
  var self = this
  self.newLanes = []
  async.forEach(
    table.hashes(),
    function(item, next) {
      self.newLanes.push(item.lane)
      createLane(self, item.lane, next)
    },
    function(err) {
      if (err) throw err
      step.done()
    }
  )
})

Given(/^I create a lane called "([^"]*?)"$/, function(step, lane) {
  createLane(this, lane, function(err) {
    if (err) throw err
    step.done()
  })
});

var getLanes = function(self, step) {
  self.trello.get(
    '/1/boards/' + self.board.id + '/lists', 
    { open: true}, 
    function(err, lists) {
      if (err) throw err
      self.lanes = lists
      step.done()
    }
  )
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
  self.cardNames = []
  self.savedCards = []
  async.forEach(
    table.hashes(),
    function(item, next) {
      self.cardNames.push(item.card)
      self.trello.post(
        '/1/cards', 
        { name: item.card, desc: item.desc, idList: self.lanes[0].id },
        function(err, card) {
          self.savedCards.push(card)
          next(err)
        }
      )
    },
    function(err) {
      if (err) throw err
      step.done()
    }
  )
})

Given(/^I add the "([^"]*?)" checklist to each card$/, 
  function(step, name, table) {
    var self = this

    var addChecklistItem = function(err, checklist, next) {
      async.forEach(
        table.hashes(),
        function(item, cont) {
          self.trello.post(
            '/1/checklists/' + checklist.id + '/checkItems',
            { name: item.name },
            cont
          )
        },
        next
      )
    }

    var addChecklist = function(card, next) {
      self.trello.post(
        '/1/cards/' + card.id + '/checklists',
        { name: name },
        function(err, checklist) {
          addChecklistItem(err, checklist, next)
        }
      )
    }

    async.forEach(self.savedCards, function(card, next) {
      addChecklist(card, next)
    },
    function(err) {
      if (err) throw err
      step.done()
    })
  }
)

When(/^I retrieve the cards$/, function(step) {
  var self = this
  self.trello.get(
    '/1/lists/' + self.lanes[0].id + '/cards', 
    { fields: 'name,idChecklists' }, 
    function(err, cards) {
      if (err) throw err
      self.retrievedCards = cards
      step.done()
    }
  )
})

Then(/^I should see the cards that were created$/, function(step) {
  var self = this
  var cardNames = _.pluck(this.retrievedCards, 'name')
  _.each(cardNames, function(name) {
    expect(_.contains(self.cardNames, name)).to.be(true)
  })
  step.done()
})

Then(/^each card should have a "([^"]*?)" checklist with$/, 
  function(step, name, table) {
    var self = this
    var expected = _.pluck(table.hashes(), 'name')
    async.forEach(self.retrievedCards, function(card, next) {
      self.trello.get(
        '/1/checklists/' + card.idChecklists[0],
        function(err, checklist) {
          expect(checklist.name).to.be(name)
          var results = _.pluck(checklist.checkItems, 'name')
          _.each(results, function(result) {
            expect(expected).to.contain(result)
          })
          next(err)
        }
      )
    },
    function(err) {
      if (err) throw err
      step.done()
    })
  }
)
