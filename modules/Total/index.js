const getEmote = (emote, discord) => {
  return discord ? `:${emote}:` : emote;
};

const getBold = (string, discord) => {
  return discord ? `**${string}**` : string;
};

const getLink = (link, discord) => {
  return discord ? `<${link}>` : link;
};

module.exports = {
  name: 'Total',
  module(jaffamod) {
    jaffamod.registerCommand('total', (message, reply, discord) => {
      // Determine if it's Jingle Jam time
      //  (December + first 7 days of the new year to view the total raised)
      const d = new Date();
      if (d.getMonth() === 11 || d.getMonth() === 0 && d.getDate() <= 7) {
        jaffamod.api.get('https://jinglejam.yogscast.com/api/total').then(res => {
          if (!res || !res.data || !res.data.formatted_total) {
            console.error('Couldn\'t run total command, got bad data', res.data);
            throw new Error(); // Force ourselves into the catch block
          }
          const year = d.getMonth() === 11 ? d.getFullYear() : d.getFullYear() - 1; // Account for being in January
          reply(`We've raised a total of ${getBold(`$${res.data.formatted_total}`, discord)} for charity during Jingle Jam ${year} so far!`
            + ` Donate now at ${getLink('https://humble.com/yogs', discord)}`);
        }).catch(() => {
          reply(`The total amount couldn't be determined currently. ${getEmote('yogP3', discord)} Please try again later.`);
        });
      } else {
        reply(`It's currently not Jingle Jam time. ${getEmote('yogP3', discord)} We look forward to seeing you in December to raise more money for charity once again!`);
      }
    });
  }
};
