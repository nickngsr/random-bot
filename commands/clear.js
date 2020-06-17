// command very specific to random's lobby
module.exports.message = async function(message) {
  if (!message.guild) return;
  if (message.guild.name !== 'Random - Hero Wars') return;
  if (message.channel.name !== 'lobby') return;

  const lobby = message.channel;
  let deleted = 0;
  do {
    const messages = await lobby.bulkDelete(100, true);
    deleted = messages.size;
    console.log(`Deleted ${deleted} messages from the lobby.`);
  } while(deleted > 2);

};
