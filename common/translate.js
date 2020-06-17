const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
const _ = require('lodash');
const redis = require('../redis');
const config = require('../config');

const translationClient = new TranslationServiceClient({
  credentials: config.googleCredentials
});

function discordSanitize(incoming) {
  const variables = {};
  const message = incoming.replace(/<([a-zA-Z:@\!0-9]*)>|(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g, (() => {
    let number = 0;
    return (item) => {
      variables[`{${number}}`] = item;
      return `{${number++}}`;
    }
  })());
  return {message, variables};
}

function discordUnsanitize(incoming, variables) {
  return incoming.replace(/({[0-9]+})/g, (match) => {
    return variables[match];
  });
}

module.exports.translate = async function translate(message, to, guildId) {
  const {message: sanMessage, variables} = discordSanitize(message);

  const options = await redis.hmget(`${guildId}-goptions`, 'limit', 'counter');
  const limitRaw = options[0];
  const limit = parseInt(options[0], 10);
  const counter = parseInt(options[1] || 0, 10);

  if (limitRaw !== null && ((counter + sanMessage.length) > limit)) {
    console.error(`Guild ${guildId} has reached their limit`);
    return; // fail silently
  }

  // update counter immediately
  await redis.hmset(`${guildId}-goptions`, 'counter', counter + sanMessage.length);

  const request = {
    parent: translationClient.locationPath(config.googleCredentials.project_id, 'global'),
    contents: [sanMessage],
    mimeType: 'text/plain', // possible mime types: text/plain, text/html
    targetLanguageCode: to,
  };

  try {
    const [response] = await translationClient.translateText(request);
    if (response && response.translations && response.translations.length) {
      return discordUnsanitize(response.translations[0].translatedText, variables);
    }
  } catch (e) {
    // deal with counter ???? reverse count?
    console.error('Translation failed');
    console.error(e);
  }

};

// only support a subset of available languages for now
module.exports.languages = {
  'cn': {code: 'zh-CN', name: 'Chinese'},
  'dk': {code: 'da', name: 'Danish'},
  'gb': {code: 'en', name: 'English'},
  'fi': {code: 'fi', name: 'Finnish'},
  'fr': {code: 'fr', name: 'French'},
  'de': {code: 'de', name: 'German'},
  'it': {code: 'it', name: 'Italian'},
  'jp': {code: 'ja', name: 'Japanese'},
  'pl': {code: 'pl', name: 'Polish'},
  'pt': {code: 'pt', name: 'Portuguese'},
  'ru': {code: 'ru', name: 'Russian'},
  'es': {code: 'es', name: 'Spanish'},
  'se': {code: 'sv', name: 'Swedish'},
  'tw': {code: 'zh-TW', name: 'Traditional Chinese'}
};

// hacky but cba to do it nicely
// builds object to recognise any identifier for that language, country code, full name with/without capital etc.
module.exports.languageCodes = {};
_.each(module.exports.languages, (block, key) => {
  module.exports.languageCodes[block.code] = block;
  module.exports.languageCodes[key] = block;
  module.exports.languageCodes[block.name] = block;
  module.exports.languageCodes[block.name.toLowerCase()] = block;
});
