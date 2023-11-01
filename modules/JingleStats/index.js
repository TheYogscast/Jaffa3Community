const formatMoney = require('../../utils/formatMoney');
const shookEmote = require('../../utils/shookEmote');
const { getDates, msgNotJingleJam, msgNotBundleLaunched, validateResponse } = require('../../utils/jingleJam');
const { paginateReply } = require('../../utils/paginate');

module.exports = {
  name: 'JingleStats',
  module(jaffamod) {
    jaffamod.registerCommand('jinglestats', (message, reply, discord) => {
      // Get key dates for JingleJam
      const jingleDates = getDates();
      const now = new Date();

      // Only run during JingleJam + first week of January
      if (now < jingleDates.start || now > jingleDates.extended) return reply(msgNotJingleJam(jaffamod, discord));

      // Bundle hasn't yet launched
      if (now < jingleDates.launch) return reply(msgNotBundleLaunched(jaffamod, discord));

      // Get the total raised from the magical API
      return jaffamod.api.get('https://dashboard.jinglejam.co.uk/api/tiltify').then(res => {
        // Validate the response from API, forcing ourselves into the catch block if it's invalid
        const error = validateResponse(res);
        if (error) throw new Error(`Got bad data: ${error}: ${JSON.stringify(res && res.data)}`);

        // Time since launch
        const timeSinceLaunch = Math.min(now - jingleDates.launch, jingleDates.end - jingleDates.launch);
        const hoursSinceLaunch = Math.max(timeSinceLaunch / 1000 / 60 / 60, 1);
        const daysSinceLaunch = Math.max(hoursSinceLaunch / 24, 1);

        // Process data
        const total = res.data.raised.yogscast + res.data.raised.fundraisers;

        // Stats!
        const totalRaised = jaffamod.utils.getBold(formatMoney('£', total), discord);
        const totalYogscast = jaffamod.utils.getBold(formatMoney('£', res.data.raised.yogscast), discord);
        const totalFundraisers = jaffamod.utils.getBold(formatMoney('£', res.data.raised.fundraisers), discord);

        const average = jaffamod.utils.getBold(formatMoney('£', total / res.data.donations.count), discord);

        const bundles = jaffamod.utils.getBold(res.data.collections.redeemed.toLocaleString(), discord);
        const perBundle = jaffamod.utils.getBold(formatMoney('£', total / res.data.collections.redeemed), discord);

        const perHour = jaffamod.utils.getBold(formatMoney('£', total / hoursSinceLaunch), discord);
        const bundlesPerHour = jaffamod.utils.getBold(Math.round(res.data.collections.redeemed / hoursSinceLaunch).toLocaleString(), discord);
        const perDay = jaffamod.utils.getBold(formatMoney('£', total / daysSinceLaunch), discord);
        const bundlesPerDay = jaffamod.utils.getBold(Math.round(res.data.collections.redeemed / daysSinceLaunch).toLocaleString(), discord);

        const entire = jaffamod.utils.getBold(formatMoney('£', res.data.history.reduce((sum, history) => sum + history.total.pounds, 0)), discord);

        // Message for bundle being active
        if (now < jingleDates.end)
          return paginateReply(`We've raised a total of ${totalRaised} for charity (${totalYogscast} by the Yogscast, ${totalFundraisers} from fundraisers), with ${bundles} collections sold, during Jingle Jam ${jingleDates.year} so far!`
            + ` That works out to an average of ${average} per donation, and ${perBundle} donated to awesome charities per collection claimed! ${shookEmote(jaffamod, discord)}`
            + ` Per hour, that's approximately ${perHour} donated and ${bundlesPerHour} collections claimed.`
            + ` Or, instead, that's roughly ${bundlesPerDay} collections claimed and ${perDay} donated per day on average.`
            + ` Over all the years of Jingle Jam, a total of ${entire} has been raised for charity!`
            + ` Get involved by donating now at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`, reply, discord);

        // Message for post-bundle
        return paginateReply(`We raised a total of ${totalRaised} for charity (${totalYogscast} by the Yogscast, ${totalFundraisers} from fundraisers), with ${bundles} collections claimed, during Jingle Jam ${jingleDates.year}!`
          + ` That worked out to ${average} per donation, and ${perBundle} donated to awesome charities per collection claimed on average! ${shookEmote(jaffamod, discord)}`
          + ` Hourly, ${bundlesPerHour} collections were claimed and ${perHour} was donated to charity.`
          + ` Or, per day during the Jingle Jam, ${bundlesPerDay} collections were claimed and ${perDay} donated.`
          + ` Over all the years of Jingle Jam, a total of ${entire} has been raised for charity!`
          + ` Thank you for supporting some wonderful charities.`, reply, discord);
      })
        .catch(e => {
          console.error(`Couldn't run jinglestats command`, e);

          // Web request failed or returned invalid data
          return reply(`Jingle Jam stats couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
