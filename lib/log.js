const chalk = require('chalk')
const R = require('ramda')

var startTime = null;

var categoryColors = {
  'info': 'blue',
  'danger': 'red'
}

module.exports = R.curry(function(type, category, action, label){

  category = chalk[categoryColors[type]](category)
  action = chalk.white(action)
  label = chalk.yellow(label)

  args = R.drop(1, arguments)

  if(!startTime) {
    startTime = process.hrtime()
  } else {
    var time = process.hrtime(startTime)

    var timing = null

    if (!time[0] && time[1] < 1000) {
      timing = time[1] + " μs"
    } else if (!time[0] && 1000 <= time[1]) {
      timing = (time[1] / 1000000).toFixed(2) + ' ms'
    } else if (time[0]) {
      timing = (time[0] + 1000000000 / time[1]).toFixed(2) + ' s'
    }

    timing = chalk.blue(timing)
    args.push(timing)
  }

  return console.log.apply(console, args)
})
