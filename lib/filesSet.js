const R = require('ramda')
const co = require('co')

const exceptionsLog = require('./log')('danger', 'exception')

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

const wrap = function (operation, generator) {
  generator = co.wrap(generator)
  return function(file){
    return generator.apply(this, arguments).then(function(){}, function(e){
      exceptionsLog('Set '+ operation,
        'crashed',
        e.toString() + '\n' +
        file.path() + '\n' + e.codeFrame || '')
    })
  }
}

var Set = function(elements){
  elements = R.filter(R.compose(R.not, R.isNil), elements)

  getElements = function(){
    return elements || []
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
      var filteringMap = yield R.map(wrap('filter', iterator), unfilteredElements)
      var indexOf = R.indexOf(R.__, unsortedElements)
      return Set(R.filter(function(element){
        return filteringMap[indexOf(element)]
      }, unfilteredElements))
    },

    sort: function*(iterator){
      var unsortedElements = getElements()
      var indexes = yield R.map(wrap('sort', iterator), unsortedElements)
      var indexOf = R.indexOf(R.__, unsortedElements)
      return Set(R.sortBy(function(element){
        return indexes[indexOf(element)]
      }, unsortedElements))
    },

    reduce: function*(iterator, collector){
      return yield R.reduce(wrap('reduce', iterator), collector, getElements())
    },

    map: function*(iterator){
      var elements = yield R.map(wrap('map', iterator), getElements())
      return Set(elements)
    },

    forEach: function*(iterator){
      yield R.map(wrap('foreach', iterator), getElements())
      return this
    }
  }
}

module.exports = Set
