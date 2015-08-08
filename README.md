#GROM.js
Awesome [co-powered](https://www.npmjs.com/package/co) build system.

[![npm package][npm-ver-link]][releases]

```
npm install -g gromjs
```

### Why?

The goal of grom.js is to be a plugin-less build system that will allow to use any node module to process files without pain. Gives more control

### Super simple

In `gromfile.js`:

```js
var processor = require('files-processor')
var R = require('ramda')

module.exports.task = function* (){
  var filesSet = yield this.read(['path/to/files'])
  var mappedFilesSet = filesSet.map(function*(file){
    var newSource = processor(yield file.source())
    return file.clone(newSource, { ext: '.processed'})
  })

  return yield this.write('path/to/dist', mappedFilesSet)
}
```

In terminal:

```
$ gromjs task
```

That's it. No special `grom-whatever` plugins, use whatever you want.

### API

+ `yield this.read(glob)` <br />
    Returns ordered Set of Files

+ `yield this.watch(glob)` <br />
  Returns events emitter, uses npm module [`watch`](https://www.npmjs.com/package/watch) and `watch.createMonitor` method


+ `yield this.write(glob, Set)` <br />
  Accepts glob, Set of Files and writes everything in right place.


+ `yield this.async(tasks)` <br />
  Accepts array of tasks and runs in asynchronously and independent to each other.


+ `yield this.seq(tasks)` <br />
  Runs tasks one by one from left to right, every next one get result from previous.

#### Set
  Is a set of `Files` uniq by glob, have next methods:

  + `elements()` <br/>
    Returns `Set`'s elements

  + `isContains(file)` <br/>
    Checks if `file` is in `Set` by file's glob

  + `add(file)` <br/>
    Returns new `Set` with all elements plus new one

  + `remove(element)` <br/>
    Returns new `Set` without single `element`

  + `union(set)` <br/>
    Returns new `Set` that is union of elements from both sets

  + `intersection(set)` <br/>
    Returns new `Set` that is intersection between sets

  + `difference(set)` <br/>
    Returns new `Set` that is difference between sets

  + `filter(iterator*)` <br/>
    Returns new `Set` with filtered elements

  + `sort(iterator*)` <br/>
    Returns new `Set` with sorted elements

  + `reduce(iterator*, accumulator)` <br/>
    Returns reduced value

  + `map(iterator*)` <br/>
    Returns new `Set` with mapped elements

  + `forEach(iterator*)` <br/>
    Iterates over elements and returns current `Set`


#### File

+ `path()` <br />
  Returns full path

+ `glob()` <br />
  Returns glob

+ `name()` <br />
  Returns name with extension

+ `source()` <br />
  Generator, returns file's source code

+ `clone([glob], [source])` <br />
  Creates new File, glob can be presented as hash with `dir`, `name`, `ext` fields which will be merged with parent file's path,
  path also can be just a string, if `glob` or `source` isn't provided, `clone` takes it from parent.


### Examples:

run tasks in sequence:
```js
var filesProcessor = require('files-processor')

var read = function* (){
  return yield this.read('/some/path/to/**.ext')
}

var processSet = function* (set){
  return set.map(function* (file){
    var source = yield file.source()
    return file.clone(yield extProcessor(source), { ext: 'js' })
  })
}

var write = function* (set){
  return yield this.write('/another/path', set)
}

module.exports.default = function* three(){
  yield this.seq([read, processSet, write])
}

```

watch files:
```js

module.exports.default = function* three(){
  var monitor = yield this.watch('*.js')
  monitor.on('change', function* (Set){
    yield this.async(someTask)
  })
}

```


compile less:

```js
var less = require('less')

module.exports.compileLess = function* compileLess (){
  var lessFilesSet = yield this.read('./code/**.less')

  var cssFilesSet = yield lessFilesSet.map(function* (file){
    var lessContents = (yield file.source()).toString()
    var css = (yield less.render(lessContents, {})).css
    return file.clone(css, { ext: 'css' })
  })

  return yield this.write('./dist', cssFilesSet)
}

```

### CLI

```

$ gromjs <task-name>

```


### TODO
* Tasks logger
* Tests
* More examples


# License

[MIT][mit] © [Dmitriy Kharchenko][author]


[mit]:          http://opensource.org/licenses/MIT
[author]:       http://github.com/aki-russia
[releases]:     https://github.com/aki-russia/gromjs/releases
[npm-pkg-link]: https://www.npmjs.org/package/gromjs
[npm-ver-link]: https://img.shields.io/npm/v/gromjs.svg?style=flat-square
