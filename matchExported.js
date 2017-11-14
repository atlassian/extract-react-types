// @flow
const {explodeModule} = require('babel-explode-module');
const {explodedToStatements} = require('babel-helper-simplify-module');
const {format} = require('babel-log');
const t = require('babel-types');

module.exports = function matchExported(file/* : Object */, exportName/*: string */) {
  let exploded = explodeModule(file.path.node);
  let statements = explodedToStatements(exploded);


  let program = Object.assign({}, file.path.node, {
    body: statements,
  });

  file.path.replaceWith(program);

  let match = exploded.exports.find(item => {
    return item.external === exportName;
  });

  if (!match) {
    return null;
  }

  let local = match.local;

  if (!local) {
    return null;
  }

  let statement = file.path.get('body').find(item => {
    if (!item.isDeclaration()) return false;

    let id = null;

    if (item.isVariableDeclaration()) {
      id = item.node.declarations[0].id;
    } else if (item.isImportDeclaration()) {
      id = item.node.specifiers[0].local;
    } else if (item.node.id) {
      id = item.node.id;
    } else {
      throw new Error(`Unexpected node:\n\n${format(item)}`);
    }

    if (!id) {
      throw new Error(`Couldn't find id on node:\n\n${format(item)}`);
    }

    return id.name === local;
  });

  return statement || null;
}
