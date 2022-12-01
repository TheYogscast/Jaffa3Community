const formatMoney = require('../../utils/formatMoney');
const shookEmote = require('../../utils/shookEmote');
const { getDates, msgNotJingleJam, msgNotBundleLaunched } = require('../../utils/jingleJam');

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
      jaffamod.api.get('https://dashboard.jinglejam.co.uk/api/tiltify').then(res => {
        // Validate the response from API
        if (!res || !res.data
          || !res.data.total || !res.data.total.pounds || !res.data.total.dollars
          || !res.data.average || !res.data.average.pounds || !res.data.average.dollars
          || !res.data.bundles || !res.data.bundles.sold
          || !res.data.entire || !res.data.entire.amount || !res.data.entire.amount.pounds || !res.data.entire.amount.dollars) {
          console.error(`Couldn't run jinglestats command, got bad data`, res.data);
          throw new Error(); // Force ourselves into the catch block
        }

        // Time since launch
        const timeSinceLaunch = Math.min(now - jingleDates.launch, jingleDates.end - jingleDates.launch);
        const hoursSinceLaunch = Math.max(timeSinceLaunch / 1000 / 60 / 60, 1);
        const daysSinceLaunch = Math.max(hoursSinceLaunch / 24, 1);

        // Stats!
        const total = jaffamod.utils.getBold(formatMoney('£', res.data.total.pounds), discord);
        const totalUsd = jaffamod.utils.getBold(formatMoney('$', res.data.total.dollars), discord);
        const totalYogscast = jaffamod.utils.getBold(formatMoney('£', res.data.raised.pounds), discord);
        const totalFundraisers = jaffamod.utils.getBold(formatMoney('£', res.data.fundraisers.pounds), discord);

        const average = jaffamod.utils.getBold(formatMoney('£', res.data.average.pounds), discord);
        const averageUsd = jaffamod.utils.getBold(formatMoney('$', res.data.average.dollars), discord);

        const bundles = jaffamod.utils.getBold(res.data.bundles.sold.toLocaleString(), discord);
        const perBundle = jaffamod.utils.getBold(formatMoney('£', res.data.total.pounds / res.data.bundles.sold), discord);

        const perHour = jaffamod.utils.getBold(formatMoney('£', res.data.total.pounds / hoursSinceLaunch), discord);
        const bundlesPerHour = jaffamod.utils.getBold(Math.round(res.data.bundles.sold / hoursSinceLaunch).toLocaleString(), discord);
        const perDay = jaffamod.utils.getBold(formatMoney('£', res.data.total.pounds / daysSinceLaunch), discord);
        const bundlesPerDay = jaffamod.utils.getBold(Math.round(res.data.bundles.sold / daysSinceLaunch).toLocaleString(), discord);

        const entire = jaffamod.utils.getBold(formatMoney('£', res.data.entire.amount.pounds), discord);
        const entireUsd = jaffamod.utils.getBold(formatMoney('$', res.data.entire.amount.dollars), discord);

        // Message for bundle being active
        if (now < jingleDates.end)
          return reply(`We've raised a total of ${total} (${totalUsd}) for charity (${totalYogscast} by the Yogscast, ${totalFundraisers} from fundraisers), with ${bundles} collections sold, during Jingle Jam ${jingleDates.year} so far!`
            + ` That works out to an average of ${average} (${averageUsd}) per donation, and ${perBundle} donated to awesome charities per collection claimed! ${shookEmote(jaffamod, discord)}`
            + ` Per hour, that's approximately ${perHour} donated and ${bundlesPerHour} collections claimed.`
            + ` Or, instead, that's roughly ${bundlesPerDay} collections claimed and ${perDay} donated per day on average.`
            + ` Over all the years of Jingle Jam, a total of ${entire} (${entireUsd}) has been raised for charity!`
            + ` Get involved by donating now at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-bundle
        reply(`We raised a total of ${total} (${totalUsd}) for charity (${totalYogscast} by the Yogscast, ${totalFundraisers} from fundraisers), with ${bundles} collections claimed, during Jingle Jam ${jingleDates.year}!`
          + ` That worked out to ${average} (${averageUsd}) per donation, and ${perBundle} donated to awesome charities per collection claimed on average! ${shookEmote(jaffamod, discord)}`
          + ` Hourly, ${bundlesPerHour} collections were claimed and ${perHour} was donated to charity.`
          + ` Or, per day during the Jingle Jam, ${bundlesPerDay} collections were claimed and ${perDay} donated.`
          + ` Over all the years of Jingle Jam, a total of ${entire} (${entireUsd}) has been raised for charity!`
          + ` Thank you for supporting some wonderful charities.`);
      })
        .catch(() => {
          // Web request failed or returned invalid data
          reply(`Jingle Jam stats couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
