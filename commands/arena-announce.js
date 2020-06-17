const redis = require('../redis');

module.exports.help = function() {
  return '```md\n# Set/un-set the current channel as the arena announcement channel\n\nrb.arena-announce```';
};

module.exports.message = async function(message) {
  if (!message.guild) return;

  const currentChannel = await redis.hget(`${message.guild.id}-goptions`, "arena-channel");

  if (message.channel.id === currentChannel) {
    await redis.hdel(`${message.guild.id}-goptions`, 'arena-channel');
    message.channel.send(`I have un-set this channel to be where arena announcements are made.`);
    return;
  }

  await redis.hset(`${message.guild.id}-goptions`, "arena-channel", message.channel.id);

  message.channel.send(`I have set this channel to be where arena announcements are made.`);

};
