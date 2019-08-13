const makeClauses = ({ role, using, check }) => {
  const roles = (Array.isArray(role) ? role : [role]).join(', ');
  const clauses = [];
  if (roles) {
    clauses.push(`TO ${roles}`);
  }
  if (using) {
    clauses.push(`USING (${using})`);
  }
  if (check) {
    clauses.push(`WITH CHECK (${check})`);
  }
  return clauses;
};

function dropPolicy(mOptions) {
  const _drop = (tableName, policyName, { ifExists } = {}) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    return `DROP POLICY${ifExistsStr} ${mOptions.literal(
      policyName
    )} ON ${mOptions.literal(tableName)};`;
  };
  return _drop;
}

function createPolicy(mOptions) {
  const _create = (tableName, policyName, options = {}) => {
    const createOptions = {
      ...options,
      role: options.role || 'PUBLIC'
    };
    const clauses = [
      `FOR ${options.command || 'ALL'}`,
      ...makeClauses(createOptions)
    ];
    const clausesStr = clauses.join(' ');
    return `CREATE POLICY ${mOptions.literal(policyName)} ON ${mOptions.literal(
      tableName
    )} ${clausesStr};`;
  };
  _create.reverse = dropPolicy(mOptions);
  return _create;
}

function alterPolicy(mOptions) {
  const _alter = (tableName, policyName, options = {}) => {
    const clausesStr = makeClauses(options).join(' ');
    return `ALTER POLICY ${mOptions.literal(policyName)} ON ${mOptions.literal(
      tableName
    )} ${clausesStr};`;
  };
  return _alter;
}

function renamePolicy(mOptions) {
  const _rename = (tableName, policyName, newPolicyName) => {
    return `ALTER POLICY ${mOptions.literal(policyName)} ON ${mOptions.literal(
      tableName
    )} RENAME TO ${mOptions.literal(newPolicyName)};`;
  };
  _rename.reverse = (tableName, policyName, newPolicyName) =>
    _rename(tableName, newPolicyName, policyName);
  return _rename;
}

module.exports = {
  createPolicy,
  dropPolicy,
  alterPolicy,
  renamePolicy
};
