const schedule = require('node-schedule');
const utz = require('../common/user-time-zone');
const _ = require('lodash');
const redis = require('../redis');

module.exports.init = function (client) {
  const rule = new schedule.RecurrenceRule();
  rule.minute = 30;

  schedule.scheduleJob(rule, async () => {

    client.guilds.every(async (guild, id) => {
      const channelId = await redis.hget(`${id}-goptions`, 'arena-channel');
      if (!channelId) { return; }
      const channel = guild.channels.get(channelId);
      if (!channel) {
        await redis.hdel(`${id}-goptions`, 'arena-channel');
        return;
      }

      //TODO: naff way of doing it but negligible throughput for redis - move to mongo and query by timezone?
      const timeZones = await utz.getTimezones(id).then(tz => tz.filter(user => user.diff < 60));

      if (!timeZones.length) return;

      let response = '**These members have their arena reward time approaching:**\n';
      _.each(timeZones, async tz => {
        const member = guild.members.get(tz.user);
        if (member) {
          response += `- ${member}\n`;
        } else {
          try {
            // clean up any missing users automatically if it was missed by guild leave hook
            await utz.unsetTimezone(id, tz.user);
          } catch (e) {
            // dont care too much if it fails
          }
        }
      });

      await channel.send(response);

    });

  });
};
