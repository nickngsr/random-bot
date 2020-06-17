const FC = require('../common/flag-converter');
const redis = require('../redis');
const utz = require('../common/user-time-zone');

module.exports.init = function(client) {

  client.on("guildMemberAdd", async member => {

    // random specific
    if (member.guild.name !== 'Random - Hero Wars') return;

    const msg = await member.guild.channels.find(c => c.name === "lobby")
    .send(`Welcome ${member}, if you are a guild member you will be assigned the correct permissions shortly. If you want to see what I can do type 'rb.help' and I'll let you know.`);

    await msg.react(FC.toFlag('fr'));
    await msg.react(FC.toFlag('de'));
    await msg.react(FC.toFlag('es'));
  });

  // random specific but will actually run on all servers
  client.on('guildMemberUpdate', (oldMember, newMember) => {
    const memberRole = newMember.guild.roles.find(r => r.name === 'Member');
    if (!memberRole) return;

    const wasMember = oldMember.roles.has(memberRole.id);
    const isMember = newMember.roles.has(memberRole.id);

    if (!wasMember && isMember) {
      client.emit('newMember', newMember);
    } else if (wasMember && !isMember) {
      client.emit('removeMember', oldMember);
    }

  });

  client.on('newMember', async member => {
    const teamComps = member.guild.channels.find(c => c.name === 'Team Comps');
    let compChannel;
    if (teamComps) {
      compChannel = await member.guild.createChannel(member.displayName, {type: 'text', parent: teamComps});
    }
    const general = member.guild.channels.find(c => c.name === 'guild-chat' && c.type === 'text');
    if (general) {
      let message = `Welcome to the guild ${member}.`;
      if (compChannel) {
        message += ` We have created a channel for you (${compChannel}) to discuss both your hero and titan teams with the guild.`;
      }
      await general.send(message);
    }
  });

  client.on('removeMember', async member => {
    if (member.guild) {
      await utz.unsetTimezone(member.guild.id, member.id)
    }
  });

  client.on('guildCreate', async guild => {
    console.log(`Added to guild ${guild.name}, id: ${guild.id}`);
    // preset the translation character limit to 0 for this guild
    await redis.hset(`${guild.id}-goptions`, 'limit', 0);
  });
  client.on('guildDelete', async guild => {
    console.log(`Removed from guild ${guild.name}, id: ${guild.id}`);
    const hashMaps = await redis.keys(`${guild.id}-*`);
    for (let i = 0; i<hashMaps.length; i++ ) {
      await redis.del(hashMaps[i]);
    }
  });

};
