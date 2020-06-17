const redis = require('../redis');

module.exports.help = function() {
  return '```md\n# Show the current translation quota for this month\n\nrb.translate-quota```';
};

module.exports.message = async function(message) {
  if (!message.guild) return;

  const options = await redis.hmget(`${message.guild.id}-goptions`, 'counter', 'limit');
  const counter = parseInt(options[0] || 0, 10);
  const limit = options[1] === null ? 'unlimited' : options[1];

  message.channel.send(`You have used ${counter} out of your ${limit} character limit this month for translation`);

};
