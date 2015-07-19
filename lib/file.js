const R = require ('ramda')

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
}

const File = function(glob, source){
  var parsedGlob = parseGlob(glob)

  return {
    glob: function(glob){
      if(glob){
        parsedGlob = parseGlob(glob)
      }
      return parsedGlob
    },

    name: function(name){
      if(name){
        parsedGlob.name = name
      }
      return parsedGlob.name
    },

    source: function(newSource){
      if(newSource){
        source = newSource
      }
      return source
    },

    clone: function(newGlob, newSource){
      if(R.is(Object newGlob)){
        newGlob = R.merge(parsedGlob, newGlob)
      }
      return File(newGlob || parsedGlob, newSource || source)
    }
  }
}


module.exports = File
