const schedule = require('node-schedule');
const redis = require('../redis');

module.exports.init = function (client) {
  const rule = new schedule.RecurrenceRule();
  rule.date = 1;
  rule.hour = 1;
  rule.minute = 1;

  schedule.scheduleJob(rule, async () => {
    const guilds = await redis.keys('*-goptions');
    for(let i = 0; i< guilds.length; i++) {
      await redis.hset(guilds[i], 'counter', 0);
    }
  });
};
