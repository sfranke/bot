const twitchStream = require('twitch-stream')
const logger = require('./logger.js')
const config = JSON.parse(require('fs').readFileSync('config.json'))
const util = require('util')

let stdin = process.stdin;

// without this, we would only get streams once enter is pressed
// stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

// on any data into stdin
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }
  logger.log('debug', 'Got your input: ' + key)
  // write the key to stdout all normal like
  // process.stdout.write( key );
});

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
    // logger.log('debug', 'done()' + util.inspect(client))

    // Join any channel.
    client.join(config.channel[0])

    // Data event for incoming messages.
    client.on('data', function(res) {
      logger.log('debug', 'client.on(\'data\') response: ' + util.inspect(res))

      // Here we can get access to all the information that get sent our way.
      let command = res.trailing.split('!')
      let user = res.string.split('!')
      let channelName = res.params
      logger.log('debug', 'MyChannelname: ' + channelName)

      logger.log('info', user[0] + ": in " + channelName + ': ' + res.trailing)

      // See if there is a '!' (exclamation mark) at the beginning.
      if (res.trailing != undefined && res.trailing.charAt(0) == '!') {
        logger.log('debug', 'Recognized a chat command!')
        // Output all strings here once for debug.
        logger.log('debug', 'Test command: ' + command[1])
        logger.log('debug', 'channelName: ' + channelName)

        // Checking for specific command string, here: 'help'.
        if (command[1] == 'help' && user[0] == ':webeplaying') {
          logger.log('debug', 'This is where the help command should be handled.')
          logger.log('info', 'Sending response to chat.. ' + '~~~ Gotcha !help command ~~~')
          client.send(channelName, '~~~ Gotcha !help command ~~~')
        }
      }

      // See if we can find a http link in the message sent.
      if (res.trailing != undefined && res.trailing.match(/\s?https?:\s?/g)) {
        logger.log('debug', 'client.on(\'data\') -> Found link! ' + util.inspect(res))
        logger.log('info', 'Found link! ' + 'Posted by: ' + user[0] + ' in: ' + channelName + '\n' + res.trailing)

        // Iterating the text and check for a valid link in there.
        let sentence = res.trailing.split(' ')
        for (word in sentence) {
          logger.log('debug', 'Checking each word in the sentence: ' + sentence[word])
          if (sentence[word].match(/^https?:/g)) {
            logger.log('debug', 'Extracted link: ' + sentence[word])
            logger.log('info', 'Extracted link: ' + sentence[word])
            // Now here check the link.
          }
        }
      }
    })

    // Error event so we don't crash.
    client.on('error', function(res) {
      logger.log('debug', 'client.on(\'error\')' + util.inspect(res))
    })
  }
})
