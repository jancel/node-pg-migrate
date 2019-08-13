const { createSchemalize, quote } = require('../lib/utils');

const schemalize = createSchemalize(false);
const options = {
  typeShorthands: {},
  schemalize,
  literal: quote(schemalize)
};

module.exports = {
  options
};
