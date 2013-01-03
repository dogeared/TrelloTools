var async = require('async')
var expect = require('expect.js')
var TrelloEvents = require('../../lib/trello_events')

Given(/^I setup the trello event listener$/, function(step) {
  var self = this
  self.trelloEvents = TrelloEvents(settings.key, settings.token)
  self.trelloEvents.on('createList', function(data) {
    self.action = data
    self.trelloEvents.unmonitor(settings.board)
  })
  expect(this.trelloEvents.listeners('createList').length).to.be(1)
  step.done()
});

When(/^I check the event information$/, function(step) {
  var self = this
  self.trelloEvents.monitor(settings.board, { interval: 1000 })

  var checkUnmonitored = function() {
    if (!self.trelloEvents.monitoring(settings.board)) {
      clearInterval(interval)
      expect(self.action).to.not.be(undefined)
      step.done()
    }
  }

  var checkMonitored = function() {
    if (self.trelloEvents.monitoring(settings.board)) {
      clearInterval(interval)
      interval = setInterval(checkUnmonitored, 200)
    }
  }

  var interval = setInterval(checkMonitored, 200)
});

Then(/^I should see the event for "([^"]*?)"$/, function(step, lane) {
  var self = this
  expect(self.action.data.list.name).to.be(lane)
  step.done()
});
