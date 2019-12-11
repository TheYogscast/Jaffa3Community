const dogeify = require('dogeify-js');

module.exports = {
  name: 'Fun',
  async module(jaffamod) {

    jaffamod.registerCommand('dogeify', (message, reply, discord) => {
      reply(dogeify(message.content));
    }, '<string>');

  }
};
