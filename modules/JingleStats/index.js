const formatDollars = value => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const shookEmote = (jaffamod, discord) => {
  const shook = ['yogWow', 'yogSog', 'yogPog', 'yogPag', 'yogLog', 'yogBog'];
  return jaffamod.utils.getEmote(shook[Math.floor(Math.random() * shook.length)], discord);
};

module.exports = {
  name: 'JingleStats',
  module(jaffamod) {
    jaffamod.registerCommand('jinglestats', (message, reply, discord) => {
      if (jaffamod.utils.isJingleJamExt()) {
        jaffamod.api.get('https://www.humblebundle.com/jinglejam_stats').then(res => {
          if (!res || !res.data || !res.data.units || !res.data.gmv) {
            console.error(`Couldn't run jinglestats command, got bad data`, res.data);
            throw new Error(); // Force ourselves into the catch block
          }
          const d = new Date();
          const year = d.getMonth() === 11 ? d.getFullYear() : d.getFullYear() - 1; // Account for being in January
          const total = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv)), discord);
          const bundles = jaffamod.utils.getBold(res.data.units.toLocaleString(), discord);
          const perBundle = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv) / res.data.units), discord);
          const hoursSinceLaunch = (d - (new Date(year, 11, 1, 17, 0, 0, 0))) / 1000 / 60 / 60;
          const perHour = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv) / hoursSinceLaunch), discord);
          const bundlesPerHour = jaffamod.utils.getBold(Math.round(res.data.units / hoursSinceLaunch).toLocaleString(), discord);
          const daysSinceLaunch = hoursSinceLaunch / 24;
          const perDay = jaffamod.utils.getBold(formatDollars(parseFloat(res.data.gmv) / daysSinceLaunch), discord);
          const bundlesPerDay = jaffamod.utils.getBold(Math.round(res.data.units / daysSinceLaunch).toLocaleString(), discord);
          reply(`We've raised a total of ${total} with ${bundles} bundles sold for charity during Jingle Jam ${year} so far!\nThat works out to an average of ${perBundle} donated to awesome charities per bundle purchased! ${shookEmote(jaffamod, discord)}\nPer hour, that's approximately ${perHour} donated and ${bundlesPerHour} bundles sold.\nPer day, that's roughly ${bundlesPerDay} bundles sold and ${perDay} donated on average.\nGet involved by donating now at ${jaffamod.utils.getLink('https://humble.com/yogs', discord)}`);
        }).catch(() => {
          reply(`Jingle Jam stats couldn't be determined currently. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
      } else {
        reply(`It's currently not Jingle Jam time. ${jaffamod.utils.getEmote('yogP3', discord)} We look forward to seeing you in December to raise more money for charity once again!`);
      }
    });
  }
};
