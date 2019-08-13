function dropSchema(mOptions) {
  const _drop = (schemaName, { ifExists, cascade } = {}) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    const cascadeStr = cascade ? ' CASCADE' : '';
    return `DROP SCHEMA${ifExistsStr} ${mOptions.literal(
      schemaName
    )}${cascadeStr};`;
  };
  return _drop;
}

function createSchema(mOptions) {
  const _create = (schemaName, { ifNotExists, authorization } = {}) => {
    const ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
    const authorizationStr = authorization
      ? ` AUTHORIZATION ${authorization}`
      : '';
    return `CREATE SCHEMA${ifNotExistsStr} ${mOptions.literal(
      schemaName
    )}${authorizationStr};`;
  };
  _create.reverse = dropSchema(mOptions);
  return _create;
}

function renameSchema(mOptions) {
  const _rename = (schemaName, newSchemaName) => {
    return `ALTER SCHEMA ${mOptions.literal(
      schemaName
    )} RENAME TO ${mOptions.literal(newSchemaName)};`;
  };
  _rename.reverse = (schemaName, newSchemaName) =>
    _rename(newSchemaName, schemaName);
  return _rename;
}

module.exports = {
  createSchema,
  dropSchema,
  renameSchema
};
