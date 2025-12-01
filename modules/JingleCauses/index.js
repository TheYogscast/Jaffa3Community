const formatMoney = require('../../utils/formatMoney');
const { getDates, msgNotJingleJam, msgNotLaunched, validateResponse } = require('../../utils/jingleJam');
const { paginateReply } = require('../../utils/paginate');

module.exports = {
  name: 'JingleCauses',
  module(jaffamod) {
    jaffamod.registerCommand('jinglecauses', (message, reply, discord) => {
      // Do not run in Discord, JingleBot is there
      if (discord) return;

      // Get key dates for JingleJam
      const jingleDates = getDates();
      const now = new Date();

      // Only run during JingleJam + first week of January
      if (now < jingleDates.start || now > jingleDates.extended) return reply(msgNotJingleJam(jaffamod, discord));

      // Collection hasn't yet launched
      if (now < jingleDates.launch) return reply(msgNotLaunched(jaffamod, discord));

      // Get the campaign data from the Tiltify API
      return jaffamod.api.get('https://dashboard.jinglejam.co.uk/api/tiltify').then(res => {
        // Validate the response from API, forcing ourselves into the catch block if it's invalid
        const error = validateResponse(res);
        if (error) throw new Error(`Got bad data: ${error}: ${JSON.stringify(res && res.data)}`);

        // Get totals for each charity
        const causes = res.data.causes
          .map(cause => `${cause.name}: ${formatMoney('£', cause.raised)}`)
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Message for collection being active
        if (now < jingleDates.end)
          return paginateReply(`${causes.join(',\n')}.\nGet involved and donate at ${jaffamod.utils.getLink('https://jinglejam.co.uk/donate', discord)}`, reply, discord);

        // Message for post-collection
        return paginateReply(`${causes.join(',\n')}.\nThank you for supporting some wonderful causes.`, reply, discord);
      })
        .catch(e => {
          console.error(`Couldn't run jinglecauses command`, e);

          // Web request failed or returned invalid data
          return reply(`Jingle Jam cause data couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });

    jaffamod.registerCommand('jinglecharities', 'jinglecauses');
  }
};
