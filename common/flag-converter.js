const OFFSET = 127397;

module.exports.toString = function(flag) {
  let string = '';
  if (flag.length === 4) {
    for (let i = 0; i < 4; i = i+2) {
      string += String.fromCharCode(flag.codePointAt(i)-OFFSET);
    }
  }
  return string.toLowerCase();
};

module.exports.toFlag = function(cc) {
  const chars = [...cc.toUpperCase()].map(c => c.charCodeAt() + OFFSET);
  return String.fromCodePoint(...chars);
};
