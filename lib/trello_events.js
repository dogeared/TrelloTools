var emitter = require('events').EventEmitter
var _ = require('underscore')
var async = require('async')
var Trello = require('node-trello')

var TrelloEventsClass = function(_key, _token) {
  var key, token, trello, boards

  key = _key
  token = _token
  trello = new Trello(key, token)
  boards = {}

  var eventLoop = function(board, callback) {
    var processActions = function(err, actions) {
      if (err) return callback(err)
      // FIXME: assuming latest action is first
      if (actions[0]) boards[board].since = actions[0].date
      async.forEach(actions, function(action) {
        trelloEvents.emit(action.type, action)
      }, callback)
    }

    var since = (boards[board].since) ? {since: boards[board].since} : {}
    // FIXME: could be bad if unmonitor was called just before we got here
    trello.get(
      '/1/boards/' + boards[board].id + '/actions', 
      since,
      processActions
    )
  }

  var startEventLoop = function(board) {
    async.whilst(
      function() { return boards[board] },
      function(callback) {
        setTimeout(function() { eventLoop(board, callback) }, 1000)
      },
      function(err) {
        if (err) throw err
      }
    )
  }

  var stopEventLoop = function(board) {
    boards[board] = false
  }

  var trelloEvents =  {
    credentials: function() {
      return { key: key, token: token }
    },
    monitor: function(board, since) {
      // FIXME: maybe should grab boards at instantiation time?
      trello.get(
        '/1/members/me/boards',
        {fields: 'name', filter: 'open'},
        function(err, _boards) {
          if (err) throw err
          var boardInfo = _.find(
            _boards,
            function(_board) { return _board.name === board }
          )
          boards[board] = {}
          boards[board].id = boardInfo.id
          if (since) boards[board].since = since
          startEventLoop(board)
        }
      )
    },
    unmonitor: function(board) {
      stopEventLoop(board)
    },
    monitoring: function(board) {
      return boards[board]
    }
  }
  trelloEvents.__proto__ = new emitter()
  emitter.call(trelloEvents)
  return trelloEvents
}

module.exports = TrelloEventsClass
