var co = require('co')
var watch = require('watch')
var glob = require('glob')
var R = require ('ramda')
var fs = require('mz/fs')
var path = require('path')


var fileFabric = function(src, buffer){
  var ext = path.extname(src)
  var parsedPath = {
    name: path.basename(src, ext),
    ext: ext,
    dir: path.dirname(src)
  }
  if(buffer){
    buffer = new Buffer(buffer)
  } else {
    buffer = null
  }


  return file = {
    buffer: function(){
      return buffer
    },
    toString: function(){
      return buffer.toString()
    },
    ext: function(ext){
      if(ext){
        parsedPath.ext = ext
      }
      return parsedPath.ext
    },
    name: function(name){
      if(name){
        parsedPath.name = name
      }
      return parsedPath.name + parsedPath.ext
    },
    src: function(){
      return path.join(parsedPath.dir, this.name())
    },
    new: function(buffer){
      return fileFabric(this.src(), buffer)
    }
  }
}

var fabric = function () {
  var grom = {
    source: function* (globs, options){
      var options = R.merge({ read: true }, options)

      return new Promise(function(resolve, reject){
        glob(globs, {}, co.wrap(function* (er, srcs){
          if(er){
            reject(er)
          } else {
            var files = yield R.map(co.wrap(function* (src){
            var file = fileFabric(src)
            if(options.read){
              return fileFabric(src, yield fs.readFile(src))
            } else {
              return fileFabric(src)
            }

            }), srcs)
            resolve(files)
          }
        }))
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


      var writeFile = function(file){
        var stream = fs.createWriteStream(path.join(process.cwd(), glob, file.name()));

        stream.once('open', function(fd) {
          stream.write(file.buffer());
          stream.end();
        });
        return file
      }

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
