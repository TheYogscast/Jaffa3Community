const formatMoney = require('../../utils/formatMoney');

// Shorten some charity names
const charityMap = {
  'Call of Duty Endowment - UK': 'CODE',
  'Cancer Research UK': 'CRUK',
  'The Mental Health Foundation': 'Mental Health Foundation',
  'War Child UK': 'War Child',
  'Whale and Dolphin Conservation (WDC)': 'WDC'
};

module.exports = {
  name: 'JingleCharities',
  module(jaffamod) {
    jaffamod.registerCommand('jinglecharities', (message, reply, discord) => {
      // Only run during JingleJam + first week of January
      if (!jaffamod.utils.isJingleJamExt())
        return reply(`It's not currently Jingle Jam time. ${jaffamod.utils.getEmote('yogP3', discord)} We look forward to seeing you in December to raise more money for charity once again!`);

      // Bundle hasn't yet launched
      const d = new Date();
      if (d.getMonth() === 11 && d.getDate() === 1 && d.getHours() < 17)
        return reply(`The Jingle Jam bundle hasn't launched yet! ${jaffamod.utils.getEmote('yogP3', discord)} Get ready to get the bundle and raise some money for charity once again!`);

      // Get the campaign data from the Tiltify API
      jaffamod.api.get('https://api.tiltify.com/custom/yoggscast-2021').then(res => {
        // Validate the response from API
        if (!res || !res.data.data || !res.data.data.campaigns || !Array.isArray(res.data.data.campaigns)) {
          console.error(`Couldn't run jinglecharities command, got bad data`, res.data);
          throw new Error(); // Force ourselves into the catch block
        }

        // Get totals for each charity
        const charities = res.data.data.campaigns
          .map(campaign => `${charityMap[campaign.cause.name] || campaign.cause.name}: ${formatMoney('£', Number(campaign.amount_raised.value))}`)
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Message for bundle being active
        if (jaffamod.utils.isJingleJam())
          return reply(`${charities.join(', ')}. Get involved and donate at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-bundle
        reply(`${charities.join(', ')}. Thank you for supporting some wonderful charities.`);
      })
        .catch(() => {
          // Web request failed or returned invalid data
          reply(`Jingle Jam charity data couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
