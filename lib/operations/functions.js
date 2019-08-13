const { escapeValue, formatParams } = require('../utils');

function dropFunction(mOptions) {
  const _drop = (
    functionName,
    functionParams = [],
    { ifExists, cascade } = {}
  ) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    const cascadeStr = cascade ? ' CASCADE' : '';
    const paramsStr = formatParams(functionParams, mOptions);
    return `DROP FUNCTION${ifExistsStr} ${mOptions.literal(
      functionName
    )}${paramsStr}${cascadeStr};`;
  };
  return _drop;
}

function createFunction(mOptions) {
  const _create = (
    functionName,
    functionParams = [],
    functionOptions = {},
    definition
  ) => {
    const {
      replace,
      returns = 'void',
      language,
      window,
      behavior = 'VOLATILE',
      onNull,
      parallel
    } = functionOptions;
    const options = [];
    if (behavior) {
      options.push(behavior);
    }
    if (language) {
      options.push(`LANGUAGE ${language}`);
    } else {
      throw new Error(
        `Language for function ${functionName} have to be specified`
      );
    }
    if (window) {
      options.push('WINDOW');
    }
    if (onNull) {
      options.push('RETURNS NULL ON NULL INPUT');
    }
    if (parallel) {
      options.push(`PARALLEL ${parallel}`);
    }

    const replaceStr = replace ? ' OR REPLACE' : '';
    const paramsStr = formatParams(functionParams, mOptions);

    return `CREATE${replaceStr} FUNCTION ${mOptions.literal(
      functionName
    )}${paramsStr}
  RETURNS ${returns}
  AS ${escapeValue(definition)}
  ${options.join('\n  ')};`;
  };
  _create.reverse = dropFunction(mOptions);
  return _create;
}

function renameFunction(mOptions) {
  const _rename = (oldFunctionName, functionParams = [], newFunctionName) => {
    const paramsStr = formatParams(functionParams, mOptions);
    return `ALTER FUNCTION ${mOptions.literal(
      oldFunctionName
    )}${paramsStr} RENAME TO ${mOptions.literal(newFunctionName)};`;
  };
  _rename.reverse = (oldFunctionName, functionParams, newFunctionName) =>
    _rename(newFunctionName, functionParams, oldFunctionName);
  return _rename;
}

module.exports = {
  createFunction,
  dropFunction,
  renameFunction
};
