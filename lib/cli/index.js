var grom = require('../grom')
var co = require('co')

module.exports.runTask = function(gromFilePath, taskName){
  var task = require(gromFilePath)[taskName]
  return co(grom.async(task))
}
