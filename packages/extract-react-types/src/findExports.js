import { loadFileSync, resolveImportFilePathSync } from 'babel-file-loader';
export function hasDestructuredDefaultExport (path) {
  const exportPath = path.get('body').find(bodyPath => {
    return bodyPath.isExportNamedDeclaration() 
      && bodyPath.get('specifiers')
        .filter(n => n.node.exported.name === 'default').length;
  });

  return Boolean(exportPath);
}

export function followExports (path, context, convert) {
  const exportPath = path.get('body')
    .find(bodyPath => {
      return bodyPath.isExportNamedDeclaration() && bodyPath.get('specifiers').filter(n => n.node.exported.name === 'default');
    })
  
  if (!exportPath) throw new Error({
    message: 'No export path found' 
  });

  try {
    const filePath = resolveImportFilePathSync(exportPath, context.resolveOptions);
    const file = loadFileSync(filePath, context.parserOpts);
    const converted = convert(file.path, context);
    return converted;
  } catch (e) {
    throw new Error(e);
  }
}

export default function findExports(
  path,
  exportsToFind: 'all' | 'default',
): Array<{ name: string | null, path: any }> {
  let formattedExports = [];

  path
    .get('body')
    .filter(bodyPath => 
      // we only check for named and default exports here, we don't want export all)
      exportsToFind === 'default'
        ? bodyPath.isExportDefaultDeclaration()
        : (bodyPath.isExportNamedDeclaration() &&
            bodyPath.node.source === null &&
            // exportKind is 'value' or 'type' in flow
            (bodyPath.node.exportKind === 'value' ||
              // exportKind is undefined in typescript
              bodyPath.node.exportKind === undefined)) ||
          bodyPath.isExportDefaultDeclaration()
    )
    .forEach(exportPath => {
      const declaration = exportPath.get('declaration');

      if (exportPath.isExportDefaultDeclaration()) {
        if (declaration.isIdentifier()) {
          let binding = path.scope.bindings[declaration.node.name].path;

          if (binding.isVariableDeclarator()) {
            binding = binding.get('init');
          }

          formattedExports.push({
            name: declaration.node.name,
            path: binding
          });
        } else {
          let name = null;

          if (
            (declaration.isClassDeclaration() || declaration.isFunctionDeclaration()) &&
            declaration.node.id !== null
          ) {
            name = declaration.node.id.name;
          }

          formattedExports.push({ name, path: declaration });
        }
      } else {
        const specifiers = exportPath.get('specifiers');

        if (specifiers.length === 0) {
          if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
            let identifier = declaration.node.id;
            formattedExports.push({
              name: identifier === null ? null : identifier.name,
              path: declaration
            });
          }

          if (declaration.isVariableDeclaration()) {
            declaration.get('declarations').forEach(declarator => {
              formattedExports.push({
                name: declarator.node.id.name,
                path: declarator.get('init')
              });
            });
          }
        } else {
          specifiers.forEach(specifier => {
            let name = specifier.node.local.name;
            let binding = path.scope.bindings[name].path;
            if (binding.isVariableDeclarator()) {
              binding = binding.get('init');
            }
            formattedExports.push({
              name,
              path: binding
            });
          });
        }
      }
    });

  return formattedExports;
}
