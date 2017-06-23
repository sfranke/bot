const logger = exports
const config = JSON.parse(require('fs').readFileSync('config.json'))
const path = require('path')
const fs = require('fs')

logger.debuglevel = config.debuglevel
fs.openSync(path.join(__dirname, '/log'), 'a')

function date () {
  let date = new Date()
  return date
}

logger.log = function (level, message) {
  let levels = ['error', 'warning', 'info', 'debug']
  if (levels.indexOf(level) <= levels.indexOf(logger.debuglevel)) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message)
    }
    console.log(date() + ' ' + level + ': ' + message)
    fs.appendFile(path.join(__dirname, '/log'), date() + ' ' + level + ': ' + message + '\n', function (err) {
      if (err) {
        logger.log('error', 'Failed to write to log file!')
      }
    })
  }
}
