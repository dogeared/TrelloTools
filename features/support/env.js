exports.peanut = function(callback) {
  global.inspect = require('eyes').inspector({ maxLength: 100000 })
  global.settings = require('../../config/environments/test/settings')
  callback()
}
