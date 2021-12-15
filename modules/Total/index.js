const formatMoney = require('../../utils/formatMoney');
const { getDates, msgNotJingleJam, msgNotBundleLaunched } = require('../../utils/jingleJam');

module.exports = {
  name: 'Total',
  module(jaffamod) {
    jaffamod.registerCommand('total', (message, reply, discord) => {
      // Get key dates for JingleJam
      const jingleDates = getDates();
      const now = new Date();

      // Only run during JingleJam + first week of January
      if (now < jingleDates.start || now > jingleDates.extended) return reply(msgNotJingleJam(jaffamod, discord));

      // Bundle hasn't yet launched
      if (now < jingleDates.launch) return reply(msgNotBundleLaunched(jaffamod, discord));

      // Get the total raised from the magical API
      jaffamod.api.get('https://jinglejam.yogscast.com/api/total').then(res => {
        // Validate the response from API
        if (!res || !res.data || !res.data.total || !res.data.total_usd) {
          console.error(`Couldn't run total command, got bad data`, res.data);
          throw new Error(); // Force ourselves into the catch block
        }

        // Get the value raised
        const raised = formatMoney('£', res.data.total);
        const raisedUsd = formatMoney('$', res.data.total_usd);

        // Message for bundle being active
        if (now < jingleDates.end)
          return reply(`We've raised ${jaffamod.utils.getBold(raised, discord)} (${jaffamod.utils.getBold(raisedUsd, discord)}) for charity during Jingle Jam ${jingleDates.year} so far! Donate now at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-bundle
        reply(`We raised ${jaffamod.utils.getBold(raised, discord)} (${jaffamod.utils.getBold(raisedUsd, discord)}) for charity during Jingle Jam ${jingleDates.year}! Thank you for supporting some wonderful charities.`);
      })
        .catch(() => {
          // Web request failed or returned invalid data
          reply(`The total amount couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
