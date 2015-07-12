#!/bin/sh
":" //# comment; exec /usr/bin/env node --harmony --harmony_arrow_functions "$0" "$@"

if (!require("yieldables")) throw new Error("Grom requires generators support (node >= 0.11)")

var program = require('commander');
var path = require('path');
var packageJson = require('../package')
var cli = require('../lib/cli')


program
  .version(packageJson.version)
  .usage('<task name>')
  .option('-F --file <path>', 'gromfile location')
  .arguments('<cmd>')
  .action(function(command, options){
    var taskName = command || 'default'
    var gromFile = path.join(process.cwd(), options.file || 'gromfile.js')
    cli.runTask(gromFile, taskName)
  })
  .parse(process.argv);
