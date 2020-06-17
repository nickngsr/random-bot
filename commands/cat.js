const rp = require('random-puppy');
const Discord = require('discord.js');

module.exports.help = function() {
  return '```md\n# Generate a random cat picture\n\nrb.cat```';
};

module.exports.message = async function(message) {
  const url = await rp('cats');
  const embed = new Discord.RichEmbed();
  embed.setImage(url);
  if (message.guild) {
    const me = message.guild.member(message.client.user);
    if (me.colorRole) {
      embed.setColor(me.colorRole.color);
    }
    embed.setFooter(`requested by @${message.member.displayName}`);
  }
  message.channel.send(embed);
  if (message.guild) {
    message.delete();
  }
};
