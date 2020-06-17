const fs = require('fs');

module.exports.init = function(client) {

  fs.readdirSync(__dirname).forEach(function(file) {
    if (file !== 'index.js') {
      const fileName = file.split('.')[0];
      const command = require('./' + fileName);
      if (typeof command.init === 'function') {
        command.init(client);
        console.log(`Registered '${fileName}' schedule`);
      }
    }
  });

};
