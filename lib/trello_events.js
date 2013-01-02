var emitter = require('events').EventEmitter
var util = require('util')
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
    //trelloEvents.emit('createList', { a: 'b' })
    var processActions = function(err, actions) {
      async.forEach(actions, function(action) {
        trelloEvents.emit(action.type, action)
      }, function(err) {
        callback()
      })
    }

    trello.get('/1/boards/' + boards[board] + '/actions', processActions)
  }

  var startEventLoop = function(board) {
    async.whilst(
      function() { return boards[board] },
      function(callback) {
        setTimeout(function() { eventLoop(board, callback) }, 1000)
      },
      function(err) {
        // event loop done
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
    monitor: function(board) {
      trello.get(
        '/1/members/me/boards',
        {fields: 'name'},
        function(err, _boards) {
          // FIXME
          if (err) throw err
          var boardInfo = _.find(
            _boards,
            function(_board) { return _board.name === board }
          )
          boards[board] = boardInfo.id
          startEventLoop(board)
        }
      )
    },
    unmonitor: function(board) {
      stopEventLoop(board)
    },
    monitoring: function(board) {
      return (boards[board])?true:false
    }
  }
  trelloEvents.__proto__ = new emitter()
  emitter.call(trelloEvents)
  return trelloEvents
}

module.exports = TrelloEventsClass
