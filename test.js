const concat = require('concat-stream')
const statMode = require('stat-mode')
const readdirp = require('readdirp')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const path = require('path')
const test = require('tape')
const uuid = require('uuid')
const fs = require('fs')

const init = require('./')

test('should create files', function (t) {
  t.plan(20)

  const route = path.join(process.cwd(), 'tmp', uuid.v1().slice(0, 6))
  mkdirp.sync(route)

  const tags = [ '"foo"', '"bar"', '"gaz"' ]
  const argv = { directory: route, name: 'foobar', user: 'binbaz', tags: tags }
  init(argv, function (err) {
    t.ifError(err, 'no err')

    const opts = { root: route, directoryFilter: [ '!node_modules', '!.git' ] }
    readdirp(opts).pipe(concat({ object: true }, function (arr) {
      t.ok(Array.isArray(arr), 'is array')

      arr = arr.map(function (obj) { return obj.path })
      t.notEqual(arr.indexOf('.gitignore'), -1, '.gitignore')
      t.notEqual(arr.indexOf('.travis.yml'), -1, '.travis.yml')
      t.notEqual(arr.indexOf('Cargo.toml'), -1, 'Cargo.toml')
      t.notEqual(arr.indexOf('LICENSE'), -1, 'LICENSE')
      t.notEqual(arr.indexOf('README.md'), -1, 'README.md')
      t.notEqual(arr.indexOf('main.rs'), -1, 'main.rs')
      t.notEqual(arr.indexOf('scripts/build'), -1, 'scripts/build')
      t.notEqual(arr.indexOf('scripts/install'), -1, 'scripts/install')
      t.notEqual(arr.indexOf('scripts/start'), -1, 'scripts/start')
      t.notEqual(arr.indexOf('scripts/test'), -1, 'scripts/test')

      const modes = [
        'scripts/build',
        'scripts/install',
        'scripts/start',
        'scripts/test'
      ]

      modes.forEach(function (execRoute) {
        const statRoute = path.join(route, execRoute)
        const stat = fs.statSync(statRoute)
        t.equal(typeof stat, 'object')
        const mode = statMode(stat)
        t.ok(mode.owner.execute, 'is executable')
      })

      rimraf.sync(route)
    }))
  })
})
