const utz = require('../common/user-time-zone');

module.exports.help = function() {
  return '```md\n# Set your own timezone\n\nrb.timezone <timezone>\n\n# Set a user\'s timezone \n\nrb.timezone <@user> <timezone>```';
};

module.exports.message = async function(message) {
  if (!message.guild) return;
  let member = message.member;
  if (message.mentions && message.mentions.members && message.mentions.members.size) {
    member = message.mentions.members.first();
  }
  const params = message.content.split(' ');
  try {
    const tz = params[params.length-1];
    if (tz === 'none') {
      await utz.unsetTimezone(message.guild.id, member.id);
      message.channel.send(`I have removed <@${member.id}>'s timezone`);
      return;
    }
    await utz.setTimezone(message.guild.id, member.id, tz);
    message.channel.send(`I have set <@${member.id}>'s timezone to ${tz}`);
  } catch (e) {
    let msg = 'I don\'t understand, did you supply a valid timezone? Please use the command like this:\n\n```md\nrb.timezone <timezone>\n\nrb.timezone <@user> <timezone>```\nYou can find the list of timezones here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones\nSelect the correct zone name from the column \'TZ database name\'';
    message.channel.send(msg);
  }

};
