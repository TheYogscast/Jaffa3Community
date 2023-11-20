const getDates = (d = undefined) => {
  const date = d === undefined ? new Date() : d;
  const year = date.getMonth() === 11 ? date.getFullYear() : date.getFullYear() - 1;
  return Object.freeze({
    year,
    start: new Date(year, 11, 1, 0, 0, 0, 0), // When the commands start working
    launch: new Date(year, 11, 1, 17, 0, 0, 0), // When the commands start returning data (collection available)
    end: new Date(year, 11, 15, 0, 0, 0, 0), // When the commands switch to past tense (collection ended)
    extended: new Date(year + 1, 0, 8, 0, 0, 0, 0) // When the commands stop working
  });
};

const msgNotJingleJam = (jaffamod, discord) => `It's not currently Jingle Jam time. ${jaffamod.utils.getEmote('yogP3', discord)} We look forward to seeing you in December to raise more money for charity once again!`;

const msgNotLaunched = (jaffamod, discord) => `Jingle Jam hasn't launched yet! ${jaffamod.utils.getEmote('yogP3', discord)} Get ready to get the games collection and raise some money for charity once again!`;

const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const isObject = obj => typeof obj === 'object' && obj !== null;

const validateResponse = res => {
  // Validate the overall data object
  if (!isObject(res))
    return 'Response is not an object';
  if (!hasKey(res, 'data') || !isObject(res.data))
    return 'Response does not contain a data object';

  // Validate the raised data
  if (!hasKey(res.data, 'raised') || !isObject(res.data.raised))
    return 'Response#data does not contain a raised object';
  if (!hasKey(res.data.raised, 'yogscast') || typeof res.data.raised.yogscast !== 'number')
    return 'Response#data#raised does not contain a yogscast number`';
  if (!hasKey(res.data.raised, 'fundraisers') || typeof res.data.raised.fundraisers !== 'number')
    return 'Response#data#raised does not contain a fundraisers number';

  // Validate the collections data
  if (!hasKey(res.data, 'collections') || !isObject(res.data.collections))
    return 'Response#data does not contain a collections object';
  if (!hasKey(res.data.collections, 'redeemed') || typeof res.data.collections.redeemed !== 'number')
    return 'Response#data#collections does not contain a redeemed number';

  // Validate the donations data
  if (!hasKey(res.data, 'donations') || !isObject(res.data.donations))
    return 'Response#data does not contain a donations object';
  if (!hasKey(res.data.donations, 'count') || typeof res.data.donations.count !== 'number')
    return 'Response#data#donations does not contain a count number';

  // Validate the history data
  if (!hasKey(res.data, 'history') || !Array.isArray(res.data.history))
    return 'Response#data does not contain a history array';
  for (const history of res.data.history) {
    if (!isObject(history))
      return 'Response#data#history#[] is not an object';
    if (!hasKey(history, 'total') || !isObject(history.total))
      return 'Response#data#history#[] does not contain a total object';
    if (!hasKey(history.total, 'pounds') || typeof history.total.pounds !== 'number')
      return 'Response#data#history#[]#total does not contain a pounds number';
  }

  // Validate the causes data
  if (!hasKey(res.data, 'causes') || !Array.isArray(res.data.causes))
    return 'Response#data does not contain a causes array';
  for (const cause of res.data.causes) {
    if (!isObject(cause))
      return 'Response#data#causes#[] is not an object';
    if (!hasKey(cause, 'name') || typeof cause.name !== 'string')
      return 'Response#data#causes#[] does not contain a name string';
    if (!hasKey(cause, 'raised') || !isObject(cause.raised))
      return 'Response#data#causes#[] does not contain a raised object';
    if (!hasKey(cause.raised, 'yogscast') || typeof cause.raised.yogscast !== 'number')
      return 'Response#data#causes#[]#raised does not contain a yogscast number';
    if (!hasKey(cause.raised, 'fundraisers') || typeof cause.raised.fundraisers !== 'number')
      return 'Response#data#causes#[]#raised does not contain a fundraisers number';
  }

  return null;
};

module.exports = Object.freeze({
  getDates,
  msgNotJingleJam,
  msgNotLaunched,
  validateResponse
});
