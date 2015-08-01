const R = require('ramda')
const co = require('co')

const callProp = R.curry(function(prop, element){
  return element[prop]()
})

const callPropEq = R.curry(function(value, prop, element){
  return element[prop]() == value
})

const samePath = function(elementA, elementB){
  return elementPath(elementA) === elementPath(elementB)
}

const elementPath = callProp('path')
const setElements = callProp('elements')
const elementToArray = function(element) {
  return [element]
}

var Set = function(elements){

  getElements = function(){
    return elements
  }

  return {
    elements: getElements,

    clone: function(){
      return Set(elements)
    },

    isContains: R.containsWith(
      samePath,
      R.__,
      elements
    ),

    add: R.compose(
      Set,
      R.uniqBy(elementPath),
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

    union: R.compose(
      Set,
      R.uniqBy(elementPath),
      R.concat(getElements()),
      setElements
    ),

    intersection: R.compose(
      Set,
      R.intersectionWith(samePath, getElements()),
      setElements
    ),

    difference: R.compose(
      Set,
      R.differenceWith(samePath, getElements()),
      setElements
    ),

    filter: function*(iterator){
      var unfilteredElements = getElements()
      var filteringMap = yield R.map(co.wrap(iterator), unfilteredElements)
      var indexOf = R.indexOf(R.__, unsortedElements)
      return Set(R.filter(function(element){
        return filteringMap[indexOf(element)]
      }, unfilteredElements))
    },

    sort: function*(iterator){
      var unsortedElements = getElements()
      var indexes = yield R.map(co.wrap(iterator), unsortedElements)
      var indexOf = R.indexOf(R.__, unsortedElements)
      return Set(R.sortBy(function(element){
        return indexes[indexOf(element)]
      }, unsortedElements))
    },

    reduce: function*(iterator, collector){
      return yield R.reduce(co.wrap(iterator), collector, getElements())
    },

    map: function*(iterator){
      var elements = yield R.map(co.wrap(iterator), getElements())
      return Set(elements)
    },

    forEach: function*(iterator){
      yield R.map(co.wrap(iterator), getElements())
      return this
    }
  }
}

module.exports = Set
