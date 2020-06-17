const Translate = require('../common/translate');
const redis = require('../redis');

module.exports.help = function() {
 return '```md\n# Set auto translate for a user\n\nrb.auto-translate <to-language> <@user>\n\nrb.auto-translate off <@user>```';
};

module.exports.message = async function(message) {
  if (!message.guild) return;
  const member = message.mentions.members.first();
  if (!member) return;

  const params = message.content.split(' ');
  if (params.length < 2) return;

  const lang = params[1];

  if (lang === 'off') {
    await redis.hdel(`${message.guild.id}-autolang`, member.id);
    message.channel.send(`I am no longer automatically translating <@${member.id}>.`);
    return;
  }

  const language = Translate.languageCodes[lang];

  if (!language) return;

  await redis.hset(`${message.guild.id}-autolang`, member.id, language.code);

  message.channel.send(`I will now automatically translate everything <@${member.id}> says to ${language.name}`);

};
