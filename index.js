const twitchStream = require('twitch-stream')
const logger = require('./logger.js')
const config = JSON.parse(require('fs').readFileSync('config.json'))
const util = require('util')

twitchStream.connect({
  // Connection credentials.
  user : config.user,
  pass : config.oauth,
  channel : config.channel,
  // Any data sent on the any of the channels
  data: function(msg)
  {
      logger.log('debug', 'data(msg)' + util.inspect(msg))
  },
  // Error handler.
  error: function(err)
  {
    logger.log('debug', 'error()' + util.inspect(err))
  },
  // This one gets fired after the connection is established.
  done: function(client)
  {
    logger.log('debug', 'done()' + util.inspect(client))

    // Join any channel.
    client.join(config.channel[0])

    // Data event for incoming messages.
    client.on('data', function(res) {
      logger.log('debug', 'client.on(\'data\') response: ' + util.inspect(res))

      // Here we can get access to all the information that get sent our way.
      let command = res.trailing.split('!')
      let user = res.string.split('!')
      let channel = res.string.split('@')


      // See if there is a '!' (exclamation mark) at the beginning.
      if (res.trailing != undefined && res.trailing.charAt(0) == '!') {
        logger.log('debug', 'Recognized a chat command!')
        // Output all strings here once for debug.
        logger.log('debug', 'Test command: ' + command[1])
        logger.log('debug', 'Filter channel name: ' + channel[1].match(/^(.*?)\..*/g))

        // Isolate the channel name.
        let channelName = channel[1].split('.')
        logger.log('debug', 'channelName: ' + channelName[0])

        // Checking for specific command string, here: 'help'.
        if (command[1] == 'help' && user[0] == ':webeplaying') {
          logger.log('debug', 'This is where the help command should be handled.')
          client.send('#' + channelName[0], '~~~ Gotcha !help command ~~~')
        }
      }

      // See if we can find a http link in the message sent.
      if (res.trailing != undefined && res.trailing.match(/^https?:/g) && user[0] == ':webeplaying') {
        logger.log('debug', 'client.on(\'data\') -> Found link!')
      }
    })

    // Error event so we don't crash.
    client.on('error', function(res) {
      logger.log('debug', 'client.on(\'error\')' + util.inspect(res))
    })
  }
})
