var co = require('co')
var watch = require('watch')
var glob = require('glob')
var R = require ('ramda')
var fs = require('mz/fs')
var path = require('path')


var fileFabric = function(glob, buffer){

  buffer = buffer || null

  var ext = path.extname(glob)
  var parsedGlob = {
    name: path.basename(glob, ext),
    ext: ext,
    dir: path.dirname(glob)
  }
  var pathProps = R.props(['dir', 'name'])

  return {
    name: function(){
      return parsedGlob.name + parsedGlob.ext
    },
    ext: function(){
      return parsedGlob.ext
    },
    buffer: function* (){
      if(!buffer){
        buffer = yield fs.readFile(glob)
      }
      return buffer
    },
    source: function* (){
      return (yield this.buffer()).toString()
    },
    new: function(glob, buffer){
      if(!R.is(String, glob)){
        var newGlob = R.merge(parsedGlob, glob)
        glob = path.join(newGlob.dir, newGlob.name) + newGlob.ext
      }
      return fileFabric(glob, buffer)
    }
  }
}

var fabric = function () {
  var grom = {
    source: function* (globs){
      return new Promise(function(resolve, reject){
        glob(globs, {}, function (er, srcs){
          if(er){
            reject(er)
          } else {
            resolve(R.map(function (src){
              return fileFabric(src)
            }, srcs))
          }
        })
      })
    },



    watch: function* (glob){
      return watch.createMonitor(glob, function(monitor){
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

    dest: function* (glob, files){
      var destPath = path.join(process.cwd(), glob)
      var stats = null
      try {
        stats = yield fs.lstat(destPath)
      } catch(e){}


      var writeFile = co.wrap(function* (file){
        var stream = fs.createWriteStream(path.join(process.cwd(), glob, file.name()));
        var source = yield file.buffer()
        stream.once('open', function(fd) {
          stream.write(source);
          stream.end();
        });
        return file
      })

      if(R.is(Array, files)){
        if(!stats){
          yield fs.mkdir(destPath)
        }

        return R.map(writeFile, files)
      } else {
        return writeFile(files)
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
