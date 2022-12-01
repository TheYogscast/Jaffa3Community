const formatMoney = require('../../utils/formatMoney');
const { getDates, msgNotJingleJam, msgNotBundleLaunched } = require('../../utils/jingleJam');

// Shorten some charity names
const charityMap = {
  'Campaign Against Living Miserably (CALM)': 'CALM',
  'Whale and Dolphin Conservations': 'WDC'
};

module.exports = {
  name: 'JingleCharities',
  module(jaffamod) {
    jaffamod.registerCommand('jinglecharities', (message, reply, discord) => {
      // Get key dates for JingleJam
      const jingleDates = getDates();
      const now = new Date();

      // Only run during JingleJam + first week of January
      if (now < jingleDates.start || now > jingleDates.extended) return reply(msgNotJingleJam(jaffamod, discord));

      // Bundle hasn't yet launched
      if (now < jingleDates.launch) return reply(msgNotBundleLaunched(jaffamod, discord));

      // Get the campaign data from the Tiltify API
      jaffamod.api.get('https://dashboard.jinglejam.co.uk/api/tiltify').then(res => {
        // Validate the response from API
        if (!res || !res.data || !res.data.campaigns || !Array.isArray(res.data.campaigns)) {
          console.error(`Couldn't run jinglecharities command, got bad data`, res.data);
          throw new Error(); // Force ourselves into the catch block
        }

        // Get totals for each charity
        const charities = res.data.campaigns
          .map(campaign => `${charityMap[campaign.name] || campaign.name}: ${formatMoney('£', campaign.total.pounds)}`)
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Message for bundle being active
        if (now < jingleDates.end)
          return reply(`${charities.join(',\n')}.\nGet involved and donate at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-bundle
        reply(`${charities.join(',\n')}.\nThank you for supporting some wonderful charities.`);
      })
        .catch(() => {
          // Web request failed or returned invalid data
          reply(`Jingle Jam charity data couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
