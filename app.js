const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');

const reactions = require('./reactions');
reactions.init(client);
const commands = require('./commands');
commands.init(client);
const messageHandlers = require('./all-messages');
messageHandlers.init(client);

const dispatcher = require('./common/event-dispatch');
dispatcher.init(client);

const schedules = require('./schedules');
schedules.init(client);

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity('the chat, rb.help', {type: "WATCHING"});
});

client.login(config.discordToken);
