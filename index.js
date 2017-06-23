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
      logger.log('debug', msg)

      // Display all info available for a message, if there's a user attribute.
      if (msg.user != undefined) {
        logger.log('info', msg.user + ' said: ' + '\'' + msg.message + '\'' + ' in channel #' + msg.channel)
      }
      // Any message that start with an '!' (exclamation point)
      if (msg.message != undefined &&  msg.message.charAt(0) == '!') {
        logger.log('debug', 'Recognized a chat command!')
        // Start to break down the command..
        let command = msg.message.split('!')
        logger.log('debug', util.inspect(command))
        logger.log('debug', 'Test command: ' + command[1])
        if (command[1] == 'help' && msg.user == 'webeplaying') {
          logger.log('debug', 'This is where the help command can be handled.')
        }

      }
      // Any message that matches the given regex. Any message that contains a 'http(s):'.
      if (msg.message != undefined && msg.message.match(/^https?:/g)) {
        logger.log('debug', 'Found link!')
      }
  },
  // Error handler.
  error: function(err)
  {
    logger.log('debug',err)
  },
  // This one gets fired after the connection is established.
  done: function(client)
  {
    client.join(config.channel[0])
    // client.send('#webeplaying', 'Test message at startup..')
  }
})
