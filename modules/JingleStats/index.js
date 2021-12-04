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
      jaffamod.api.get('https://jinglejam.yogscast.com/api/total').then(res => {
        // Validate the response from API
        if (!res || !res.data || !res.data.total || !res.data.total_usd || !res.data.donations_with_reward) {
          console.error(`Couldn't run jinglestats command, got bad data`, res.data);
          throw new Error(); // Force ourselves into the catch block
        }

        // Time since launch
        const timeSinceLaunch = Math.min(now - jingleDates.launch, jingleDates.end - jingleDates.launch);
        const hoursSinceLaunch = Math.max(timeSinceLaunch / 1000 / 60 / 60, 1);
        const daysSinceLaunch = Math.max(hoursSinceLaunch / 24, 1);

        // Stats!
        const total = jaffamod.utils.getBold(formatMoney('£', res.data.total), discord);
        const totalUsd = jaffamod.utils.getBold(formatMoney('$', res.data.total_usd), discord);
        const bundles = jaffamod.utils.getBold(res.data.donations_with_reward.toLocaleString(), discord);
        const perBundle = jaffamod.utils.getBold(formatMoney('£', res.data.total / res.data.donations_with_reward), discord);
        const perHour = jaffamod.utils.getBold(formatMoney('£', res.data.total / hoursSinceLaunch), discord);
        const bundlesPerHour = jaffamod.utils.getBold(Math.round(res.data.donations_with_reward / hoursSinceLaunch).toLocaleString(), discord);
        const perDay = jaffamod.utils.getBold(formatMoney('£', res.data.total / daysSinceLaunch), discord);
        const bundlesPerDay = jaffamod.utils.getBold(Math.round(res.data.donations_with_reward / daysSinceLaunch).toLocaleString(), discord);

        // Message for bundle being active
        if (now < jingleDates.end)
          return reply(`We've raised a total of ${total} (${totalUsd}) for charity, with ${bundles} bundles claimed, during Jingle Jam ${jingleDates.year} so far!`
            + ` That works out to an average of ${perBundle} donated to awesome charities per bundle claimed! ${shookEmote(jaffamod, discord)}`
            + ` Per hour, that's approximately ${perHour} donated and ${bundlesPerHour} bundles claimed.`
            + ` Or, instead, that's roughly ${bundlesPerDay} bundles claimed and ${perDay} donated per day on average.`
            + ` Get involved by donating now at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-bundle
        reply(`We raised a total of ${total} (${totalUsd}) for charity, with ${bundles} bundles claimed, during Jingle Jam ${jingleDates.year}!`
          + ` That worked out to ${perBundle} donated to awesome charities per bundle claimed on average! ${shookEmote(jaffamod, discord)}`
          + ` Hourly, ${bundlesPerHour} bundles were claimed and ${perHour} was donated to charity. `
          + ` Or, per day during the Jingle Jam, ${bundlesPerDay} bundles were claimed and ${perDay} donated.`
          + ` Thank you for supporting some wonderful charities.`);
      })
        .catch(() => {
          // Web request failed or returned invalid data
          reply(`Jingle Jam stats couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
