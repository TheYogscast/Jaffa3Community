module.exports = (message, sep = /[.,!] /, max = 500) => {
  // Ensure separator is a global RegExp
  const sepRe = new RegExp(sep instanceof RegExp ? sep.source : sep, (sep instanceof RegExp ? sep.flags : '') + 'g');

  const messages = [message];
  while (messages[messages.length - 1].length > max) {
    // Get the message that is too long
    const last = messages[messages.length - 1];

    // Limit the length of the message to the max
    const limited = last.substring(0, max);

    // Match on the separator
    const match = [ ...limited.matchAll(sepRe) ].slice(-1)[0];
    if (match) {
      // If there is a match, split on the separator
      messages[messages.length - 1] = last.substring(0, match.index + match[0].length);
      messages.push(last.substring(match.index + match[0].length));
      continue;
    }

    // If there is no match, split on the max
    messages[messages.length - 1] = last.substring(0, max - 3) + '...';
    messages.push('...' + last.substring(max - 3));
  }

  return messages;
};
