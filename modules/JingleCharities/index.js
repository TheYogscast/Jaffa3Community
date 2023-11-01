const formatMoney = require('../../utils/formatMoney');
const { getDates, msgNotJingleJam, msgNotBundleLaunched, validateResponse } = require('../../utils/jingleJam');
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
        // Validate the response from API, forcing ourselves into the catch block if it's invalid
        const error = validateResponse(res);
        if (error) throw new Error(`Got bad data: ${error}: ${JSON.stringify(res && res.data)}`);

        // Get totals for each charity
        const causes = res.data.causes
          .map(cause => `${cause.name}: ${formatMoney('£', cause.raised.yogscast + cause.raised.fundraisers)}`)
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Message for bundle being active
        if (now < jingleDates.end)
          return paginateReply(`${causes.join(',\n')}.\nGet involved and donate at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`, reply, discord);

        // Message for post-bundle
        return paginateReply(`${causes.join(',\n')}.\nThank you for supporting some wonderful causes.`, reply, discord);
      })
        .catch(e => {
          console.error(`Couldn't run jinglecharities command`, e);

          // Web request failed or returned invalid data
          return reply(`Jingle Jam charity data couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
