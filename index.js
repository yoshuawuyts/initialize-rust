const copy = require('copy-template-dir')
const mapLimit = require('map-limit')
const gitInit = require('git-init')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')
const rc = require('rc')

module.exports = initializeCli

// Create a fresh cli
// (obj, fn) -> null
function initializeCli (argv, cb) {
  argv.dependencies = [ 'cliclopts', 'minimist', 'pump' ]
  const tasks = [ getUser, mkdir, createGit, copyFiles, setMod ]

  mapLimit(tasks, 1, iterator, cb)
  function iterator (fn, next) {
    fn(argv, next)
  }
}

// copy files from dir to dist
// (obj, fn) -> null
function copyFiles (argv, cb) {
  const inDir = path.join(__dirname, 'templates')
  copy(inDir, process.cwd(), argv, cb)
}

// change to directory
// (obj, fn) -> null
function mkdir (argv, cb) {
  const loc = path.resolve(path.join(argv.directory, argv.name))
  mkdirp(loc, function (err) {
    if (err) return cb(err)
    process.chdir(loc)
    argv.directory = loc
    argv.d = loc
    cb()
  })
}

// get the current user if no user was
// specified
// (obj, fn) -> null
function getUser (argv, next) {
  if (argv.user) return next()

  const conf = rc('npm')
  if (!conf) return next('no npm config found')

  const github = conf['init.author.github']
  if (!github) return next('no init.author.github set')

  const name = conf['init.author.name']
  if (!name) return next('no init.author.name set')

  argv.user = github
  argv.realName = name
  next()
}

// change permissions on executable
// (obj, fn) -> null
function setMod (argv, next) {
  const routes = [
    'scripts/build',
    'scripts/install',
    'scripts/start',
    'scripts/test'
  ]

  mapLimit(routes, 1, iterator, next)
  function iterator (route, next) {
    fs.chmod(path.join(process.cwd(), route), '755', next)
  }
}

// create git repository
// (obj, cb) -> null
function createGit (argv, next) {
  const path = argv.path
  gitInit(path, next)
}
