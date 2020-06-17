const redis = require('../redis');
const Translate = require('../common/translate');
const Discord = require('discord.js');

module.exports.message = async function(message) {
  if (!message.guild) return;
  const exists = await redis.hexists(`${message.guild.id}-autolang`, message.author.id);
  if (!exists) return;
  const language = await redis.hget(`${message.guild.id}-autolang`, message.author.id);

  // message.channel.startTyping();
  const translation = await Translate.translate(message.content, language, message.guild.id);

  if (translation && translation !== message.content) {
    const embed = new Discord.RichEmbed()
    .setAuthor(message.member.displayName, message.author.displayAvatarURL)
    .setDescription(translation);

    if (message.member && message.member.colorRole) {
      embed.setColor(message.member.colorRole.color);
    }

    await message.channel.send(embed);
  }

  // message.channel.stopTyping();

};
