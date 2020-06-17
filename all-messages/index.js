const fs = require('fs');

module.exports.help = [];

module.exports.init = function(client) {

  fs.readdirSync(__dirname).forEach(function(file) {
    if (file !== 'index.js') {
      const fileName = file.split('.')[0];
      const command = require('./' + fileName);
      if (typeof command.message === 'function') {
        client.on('message', message => {
          if (message.content.substring(0, 3).toLowerCase() === 'rb.') return;
          command.message(message);
        });
        console.log(`Registered '${fileName}' message handler`);
      }
      if (typeof command.help === 'function') {
        module.exports.help.push(command.help());
      }
    }
  });

};
