const formatMoney = require('../../utils/formatMoney');
const { getDates, msgNotJingleJam, msgNotBundleLaunched } = require('../../utils/jingleJam');
const { paginateReply } = require('../../utils/paginate');

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
      return jaffamod.api.get('https://dashboard.jinglejam.co.uk/api/tiltify').then(res => {
        // Validate the response from API
        if (!res || !res.data || !res.data.campaigns || !Array.isArray(res.data.campaigns)) {
          throw new Error(`Got bad data: ${JSON.stringify(res.data)}`); // Force ourselves into the catch block
        }

        // Get totals for each charity
        const charities = res.data.campaigns
          .map(campaign => `${campaign.name}: ${formatMoney('£', campaign.total.pounds)}`)
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Message for bundle being active
        if (now < jingleDates.end)
          return paginateReply(`${charities.join(',\n')}.\nGet involved and donate at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`, reply, discord);

        // Message for post-bundle
        return paginateReply(`${charities.join(',\n')}.\nThank you for supporting some wonderful charities.`, reply, discord);
      })
        .catch(e => {
          console.error(`Couldn't run jinglecharities command`, e);

          // Web request failed or returned invalid data
          return reply(`Jingle Jam charity data couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
