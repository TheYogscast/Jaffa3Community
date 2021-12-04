const getDates = (d = undefined) => {
  const date = d === undefined ? new Date() : d;
  const year = date.getMonth() === 11 ? date.getFullYear() : date.getFullYear() - 1;
  return Object.freeze({
    year,
    start: new Date(year, 11, 1, 0, 0, 0, 0), // When the commands start working
    launch: new Date(year, 11, 1, 17, 0, 0, 0), // When the commands start returning data (bundle available)
    end: new Date(year, 11, 15, 0, 0, 0, 0), // When the commands switch to past tense (bundle ended)
    extended: new Date(year + 1, 0, 8, 0, 0, 0, 0), // When the commands stop working
  });
};

const msgNotJingleJam = (jaffamod, discord) => `It's not currently Jingle Jam time. ${jaffamod.utils.getEmote('yogP3', discord)} We look forward to seeing you in December to raise more money for charity once again!`;

const msgNotBundleLaunched = (jaffamod, discord) => `The Jingle Jam bundle hasn't launched yet! ${jaffamod.utils.getEmote('yogP3', discord)} Get ready to get the bundle and raise some money for charity once again!`;

module.exports = Object.freeze({
  getDates,
  msgNotJingleJam,
  msgNotBundleLaunched,
});
