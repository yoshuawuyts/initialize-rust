#!/usr/bin/env node
const cliclopts = require('cliclopts')
const minimist = require('minimist')
const pump = require('pump')
const util = require('util')
const fs = require('fs')

const pkg = require('../package.json')
const prompt = require('./prompt')
const main = require('../')

const opts = cliclopts([
  { name: 'help', abbr: 'h', boolean: true },
  { name: 'version', abbr: 'v', boolean: true },
  { name: 'directory', abbr: 'd', string: true },
  { name: 'user', abbr: 'u', string: true },
  { name: 'name', abbr: 'n', string: true },
  { name: 'description', abbr: 'd', string: true }
])

const argv = minimist(process.argv.slice(2), opts.options())

// parse options
if (argv.version) {
  const version = require('../package.json').version
  process.stdout.write('v' + version + '\n')
  process.exit(0)
} else if (argv.help) {
  process.stdout.write(pkg.name + ' - ' + pkg.description + '\n')
  usage(0)
} else {
  const argv = {}
  prompt(argv, function (err, argv) {
    if (err) return handleErr(err)
    main(argv, function (err) {
      if (err) return handleErr(err)
    })
  })
}

// handle error
// err -> null
function handleErr (err) {
  process.stderr.write(util.format(err) + '\n')
  process.exit(1)
}

// print usage & exit
// num? -> null
function usage (exitCode) {
  const rs = fs.createReadStream(__dirname + '/usage.txt')
  const ws = process.stdout
  pump(rs, ws, process.exit.bind(null, exitCode))
}
