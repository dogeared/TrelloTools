global.inspect = require('eyes').inspector()
var expect = require('expect.js')
var sinon = require('sinon')
var _ = require('underscore')
var TrelloEvents = require('../../lib/trello_events')
var actions = require('../fixtures/actions_fixture')

describe('When working with Trello events', function() {
  beforeEach(function() {
    var self = this

    // third param indicates testing
    this.trelloEvents = TrelloEvents('abcd', 'efgh', true)
    this.trello = this.trelloEvents.trello()
    this.getStub = sinon.stub(this.trello, 'get')
    this.getStub.withArgs('/1/members/me/boards').
      yields(null, [{id: '12345', name: 'MyBoard'}])
    this.getStub.withArgs('/1/boards/12345/actions', {}).
      yields(null, actions.allActions)
    this.getStub.withArgs(
      '/1/boards/12345/actions', 
      {since: '2013-01-02T19:53:24.930Z'}
    ).yields(null, actions.allActions.slice(0,18))

    this.events = [ 
      'addAttachmentToCard', 'addChecklistToCard',
      'commentCard', 'convertToCardFromCheckItem',
      'copyCard', 'createBoard',
      'createCard', 'createList',
      'moveCardFromBoard', 'moveCardToBoard',
      'moveListFromBoard', 'moveListToBoard',
      'removeChecklistFromCard', 'updateBoard',
      'updateCard', 'updateCheckItemStateOnCard',
      'updateChecklist'
    ]

    this.eventCounters = {
      addAttachmentToCard: 0, addChecklistToCard: 0,
      commentCard: 0, convertToCardFromCheckItem: 0,
      copyCard: 0, createBoard: 0,
      createCard: 0, createList: 0,
      moveCardFromBoard: 0, moveCardToBoard: 0,
      moveListFromBoard: 0, moveListToBoard: 0,
      removeChecklistFromCard: 0, updateBoard: 0,
      updateCard: 0, updateCheckItemStateOnCard: 0,
      updateChecklist: 0
    }

    this.expectedEventCounters = {
      addAttachmentToCard: 1, addChecklistToCard: 2,
      commentCard: 1, convertToCardFromCheckItem: 1,
      copyCard: 2, createBoard: 1,
      createCard: 1, createList: 2,
      moveCardFromBoard: 1, moveCardToBoard: 1,
      moveListFromBoard: 1, moveListToBoard: 1,
      removeChecklistFromCard: 1, updateBoard: 1,
      updateCard: 1, updateCheckItemStateOnCard: 1,
      updateChecklist: 1
    }
   
    // setup event handlers 
    _.each(self.events, function(event) {
      self.trelloEvents.on(event, function(data) {
        self.eventCounters[event]++
      })
    })
  })

  it('properly handles all events ', function(done) {
    var self = this
    self.trelloEvents.monitor('MyBoard', { interval: 10 })
    setTimeout(function() {
      self.trelloEvents.unmonitor('MyBoard')
      expect(self.eventCounters).to.eql(self.expectedEventCounters)
      done()
    }, 20)
  })

  it('properly handles events since a date', function(done) {
    var self = this
    self.expectedEventCounters.createBoard = 0
    self.expectedEventCounters.createList = 1
    self.trelloEvents.monitor(
      'MyBoard', 
      { since: '2013-01-02T19:53:24.930Z', interval: 10 }
    )
    setTimeout(function() {
      self.trelloEvents.unmonitor('MyBoard')
      expect(self.eventCounters).to.eql(self.expectedEventCounters)
      done()
    }, 20)
  })
})
