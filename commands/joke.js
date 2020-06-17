const axios = require('axios');

module.exports.help = function() {
  return '```md\n# Generate a random joke\n\nrb.joke```';
};

module.exports.message = async function(message) {
  message.channel.startTyping();
  try {
    const joke = await axios.get("https://icanhazdadjoke.com", {
      headers: {
        accept: 'text/plain'
      }
    });
    message.channel.send(`${joke.data}`);
  } catch (e) {
    message.channel.send('I failed to get a joke, I guess the joke\'s on me :slight_frown:');
  }

  message.channel.stopTyping();

  message.delete();
};
