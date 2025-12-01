const formatMoney = require('../../utils/formatMoney');
const { getDates, msgNotJingleJam, msgNotLaunched, validateResponse } = require('../../utils/jingleJam');

module.exports = {
  name: 'Total',
  module(jaffamod) {
    jaffamod.registerCommand('total', (message, reply, discord) => {
      // Do not run in Discord, JingleBot is there
      if (discord) return;
      
      // Get key dates for JingleJam
      const jingleDates = getDates();
      const now = new Date();

      // Only run during JingleJam + first week of January
      if (now < jingleDates.start || now > jingleDates.extended) return reply(msgNotJingleJam(jaffamod, discord));

      // Collection hasn't yet launched
      if (now < jingleDates.launch) return reply(msgNotLaunched(jaffamod, discord));

      // Get the total raised from the magical API
      jaffamod.api.get('https://dashboard.jinglejam.co.uk/api/tiltify').then(res => {
        // Validate the response from API, forcing ourselves into the catch block if it's invalid
        const error = validateResponse(res);
        if (error) throw new Error(`Got bad data: ${error}: ${JSON.stringify(res && res.data)}`);

        // Process data
        const totalRaised = jaffamod.utils.getBold(formatMoney('£', res.data.raised), discord);
        const totalRaisedUsd = jaffamod.utils.getBold(formatMoney('$', res.data.raised * res.data.dollarConversionRate), discord);

        // Message for collection being active
        if (now < jingleDates.end)
          return reply(`We've raised ${totalRaised} (${totalRaisedUsd}) for charity during Jingle Jam ${jingleDates.year} so far! Donate now at ${jaffamod.utils.getLink('https://jinglejam.co.uk/donate', discord)}`);

        // Message for post-collection
        reply(`We raised ${totalRaised} (${totalRaisedUsd}) for charity during Jingle Jam ${jingleDates.year}! Thank you for supporting some wonderful charities.`);
      })
        .catch(e => {
          console.error(`Couldn't run total command`, e);

          // Web request failed or returned invalid data
          reply(`The total amount couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
