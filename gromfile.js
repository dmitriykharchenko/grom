

module.exports.test = function* (){
  var source = yield this.source("adasdadddd")
  var js = yield coffee(source, {})
}


var another = function* (options){
  return "asdasd"
}
