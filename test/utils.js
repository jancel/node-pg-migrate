const { schemalize } = require('../lib//utils');

const options = {
  typeShorthands: {},
  literal: val => {
    const schemalized = schemalize(val, v => v);
    return `"${schemalized}"`;
  }
};

module.exports = {
  options
};
