const _ = require('lodash');
const { applyType, escapeValue } = require('../utils');

function dropType(mOptions) {
  const _drop = (typeName, { ifExists, cascade } = {}) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    const cascadeStr = cascade ? ' CASCADE' : '';
    return `DROP TYPE${ifExistsStr} ${mOptions.literal(
      typeName
    )}${cascadeStr};`;
  };
  return _drop;
}

function createType(mOptions) {
  const _create = (typeName, options) => {
    if (_.isArray(options)) {
      const optionsStr = options.map(escapeValue).join(', ');
      return `CREATE TYPE ${mOptions.literal(
        typeName
      )} AS ENUM (${optionsStr});`;
    }
    const attributes = _.map(options, (attribute, attributeName) => {
      const typeStr = applyType(attribute, mOptions.typeShorthands).type;
      return `${mOptions.literal(attributeName)} ${typeStr}`;
    }).join(',\n');
    return `CREATE TYPE ${mOptions.literal(typeName)} AS (\n${attributes}\n);`;
  };
  _create.reverse = dropType(mOptions);
  return _create;
}

function dropTypeAttribute(mOptions) {
  const _drop = (typeName, attributeName, { ifExists } = {}) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    return `ALTER TYPE ${mOptions.literal(
      typeName
    )} DROP ATTRIBUTE ${mOptions.literal(attributeName)}${ifExistsStr};`;
  };
  return _drop;
}

function addTypeAttribute(mOptions) {
  const _alterAttributeAdd = (typeName, attributeName, attributeType) => {
    const typeStr = applyType(attributeType, mOptions.typeShorthands).type;

    return `ALTER TYPE ${mOptions.literal(
      typeName
    )} ADD ATTRIBUTE ${mOptions.literal(attributeName)} ${typeStr};`;
  };
  _alterAttributeAdd.reverse = dropTypeAttribute(mOptions);
  return _alterAttributeAdd;
}

function setTypeAttribute(mOptions) {
  return (typeName, attributeName, attributeType) => {
    const typeStr = applyType(attributeType, mOptions.typeShorthands).type;

    return `ALTER TYPE ${mOptions.literal(
      typeName
    )} ALTER ATTRIBUTE ${mOptions.literal(
      attributeName
    )} SET DATA TYPE ${typeStr};`;
  };
}

function addTypeValue(mOptions) {
  const _add = (typeName, value, options = {}) => {
    const { ifNotExists, before, after } = options;

    if (before && after) {
      throw new Error('"before" and "after" can\'t be specified together');
    }
    const beforeStr = before ? ` BEFORE ${mOptions.literal(before)}` : '';
    const afterStr = after ? ` AFTER ${mOptions.literal(after)}` : '';
    const ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
    const valueStr = escapeValue(value);

    return `ALTER TYPE ${mOptions.literal(
      typeName
    )} ADD VALUE${ifNotExistsStr} ${valueStr}${beforeStr}${afterStr};`;
  };
  return _add;
}

function renameType(mOptions) {
  const _rename = (typeName, newTypeName) => {
    return `ALTER TYPE ${mOptions.literal(
      typeName
    )} RENAME TO ${mOptions.literal(newTypeName)};`;
  };
  _rename.reverse = (typeName, newTypeName) => _rename(newTypeName, typeName);
  return _rename;
}

function renameTypeAttribute(mOptions) {
  const _rename = (typeName, attributeName, newAttributeName) => {
    return `ALTER TYPE ${mOptions.literal(
      typeName
    )} RENAME ATTRIBUTE ${mOptions.literal(
      attributeName
    )} TO ${mOptions.literal(newAttributeName)};`;
  };
  _rename.reverse = (typeName, attributeName, newAttributeName) =>
    _rename(typeName, newAttributeName, attributeName);
  return _rename;
}

function renameTypeValue(mOptions) {
  const _rename = (typeName, value, newValue) => {
    const valueStr = escapeValue(value);
    const newValueStr = escapeValue(newValue);
    return `ALTER TYPE ${mOptions.literal(
      typeName
    )} RENAME VALUE ${valueStr} TO ${newValueStr};`;
  };
  _rename.reverse = (typeName, value, newValue) =>
    _rename(typeName, newValue, value);
  return _rename;
}

module.exports = {
  createType,
  dropType,
  renameType,
  addTypeAttribute,
  dropTypeAttribute,
  setTypeAttribute,
  renameTypeAttribute,
  renameTypeValue,
  addTypeValue
};
