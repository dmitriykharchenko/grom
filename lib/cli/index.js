var grom = require('../grom')
var co = require('co')
var eventsLog = require('../log')('info', 'grom')

module.exports.runTask = function(gromFilePath, taskName){
  var task = require(gromFilePath)[taskName]
  eventsLog('Using gromfile', gromFilePath)
  return co(grom.async(task))
}
