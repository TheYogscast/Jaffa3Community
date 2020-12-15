const formatMoney = (currency, value) =>
  `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const shookEmote = (jaffamod, discord) => {
  const shook = ['yogWow', 'yogSog', 'yogPog', 'yogPag', 'yogLog', 'yogBog'];
  return jaffamod.utils.getEmote(shook[Math.floor(Math.random() * shook.length)], discord);
};

module.exports = {
  name: 'JingleStats',
  module(jaffamod) {
    jaffamod.registerCommand('jinglestats', (message, reply, discord) => {
      // Only run during JingleJam + first week of January
      if (!jaffamod.utils.isJingleJamExt())
        return reply(`It's not currently Jingle Jam time. ${jaffamod.utils.getEmote('yogP3', discord)} We look forward to seeing you in December to raise more money for charity once again!`);

      // Bundle hasn't yet launched
      const d = new Date();
      if (d.getMonth() === 11 && d.getDate() === 1 && d.getHours() < 17)
        return reply(`The Jingle Jam bundle hasn't launched yet! ${jaffamod.utils.getEmote('yogP3', discord)} Get ready to get the bundle and raise some money for charity once again!`);

      // Get the total raised from the magical API
      jaffamod.api.get('https://jinglejam.yogscast.com/api/total').then(res => {
        // Validate the response from API
        if (!res || !res.data || !res.data.total || !res.data.total_usd || !res.data.donations_with_reward) {
          console.error(`Couldn't run jinglestats command, got bad data`, res.data);
          throw new Error(); // Force ourselves into the catch block
        }

        // Get the year, accounting for being in January
        const year = d.getMonth() === 11 ? d.getFullYear() : d.getFullYear() - 1;

        // Track when the bundle starts/ends
        const bundleLaunch = new Date(year, 11, 1, 17, 0, 0, 0);
        const bundleEnd = new Date(year, 11, 15, 0, 0, 0, 0);

        // Time since launch
        const timeSinceLaunch = Math.min(d - bundleLaunch, bundleEnd - bundleLaunch);
        const hoursSinceLaunch = Math.max(timeSinceLaunch / 1000 / 60 / 60, 1);
        const daysSinceLaunch = Math.max(hoursSinceLaunch / 24, 1);

        // Stats!
        const total = jaffamod.utils.getBold(formatMoney('£', parseFloat(res.data.total)), discord);
        const totalUsd = jaffamod.utils.getBold(formatMoney('$', parseFloat(res.data.total_usd)), discord);
        const bundles = jaffamod.utils.getBold(res.data.donations_with_reward.toLocaleString(), discord);
        const perBundle = jaffamod.utils.getBold(formatMoney('£', parseFloat(res.data.total) / res.data.donations_with_reward), discord);
        const perHour = jaffamod.utils.getBold(formatMoney('£', parseFloat(res.data.total) / hoursSinceLaunch), discord);
        const bundlesPerHour = jaffamod.utils.getBold(Math.round(res.data.donations_with_reward / hoursSinceLaunch).toLocaleString(), discord);
        const perDay = jaffamod.utils.getBold(formatMoney('£', parseFloat(res.data.total) / daysSinceLaunch), discord);
        const bundlesPerDay = jaffamod.utils.getBold(Math.round(res.data.donations_with_reward / daysSinceLaunch).toLocaleString(), discord);

        // Message for bundle being active
        if (jaffamod.utils.isJingleJam())
          return reply(`We've raised a total of ${total} (${totalUsd}) for charity, with ${bundles} bundles claimed, during Jingle Jam ${year} so far!`
            + ` That works out to an average of ${perBundle} donated to awesome charities per bundle claimed! ${shookEmote(jaffamod, discord)}`
            + ` Per hour, that's approximately ${perHour} donated and ${bundlesPerHour} bundles claimed.`
            + ` Or, instead, that's roughly ${bundlesPerDay} bundles claimed and ${perDay} donated per day on average.`
            + ` Get involved by donating now at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-bundle
        reply(`We raised a total of ${total} (${totalUsd}) for charity, with ${bundles} bundles claimed, during Jingle Jam ${year}!`
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
