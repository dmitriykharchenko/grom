var co = require('co')
var watch = require('watch')
var glob = require('glob')
var R = require ('ramda')
var fs = require('mz/fs')
var path = require('path')

var Set = require('./filesSet')
var File = require('./file')

var gromLog = require('./log')('info', 'grom')
var exceptionsLog = require('./log')('danger', 'exception')

var taskWrapper = R.curry(function(context, task){
  return co.wrap(function* (){
    try {
      gromLog(task.name, 'started')
      var result = yield task.apply(context, arguments)
      gromLog(task.name, 'finished')
      return result
    } catch (e) {
      exceptionsLog(task.name, 'crashed', e.toString() + '\n' + e.codeFrame)
    }
  })
})

var grom = {
  Set: Set,
  File: File,
  read: function* (globs) {
    return new Promise(function(resolve, reject){
      glob(globs, {}, function (er, srcs){
        if(er) {
          reject(er)
        } else {
          resolve(Set(R.map(function(path){
            return File(null, path)
          }, srcs)))
        }
      })
    })
  },

  watch: function* (globs){
    return watch.createMonitor(globs, function(monitor){
      resolve({
        on: function(eventName, handler){
          var coHandler = co.wrap(handler).bind(grom)
          monitor.on(eventName, coHandler)
          return function(){
            monitor.off(eventName, coHandler)
          }
        }
      })
    })
  },

  write: function* (globs, filesSet){
    var destPath = path.join(process.cwd(), globs)
    var stats = yield fs.lstat(destPath)

    if(!stats){
      yield fs.mkdir(destPath)
    }

    function openStream(file){
      return fs.createWriteStream(path.join(destPath, file.name() + file.ext()))
    }

    var result = yield filesSet.forEach(function*(file){
      var stream = openStream(file).once('open', co.wrap(function* (){
        stream.write(yield file.source())
        stream.end()
      }))
      return true
    })
  },

  async: function* (tasks){
    if(!R.is(Array, tasks)){
      tasks = [tasks]
    }

    return yield R.map(function(file){
      return gromTaskWrapper(file)()
    }, tasks)
  },

  seq: function* (tasks, prevResult){
    if(!tasks || tasks.length == 0){
      return prevResult
    }
    var prevResult = yield gromTaskWrapper(tasks[0])(prevResult)
    return yield this.seq(R.drop(1, tasks), prevResult)
  }
}

var gromTaskWrapper = taskWrapper(grom)

module.exports = grom
