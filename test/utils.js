const { createSchemalize } = require('../lib/utils');

const schemalize = createSchemalize(false);
const options = {
  typeShorthands: {},
  literal: val => `"${schemalize(val)}"`
};

module.exports = {
  options
};
