const insults = require('insults');

module.exports.help = function() {
  return '```md\n# Generate a random insult\n\nrb.insult\n\nrb.insult <@user>```';
};

module.exports.message = function(message) {

  let prefix = '';
  let isSelf = false;
  if (message.mentions.users && message.mentions.users.array().length) {
    const members = message.mentions.users.map(user => {
      if (!isSelf) {
        isSelf = user.id === message.client.user.id;
      }
      return `<@${user.id}>`;
    });
    prefix += members.join(' ');
    prefix += ' ';
  }

  if (!isSelf) {
    message.channel.send(`${prefix}${insults.default()}`);
  } else {
    message.channel.send(`${message.author}, you really think i'm going to insult myself? ${insults.default()}`)
  }


};
