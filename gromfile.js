

module.exports.test = function* (){
  var source = yield this.source("adasdadddd")
  var js = yield coffee(source, {})
  yield this.seq([
    another({}),
    coffee({})

  ])
}


var another = function (options){
  return function* (files){

  }
}
