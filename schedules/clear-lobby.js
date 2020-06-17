const schedule = require('node-schedule');

module.exports.init = function(client) {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 3;
  rule.minute = 0;

  schedule.scheduleJob(rule, async () => {
    const guild = client.guilds.find(g => g.name === 'Random - Hero Wars');
    if (!guild) return;
    const lobby = guild.channels.find(c => c.name === 'lobby');
    if (!lobby) return;
    let deleted = 0;
    do {
      const messages = await lobby.bulkDelete(100, true);
      deleted = messages.size;
      console.log(`Deleted ${deleted} messages from the lobby.`);
    } while(deleted > 2);
  });
};


