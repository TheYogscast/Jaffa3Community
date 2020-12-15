module.exports = {
  name: 'Total',
  module(jaffamod) {
    jaffamod.registerCommand('total', (message, reply, discord) => {
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
        if (!res || !res.data || !res.data.total) {
          console.error(`Couldn't run total command, got bad data`, res.data);
          throw new Error(); // Force ourselves into the catch block
        }

        // Get the year, accounting for being in January
        const year = d.getMonth() === 11 ? d.getFullYear() : d.getFullYear() - 1;

        // Get the value raised (GBP)
        const raised = `£${res.data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Message for bundle being active
        if (jaffamod.utils.isJingleJam())
          return reply(`We've raised ${jaffamod.utils.getBold(raised, discord)} for charity during Jingle Jam ${year} so far! Donate now at ${jaffamod.utils.getLink('https://jinglejam.tiltify.com', discord)}`);

        // Message for post-bundle
        reply(`We raised ${jaffamod.utils.getBold(raised, discord)} for charity during Jingle Jam ${year}! Thank you for supporting some wonderful charities.`);
      })
        .catch(() => {
          // Web request failed or returned invalid data
          reply(`The total amount couldn't be determined. ${jaffamod.utils.getEmote('yogP3', discord)} Please try again later.`);
        });
    });
  }
};
