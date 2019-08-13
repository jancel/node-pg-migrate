const _ = require('lodash');

function dropExtension(mOptions) {
  const _drop = (extensions, { ifExists, cascade } = {}) => {
    if (!_.isArray(extensions)) extensions = [extensions]; // eslint-disable-line no-param-reassign
    return _.map(
      extensions,
      extension =>
        `DROP EXTENSION${ifExists ? ' IF EXISTS' : ''} ${mOptions.literal(
          extension
        )}${cascade ? ' CASCADE' : ''};`
    );
  };
  return _drop;
}

function createExtension(mOptions) {
  const _create = (extensions, { ifNotExists, schema } = {}) => {
    if (!_.isArray(extensions)) extensions = [extensions]; // eslint-disable-line no-param-reassign
    return _.map(
      extensions,
      extension =>
        `CREATE EXTENSION${
          ifNotExists ? ' IF NOT EXISTS' : ''
        } ${mOptions.literal(extension)}${
          schema ? ` SCHEMA ${mOptions.literal(schema)}` : ''
        };`
    );
  };
  _create.reverse = dropExtension(mOptions);
  return _create;
}

module.exports = {
  createExtension,
  dropExtension
};
