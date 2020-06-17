const fs = require('fs');

module.exports.help = [];

module.exports.init = function(client) {

  client.on('raw', async event => {

    if (event.t !== 'MESSAGE_REACTION_ADD') return;

    const {d: data} = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id);

    // if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const reaction = message.reactions.get(emojiKey);
    client.emit('reaction:add', reaction, user);

  });

  fs.readdirSync(__dirname).forEach(function(file) {

    if (file !== 'index.js') {
      const fileName = file.split('.')[0];
      const reaction = require('./' + fileName);
      if (typeof reaction.add === 'function') {
        client.on(`reaction:add`, reaction.add);
        console.log(`Registered '${fileName}' add reaction`);
      }
      if (typeof reaction.remove === 'function') {
        client.on(`reaction:remove`, reaction.remove);
        console.log(`Registered '${fileName}' remove reaction`);
      }
      if (typeof reaction.help === 'function') {
        module.exports.help.push(reaction.help());
      }
    }

  });

};
