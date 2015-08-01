const R = require ('ramda')
const fs = require('mz/fs')
const path = require('path')
const co = require('co')

function parseGlob(glob){
  if(R.is(String, glob)){
    var ext = path.extname(glob)
    parsedGlob = {
      name: path.basename(glob, ext),
      ext: ext,
      dir: path.dirname(glob)
    }
  } else {
    parsedGlob = glob
  }

  parsedGlob.ext = parsedGlob.ext.replace(/^[\.]*/g, '.')
  return parsedGlob
}

const File = function(source, glob){
  if(R.is(String, source)){
    source = new Buffer(source)
  }
  var parsedGlob = parseGlob(glob)

  return {
    path: function(){
      return path.join(parsedGlob.dir, this.name() + this.ext())
    },

    glob: function(){
      return parsedGlob
    },

    name: function(){
      return parsedGlob.name
    },

    ext: function(){
      return parsedGlob.ext
    },

    source: function* (){
      if(!source){
        source = yield fs.readFile(this.path())
      }
      return source
    },

    clone: function(newSource, newGlob){
      if(R.is(Object, newGlob)){
        newGlob = R.merge(parsedGlob, newGlob)
      }
      return File(newSource || source, newGlob || parsedGlob)
    }
  }
}

module.exports = File
