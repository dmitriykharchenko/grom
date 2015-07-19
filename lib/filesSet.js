const R = require('ramda')

const callProp = R.curry(function(prop, element){
  return element[prop]()
})

const callPropEq = R.curry(function(value, prop, element){
  return element[prop]() == value
})

const sameName = function(elementA, elementB){
  return elementName(elementA) === elementName(elementB)
}

const elementName = callProp('name')
const setElements = callProp('elements')
const elementToArray = function(element) {
  return [element]
}


const coWrap = function (func){
  return co.wrap(func)
}


var Set = R.curry(function(elements){

  getElements = function(){
    return elements
  }

  return {
    contains: R.containsWith(
      sameName,
      R.__,
      elements
    ),

    elements: getElements,

    merge: R.compose(
      Set,
      R.uniqBy(elementName),
      R.concat(getElements()),
      setElements
    ),

    add: R.compose(
      Set,
      R.uniqBy(elementName),
      R.concat(getElements()),
      elementToArray
    ),

    remove: R.compose(
      Set,
      R.remove(R.__, 1, getElements()),
      R.findIndex(R.__, getElements()),
      callPropEq(R.__, 'name'),
      callProp('name')
    ),

    intersection: R.compose(
      Set,
      R.intersectionWith(sameName, getElements()),
      setElements
    ),

    filter: function*(iterator){
      var elements = yield R.filter(co.wrap(iterator), getElements())
      return Set(elements)
    },

    sort: function*(iterator){
      var elements = yield R.sort(co.wrap(iterator), getElements())
      return Set(elements)
    },

    reduce: function*(iterator, collector){
      var elements = yield R.reduce(co.wrap(iterator), collector, getElements())
      return Set(elements)
    },

    map: function*(iterator){
      var elements = yield R.map(co.wrap(iterator), getElements())
      return Set(elements)
    },

    forEach: function(iterator){
      yield R.map(co.wrap(iterator), getElements())
      return this
    }
  }
})

module.exports = Set
