const FC = require('../common/flag-converter');
const Translate = require('../common/translate');
const Discord = require('discord.js');

module.exports.help = function() {
  let description = '**Translation**\n\n';
  description += 'React to the message you want to translate with the flag that corresponds to the language you want to translate to.\n\n';
  description += '**Supported Languages**\n\n';
  const lines = [];
  Object.keys(Translate.languages).forEach(flag => {
    lines.push(`${FC.toFlag(flag)} - ${Translate.languages[flag].name}`);
  });
  description += lines.join('\n\n');
  return description
};

module.exports.add = async (reaction, user) => {
  // ignore if message not from a guild
  if (!reaction.message.guild) return;
  // ignore if already translated by this reaction
  if (reaction.count > 1) return;
  // convert flag to country code
  const cc = FC.toString(reaction.emoji.name);
  if (cc === '') return;
  if (!Translate.languages[cc]) return;
  const language = Translate.languages[cc].code;
  if (!language) return;

  reaction.message.channel.startTyping();

  const translation = await Translate.translate(reaction.message.content, language, reaction.message.guild.id);

  if (translation) {

    const embed = new Discord.RichEmbed()
    .setAuthor(reaction.message.member.displayName, reaction.message.author.displayAvatarURL)
    .setDescription(translation);

    if (reaction.message.author.id !== user.id) {
      embed.setFooter(`requested by @${reaction.message.guild.member(user).displayName}`);
    }

    if (reaction.message.member && reaction.message.member.colorRole) {
      embed.setColor(reaction.message.member.colorRole.color);
    }

    reaction.message.channel.send(embed);
  }

  // will stop typing even if other translations are taking place in this channel... do we care really?
  reaction.message.channel.stopTyping()
};
