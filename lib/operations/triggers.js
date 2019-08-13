const { isArray } = require('lodash');
const { escapeValue } = require('../utils');
const { createFunction, dropFunction } = require('./functions');

function dropTrigger(mOptions) {
  const _drop = (tableName, triggerName, { ifExists, cascade } = {}) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    const cascadeStr = cascade ? ' CASCADE' : '';
    return `DROP TRIGGER${ifExistsStr} ${mOptions.literal(
      triggerName
    )} ON ${mOptions.literal(tableName)}${cascadeStr};`;
  };
  return _drop;
}

function createTrigger(mOptions) {
  const _create = (tableName, triggerName, triggerOptions = {}, definition) => {
    const {
      constraint,
      condition,
      operation,
      deferrable,
      deferred,
      functionArgs = []
    } = triggerOptions;
    let { when, level = 'STATEMENT', function: functionName } = triggerOptions;
    const operations = isArray(operation) ? operation.join(' OR ') : operation;
    if (constraint) {
      when = 'AFTER';
    }
    const isInsteadOf = /instead\s+of/i.test(when);
    if (isInsteadOf) {
      level = 'ROW';
    }
    if (definition) {
      functionName = functionName || triggerName;
    }

    if (!when) {
      throw new Error('"when" (BEFORE/AFTER/INSTEAD OF) have to be specified');
    } else if (isInsteadOf && condition) {
      throw new Error("INSTEAD OF trigger can't have condition specified");
    }
    if (!operations) {
      throw new Error(
        '"operation" (INSERT/UPDATE[ OF ...]/DELETE/TRUNCATE) have to be specified'
      );
    }

    const defferStr = constraint
      ? `${
          deferrable
            ? `DEFERRABLE INITIALLY ${deferred ? 'DEFERRED' : 'IMMEDIATE'}`
            : 'NOT DEFERRABLE'
        }\n  `
      : '';
    const conditionClause = condition ? `WHEN (${condition})\n  ` : '';
    const constraintStr = constraint ? ' CONSTRAINT' : '';
    const paramsStr = functionArgs.map(escapeValue).join(', ');

    const triggerSQL = `CREATE${constraintStr} TRIGGER ${mOptions.literal(
      triggerName
    )}
  ${when} ${operations} ON ${mOptions.literal(tableName)}
  ${defferStr}FOR EACH ${level}
  ${conditionClause}EXECUTE PROCEDURE ${mOptions.literal(
      functionName
    )}(${paramsStr});`;

    const fnSQL = definition
      ? `${createFunction(mOptions)(
          functionName,
          [],
          { ...triggerOptions, returns: 'trigger' },
          definition
        )}\n`
      : '';
    return `${fnSQL}${triggerSQL}`;
  };

  _create.reverse = (
    tableName,
    triggerName,
    triggerOptions = {},
    definition
  ) => {
    const triggerSQL = dropTrigger(mOptions)(
      tableName,
      triggerName,
      triggerOptions
    );
    const fnSQL = definition
      ? `\n${dropFunction(mOptions)(
          triggerOptions.function || triggerName,
          [],
          triggerOptions
        )}`
      : '';
    return `${triggerSQL}${fnSQL}`;
  };

  return _create;
}

function renameTrigger(mOptions) {
  const _rename = (tableName, oldTriggerName, newTriggerName) => {
    return `ALTER TRIGGER ${mOptions.literal(
      oldTriggerName
    )} ON ${mOptions.literal(tableName)} RENAME TO ${mOptions.literal(
      newTriggerName
    )};`;
  };
  _rename.reverse = (tableName, oldTriggerName, newTriggerName) =>
    _rename(tableName, newTriggerName, oldTriggerName);
  return _rename;
}

module.exports = {
  createTrigger,
  dropTrigger,
  renameTrigger
};
