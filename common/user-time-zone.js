const redis = require('../redis');
const moment = require('moment-timezone');

// is it worth keeping moment around for tzdata?! might as well just stick with gmt+- only
// can then drop moment-timezone dependency completely and just use utcOffset
module.exports.setTimezone = async function(guild, userId, timezone) {

  // fix reversed east/west for Etc/X
  const match = timezone.match(/^Etc\/GMT([+-]\d{1,2})$/i);
  if (match) {
    const newZone = -parseInt(match[1]);
    timezone = 'etc/gmt';
    if (newZone > 0) timezone += '+'
    timezone += `${newZone}`
  }

  if (moment.tz.zone(timezone)) {
    await redis.hset(`${guild}-tzcache`, userId, timezone);
    return;
  }

  throw new Error('Specified time zone doesn\'t exist');

};

module.exports.unsetTimezone = async function(guild, userId) {
  await redis.hdel(`${guild}-tzcache`, userId);
};

// TODO
module.exports.getTimezone = function(userId) {
};


module.exports.getTimezones = async function(guild, includeText) {
  const times = [];
  return redis.hgetall(`${guild}-tzcache`).then(zones => {
    const keys = Object.keys(zones);
    for(let i=0; i<keys.length; i++) {
      if (zones.hasOwnProperty(keys[i])) {
        const time = moment.tz(zones[keys[i]]).hours(20).minutes(0).seconds(0);
        const now = moment.tz(zones[keys[i]]);
        if (time.isBefore(now)) {
          time.add(1, 'day');
        }

        const diff = time.diff(now, 'minutes', true);

        const user = {
          user: keys[i],
          diff,
          gwTime: moment.utc().hour(7).minute(0).tz(zones[keys[i]]).format('HH:mm')
        };
        times.push(user);

        if (!includeText) {
          continue;
        }

        const hours = Math.floor(diff / 60);
        const minutes = Math.ceil(diff - (hours * 60));

        // didn't like humanised moment format cba to work out if it can do it how I want
        user.text = '';
        if (!hours && !minutes) {
          user.text = 'now';
        }
        if (hours) {
          user.text += `${hours} hour${hours>1?'s':''}`;
          if (minutes) {
            user.text += ' and ';
          }
        }
        if (minutes) {
          user.text += `${minutes} minute${minutes>1?'s':''}`;
        }
      }
    }

    return times;
  });
};
