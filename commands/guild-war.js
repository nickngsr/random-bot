const utz = require('../common/user-time-zone');
const _ = require('lodash');
const Discord = require('discord.js');

module.exports.help = function() {
  return '```md\n# Display guild war start times\n\nrb.guild-war```*Only guild members who have registered a timezone will be shown*\n';
};

module.exports.message = async function(message) {
  if (!message.guild) return;

  if (message.channel && (message.channel.name === 'friends-of-the-guild' || message.channel.name === 'lobby')) {
    await message.channel.send(`The guild war times are not visible in this channel.`);
    return;
  }

  let users = await utz.getTimezones(message.guild.id, true);
  users = _.sortBy(users, 'gwTime');
  let response = '';
  _.each(users, (user, index) => {
    const member = message.guild.members.get(user.user);
    response += `${member.displayName}: **${user.gwTime}**\n\n`;
  });

  const msg = new Discord.RichEmbed();
  msg.setTitle('Guild War Start Time');
  msg.setDescription(response);

  const me = message.guild.member(message.client.user);
  if (me.colorRole) {
    msg.setColor(me.colorRole.color);
  }

  msg.setFooter(`requested by @${message.member.displayName}`);

  await message.channel.send(msg);

};
