#GROM.js
Awesome [co-powered](https://www.npmjs.com/package/co) build system.

[![npm package][npm-ver-link]][releases]

```
npm install -g gromjs
```

### Super simple

In `gromfile.js`:

```js
var filesProcessor = require('files-processor')

module.exports.task = function* (){
  var source = yield this.source('path/to/src')
  var processed = yield filesProcessor(source, options)
  yield this.dest('path/to/dist', processed)
}
```

In terminal:

```
$ gromjs task
```

That's it. No special `grom-whatnever` plugins, use whatever you want that can accept and return `Buffer` or array of buffers.

### API

+ `yield this.source(glob)` <br />
    Returns buffer or array of buffers

+ `yield this.watch(glob)` <br />
  Returns events emitter, uses npm module [`watch`](https://www.npmjs.com/package/watch) and `watch.createMonitor` method


+ `yield this.dest(glob, buffer)` <br />
  Accepts glob and buffer or array of buffers and writes everything in right place.


+ `yield this.async(tasks)` <br />
  Accepts array of tasks and runs in asynchronously and independent to each other.


+ `yield this.seq(tasks)` <br />
  Runs tasks one by one, every next one gets result from previous.


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
var filesProcessor = require('files-processor')

module.exports.task = function* (){
  var source = yield this.source('path/to/src')
  var processed = yield filesProcessor(source, options)
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
[releases]:     https://github.com/aki-russia/grom/releases
[npm-pkg-link]: https://www.npmjs.org/package/grom
[npm-ver-link]: https://img.shields.io/npm/v/grom.svg?style=flat-square
