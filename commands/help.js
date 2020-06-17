const Discord = require('discord.js');

const commands = require('../commands').help;
const reactions = require('../reactions').help;

module.exports.message = async function(message) {

  const msg = new Discord.RichEmbed();

  let description = '**Commands**\n\n';
  description += commands.join('\n');
  description += '\n\nPlease note the `rb.` is **not** case sensitive `RB.` `Rb.` and `rB.` will also work.\n\n\n';

  description += reactions.join('\n\n\n');

  msg.setDescription(description);

  if (message.guild && message.member) {

    const me = message.guild.member(message.client.user);
    if (me.colorRole) {
      msg.setColor(me.colorRole.color);
    }

    msg.setFooter(`requested by @${message.member.displayName}, this message will self destruct in 2 minutes`);
  }

  const sent = await message.channel.send(msg);

  if (message.guild) {
    message.delete();
    setTimeout(() => {
      if (message.channel.messages.has(sent.id)) {
        sent.delete();
      }
    }, 2 * 60 * 1000);
  }

};
