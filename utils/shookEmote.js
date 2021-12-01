module.exports = (jaffamod, discord) => {
  const shook = ['yogWow', 'yogSog', 'yogPog', 'yogPag', 'yogLog', 'yogBog'];
  return jaffamod.utils.getEmote(shook[Math.floor(Math.random() * shook.length)], discord);
};
