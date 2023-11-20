const formatMoney = require('../../utils/formatMoney');
const { getDates, msgNotJingleJam, msgNotLaunched } = require('../../utils/jingleJam');

module.exports = {
  name: 'Total',
  module(jaffamod) {
    jaffamod.registerCommand('total', (message, reply, discord) => {
      // Get key dates for JingleJam
      const jingleDates = getDates();
      const now = new Date();

      // Only run during JingleJam + first week of January
      if (now < jingleDates.start || now > jingleDates.extended) return reply(msgNotJingleJam(jaffamod, discord));

      // Collection hasn't yet launched
      if (now < jingleDates.launch) return reply(msgNotLaunched(jaffamod, discord));

      // Get the total raised from the magical API
      jaffamod.api.get('https://dashboard.jinglejam.co.uk/api/tiltify').then(res => {
        // Validate the response from API
        if (!res || !res.data
          || !res.data.total || !res.data.total.pounds || !res.data.total.dollars) {
          throw new Error(`Got bad data: ${JSON.stringify(res.data)}`); // Force ourselves into the catch block
        }

        // Get the value raised
        const raised = formatMoney('£', res.data.total.pounds);
        const raisedUsd = formatMoney('$', res.data.total.dollars);

        // Message for collection being active
        if (now < jingleDates.end)
          return reply(`We've raised ${jaffamod.utils.getBold(raised, discord)} (${jaffamod.utils.getBold(raisedUsd, discord)}) for charity during Jingle Jam ${jingleDates.year} so far! Donate now at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-collection
        reply(`We raised ${jaffamod.utils.getBold(raised, discord)} (${jaffamod.utils.getBold(raisedUsd, discord)}) for charity during Jingle Jam ${jingleDates.year}! Thank you for supporting some wonderful charities.`);
      })
        .catch(e => {
          console.error(`Couldn't run total command`, e);

          // Web request failed or returned invalid data
          reply(`The total amount couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
