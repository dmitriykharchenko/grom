var co = require('co')
var watch = require('watch')
var readGlob = require('read-glob-promise')
var R = require ('ramda')
var fs = require('mz/fs')

var fabric = function () {
  var grom = {
    source: function* (globs){
      return yield readGlob(globs)
    },

    watch: function* (glob){
      return yield Promise(function(resolve, reject) {
        watch.createMonitor(glob, function(monitor){
          resolve({
            on: function(eventName, handler){
              var coHandler = co.wrap(handler)
              monitor.on(eventName, coHandler)
              return function(){
                monitor.off(eventName, coHandler)
              }
            }
          })
        })
      })
    },

    dest: function* (glob, buffer){
      if(R.is(Array, buffer)){
        yield fs.rmdir(glob)
        yield fs.mkDir(glob)
        return yield R.map(function(bufferFile, index){
          return fs.writeFile(glob + 'index', bufferFile)
        }, buffer)
      } else {
        return yield fs.writeFile(glob, buffer)
      }
    },

    async: function* (tasks){
      if(!R.is(Array, tasks)){
        tasks = [tasks]
      }

      return yield R.map(function(task){
        return co(task.bind(grom))
      }, tasks)
    },

    seq: function* (tasks, prevResult){
      if(!tasks || tasks.length == 0){
        return
      }
      var task = tasks[0].bind(grom)
      var prevResult = yield task(prevResult)
      return yield this.seq(R.drop(1, tasks), prevResult)
    }
  }

  return grom
}

module.exports = fabric()
