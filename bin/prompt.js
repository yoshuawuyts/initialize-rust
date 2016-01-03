const variableName = require('variable-name')
const prompt = require('inquirer').prompt
const assign = require('object-assign')

module.exports = runPrompt

// create prompt
// (obj, fn) -> null
function runPrompt (argv, cb) {
  const questions = []

  if (!argv.name) {
    questions.push({
      name: 'name',
      default: '',
      message: 'Package name'
    })
  }

  if (!argv.description) {
    questions.push({
      name: 'description',
      message: 'Package description',
      default: '',
      filter: function (str) {
        if (!str) return
        return str[0].toUpperCase() + str.slice(1)
      }
    })
  }

  if (!argv.tags) {
    questions.push({
      name: 'tags',
      default: '',
      message: 'Package tags',
      filter: function (str) {
        str = str || ''
        return str.split(',').map(function (str) {
          return '"' + str.trim() + '"'
        })
      }
    })
  }

  prompt(questions, function (res) {
    res.varName = variableName(res.name)
    assign(argv, res)
    cb(null, argv)
  })
}
