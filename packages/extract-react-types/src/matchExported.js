// @flow
import { explodeModule } from 'babel-explode-module';
import { explodedToStatements } from 'babel-helper-simplify-module';
// $FlowFixMe
import printAST from 'ast-pretty-print';

export default function matchExported(file: Object, exportName: string) {
  let exploded = explodeModule(file.path.node);
  let statements = explodedToStatements(exploded);
  let program = Object.assign({}, file.path.node, {
    body: statements
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

  if (local === 'default' && match.source) {
    local = exportName;
  }

  let statement = file.path.get('body').find(item => {
    // Ignore export all & default declarations, since they do not have specifiers/ids.
    if (!item.isDeclaration() || item.isExportAllDeclaration()) return false;

    let id = null;

    if (item.isVariableDeclaration()) {
      id = item.node.declarations[0].id;
    } else if (item.isImportDeclaration()) {
      id = item.node.specifiers[0].local;
    } else if (item.isExportNamedDeclaration()) {
      id = item.node.specifiers[0].exported;
    } else if (item.node.id) {
      id = item.node.id;
    } else {
      throw new Error(`Unexpected node:\n\n${printAST(item)}`);
    }

    if (!id) {
      throw new Error(`Couldn't find id on node:\n\n${printAST(item)}`);
    }

    return id.name === local;
  });

  return statement || null;
}
