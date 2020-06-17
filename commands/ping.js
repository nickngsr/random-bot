// don't display ping in help
// module.exports.help = function() {
//   return '```md\n# Check Ping to Discord API\n\nrb.ping```';
// };

module.exports.message = function(message) {
  const ping = message.client.ping.toFixed(0);
  const messageDelay = Date.now() - message.createdTimestamp;
  message.channel.send(`My ping to the Discord API is ${ping}ms, but your ping message took ${messageDelay}ms to reach me.`);
};
