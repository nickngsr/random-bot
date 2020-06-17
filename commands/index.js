const fs = require('fs');

module.exports.help = [];

module.exports.init = function(client) {

  client.on('message', message => {
    if (message.content.substring(0, 3).toLowerCase() !== 'rb.') return;
    const command = message.content.split(' ')[0].substring(3);
    client.emit(`command:${command}`, message);
  });

  fs.readdirSync(__dirname).forEach(function(file) {
    if (file !== 'index.js') {
      const fileName = file.split('.')[0];
      const command = require('./' + fileName);
      if (typeof command.message === 'function') {
        client.on(`command:${fileName}`, command.message);
        console.log(`Registered '${fileName}' command`);
      }
      if (typeof command.help === 'function') {
        module.exports.help.push(command.help());
      }
    }
  });

};
