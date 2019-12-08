const getEmote = (emote, discord) => {
  return discord ? `:${emote}:` : emote;
};

const getBold = (string, discord) => {
  return discord ? `**${string}**` : string;
};

module.exports = {
  name: 'Total',
  module(jaffamod) {
    jaffamod.registerCommand('total', (message, reply, discord) => {
      // Determine if it's JingleJam time
      //  (December + first 7 days of the new year to view the total raised)
      const d = new Date();
      if (d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 7)) {
        jaffamod.api.get('https://jinglejam.yogscast.com/api/total').catch(() => {
          reply(`The total amount couldn't be determined currently. ${getEmote('yogP3', discord)} Please try again later.`);
        }).then(data => {
          const year = d.getMonth() === 11 ? d.getFullYear() : d.getFullYear() - 1; // Account for being in January
          reply(`We've currently raised a total of ${getBold(`$${data.formatted_total}`, discord)} for charity during JingleJam ${year} so far! Donate now at https://humble.com/yogs`);
        });
      } else {
        reply(`It's currently not JingleJam time. ${getEmote('yogP3', discord)} We look forward to seeing you on Twitch in December to raise more money for charity once again!`);
      }
    });
  }
};
