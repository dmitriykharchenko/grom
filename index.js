const co = require('co')
const watch = require('watch')
const readGlob = require('read-glob-promise')
const R = require ('ramda')
const fs = require('mz/fs')


function grom () {
  var grom = {
    source: function(globs){
      return readGlob(globs)
    },
    watch: co.wrap(function* (glob){
      return yield Promise(function(resolve, reject) {
        watch.createMonitor(glob, function(monitor){
          resolve(monitor)
        })
      })
    }),

    dest: co.wrap(function* (glob, buffer){
      if(R.is(Array, buffer)){
        yield fs.rmdir(glob)
        yield fs.mkDir(glob)
        return yield R.map(function(bufferFile, index){
          return fs.writeFile(glob + 'index', bufferFile)
        }, buffer)
      } else {
        return yield fs.writeFile(glob, buffer)
      }
    }),

    async: co.wrap(function* (tasks){
      return yield R.map(function(task){
        task.bind(grom)()
      }, tasks)
    })
  }

  return grom
}
