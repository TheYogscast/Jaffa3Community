const formatDollars = value => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const shookEmote = (jaffamod, discord) => {
  const shook = ['yogWow', 'yogSog', 'yogPog', 'yogPag', 'yogLog', 'yogBog'];
  return jaffamod.utils.getEmote(shook[Math.floor(Math.random() * shook.length)], discord);
};

module.exports = {
  name: 'JingleStats',
  module(jaffamod) {
    jaffamod.registerCommand('jinglestats', (message, reply, discord) => {
      // Only run during JingleJam + first week of January
      if (jaffamod.utils.isJingleJamExt()) {
        jaffamod.api.get('https://www.humblebundle.com/jinglejam_stats').then(res => {
          // Validate the response from humble
          if (!res || !res.data || !res.data.units || !res.data.gmv) {
            console.error(`Couldn't run jinglestats command, got bad data`, res.data);
            throw new Error(); // Force ourselves into the catch block
          }

          // Get the year, accounting for being in January
          const d = new Date();
          const year = d.getMonth() === 11 ? d.getFullYear() : d.getFullYear() - 1;

          // Time since launch
          const hoursSinceLaunch = (d - new Date(year, 11, 1, 17, 0, 0, 0)) / 1000 / 60 / 60;
          const daysSinceLaunch = hoursSinceLaunch / 24;

          // Stats!
          const total = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv)), discord);
          const bundles = jaffamod.utils.getBold(res.data.units.toLocaleString(), discord);
          const perBundle = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv) / res.data.units), discord);
          const perHour = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv) / hoursSinceLaunch), discord);
          const bundlesPerHour = jaffamod.utils.getBold(Math.round(res.data.units / hoursSinceLaunch).toLocaleString(), discord);
          const perDay = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv) / daysSinceLaunch), discord);
          const bundlesPerDay = jaffamod.utils.getBold(Math.round(res.data.units / daysSinceLaunch).toLocaleString(), discord);

          // Message time
          reply(`We've raised a total of ${total} with ${bundles} bundles sold for charity during Jingle Jam ${year} so far!
 That works out to an average of ${perBundle} donated to awesome charities per bundle purchased! ${shookEmote(jaffamod, discord)}
 Per hour, that's approximately ${perHour} donated and ${bundlesPerHour} bundles sold.
 Per day, that's roughly ${bundlesPerDay} bundles sold and ${perDay} donated on average.
 Get involved by donating now at ${jaffamod.utils.getLink('https://humble.com/yogs', discord)}`);
        })
          .catch(() => {
            // Web request failed or returned invalid data
            reply(`Jingle Jam stats couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
          });
      } else {
        // Not currently the best time of the year :(
        reply(`It's not currently Jingle Jam time. ${jaffamod.utils.getEmote('yogP3', discord)} We look forward to seeing you in December to raise more money for charity once again!`);
      }
    });
  }
};
