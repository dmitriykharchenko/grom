#GROM.js
Awesome [co-powered](https://www.npmjs.com/package/co) build system.

[![npm package][npm-ver-link]][releases]

```
npm install -g gromjs
```

### Why?

The goal of grom.js is to be a plugin-less build system that will allow to use any node module to process files without pain. In active development now, interface is about to change. Contributions are highly welcome.

### Super simple

In `gromfile.js`:

```js
var processor = require('files-processor')
var R = require('ramda')

module.exports.task = function* (){
  var files = yield this.source('path/to/src')
  var first = files[0]
  var processed = first.new({ext: "processed"}, yield processor((yield files[0].source()), options))
  yield this.dest('path/to/dist', processed)
}
```

In terminal:

```
$ gromjs task
```

That's it. No special `grom-whatever` plugins, use whatever you want.

### API

+ `yield this.source(glob)` <br />
    Returns array of Files

+ `yield this.watch(glob)` <br />
  Returns events emitter, uses npm module [`watch`](https://www.npmjs.com/package/watch) and `watch.createMonitor` method


+ `yield this.dest(glob, buffer)` <br />
  Accepts glob and buffer or array of buffers and writes everything in right place.


+ `yield this.async(tasks)` <br />
  Accepts array of tasks and runs in asynchronously and independent to each other.


+ `yield this.seq(tasks)` <br />
  Runs tasks one by one, every next one gets result from previous.


#### File

+ `name()` <br />
  Returns name with extension

+ `ext()` <br />
  Return extension

+ `buffer()` <br />
  Generator, returns file's Buffer

+ `source()` <br />
  Generator, returns file's source code

+ `new(path, buffer)` <br />
  Creates new File, path can be presented as hash with `dir`, `name`, `ext` fields which will be merged with parent file's path,
  path also can be just a string


### Examples:

run tasks in sequence:
```js
var filesProcessor = require('files-processor')

module.exports.task = function* one (){
  return 1
}

module.exports.two = function* two (results){
  return results + 2
}

module.exports.three = function* three(results){
  return results + 3
}

module.exports.default = function* three(){
  yield this.seq([one, two, three]) // 6
}

```

watch files:
```js

module.exports.default = function* three(){
  var monitor = yield this.watch('*.js')
  monitor.on('change', function* (){
    yield this.acync(someTask)
  })
}

```


process files:

```js
var processor = require('files-processor')
var R = require('ramda')

module.exports.task = function* (){
  var files = yield this.source('path/to/src')
  var first = files[0]
  var processed = first.new({ext: "processed"}, yield processor((yield files[0].source()), options))
  yield this.dest('path/to/dist', processed)
}
```

### CLI

```

$ gromjs <task-name>

```


# License

[MIT][mit] © [Dmitriy Kharchenko][author]


[mit]:          http://opensource.org/licenses/MIT
[author]:       http://github.com/aki-russia
[releases]:     https://github.com/aki-russia/gromjs/releases
[npm-pkg-link]: https://www.npmjs.org/package/gromjs
[npm-ver-link]: https://img.shields.io/npm/v/gromjs.svg?style=flat-square
