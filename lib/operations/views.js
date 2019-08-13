const { escapeValue } = require('../utils');

function dropView(mOptions) {
  const _drop = (viewName, { ifExists, cascade } = {}) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    const cascadeStr = cascade ? ' CASCADE' : '';
    return `DROP VIEW${ifExistsStr} ${mOptions.literal(
      viewName
    )}${cascadeStr};`;
  };
  return _drop;
}

function createView(mOptions) {
  const _create = (viewName, options, definition) => {
    const {
      temporary,
      replace,
      recursive,
      columns = [],
      checkOption
    } = options;
    // prettier-ignore
    const columnNames = (Array.isArray(columns) ? columns : [columns]).map(mOptions.literal).join(", ");
    const replaceStr = replace ? ' OR REPLACE' : '';
    const temporaryStr = temporary ? ' TEMPORARY' : '';
    const recursiveStr = recursive ? ' RECURSIVE' : '';
    const columnStr = columnNames ? `(${columnNames})` : '';
    const checkOptionStr = checkOption
      ? ` WITH ${checkOption} CHECK OPTION`
      : '';

    return `CREATE${replaceStr}${temporaryStr}${recursiveStr} VIEW ${mOptions.literal(
      viewName
    )}${columnStr} AS ${definition}${checkOptionStr};`;
  };
  _create.reverse = dropView(mOptions);
  return _create;
}

function alterView(mOptions) {
  const _alter = (viewName, options) => {
    const { checkOption } = options;
    const clauses = [];
    if (checkOption !== undefined) {
      if (checkOption) {
        clauses.push(`SET check_option = ${checkOption}`);
      } else {
        clauses.push(`RESET check_option`);
      }
    }
    return clauses
      .map(clause => `ALTER VIEW ${mOptions.literal(viewName)} ${clause};`)
      .join('\n');
  };
  return _alter;
}

function alterViewColumn(mOptions) {
  const _alter = (viewName, columnName, options) => {
    const { default: defaultValue } = options;
    const actions = [];
    if (defaultValue === null) {
      actions.push('DROP DEFAULT');
    } else if (defaultValue !== undefined) {
      actions.push(`SET DEFAULT ${escapeValue(defaultValue)}`);
    }
    return actions
      .map(
        action =>
          `ALTER VIEW ${mOptions.literal(
            viewName
          )} ALTER COLUMN ${mOptions.literal(columnName)} ${action};`
      )
      .join('\n');
  };
  return _alter;
}

function renameView(mOptions) {
  const _rename = (viewName, newViewName) => {
    return `ALTER VIEW ${mOptions.literal(
      viewName
    )} RENAME TO ${mOptions.literal(newViewName)};`;
  };
  _rename.reverse = (viewName, newViewName) => _rename(newViewName, viewName);
  return _rename;
}

module.exports = {
  createView,
  dropView,
  alterView,
  alterViewColumn,
  renameView
};
