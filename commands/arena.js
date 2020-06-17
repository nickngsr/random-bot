const utz = require('../common/user-time-zone');
const _ = require('lodash');
const Discord = require('discord.js');

module.exports.help = function() {
  return '```md\n# Display arena reward times\n\nrb.arena```*Only guild members who have registered a timezone will be shown*\n';
};

module.exports.message = async function(message) {
  if (!message.guild) return;

  // Random specific
  // TODO: Change this so commands can be ignored per channel by command
  if (message.channel && (message.channel.name === 'friends-of-the-guild' || message.channel.name === 'lobby')) {
    await message.channel.send(`The arena timers are not visible in this channel.`);
    return;
  }

  // get all of the saved timezones for this discord server
  let users = await utz.getTimezones(message.guild.id, true);
  users = _.sortBy(users, 'diff');
  let response = '';
  _.each(users, async (user, index) => {
    const member = message.guild.members.get(user.user);
    if (member) {
      response += `${member.displayName}: **${user.text}**\n\n`;
    } else {
      console.log(`No longer a member: ${user.user}`);
      try {
        await utz.unsetTimezone(message.guild.id, user.user);
      } catch (e) {
        // don't really care if it fails
      }

    }

  });

  const msg = new Discord.RichEmbed();
  msg.setTitle('Time to arena rewards');
  msg.setDescription(response);

  const me = message.guild.member(message.client.user);
  if (me.colorRole) {
    msg.setColor(me.colorRole.color);
  }

  msg.setFooter(`requested by @${message.member.displayName}, this message will self destruct in 2 minutes`);

  const sent = await message.channel.send(msg);

  // set up the self destruct
  if (message.guild) {
    message.delete();
    setTimeout(() => {
      if (message.channel.messages.has(sent.id)) {
        sent.delete();
      }
    }, 2 * 60 * 1000);
  }

};
