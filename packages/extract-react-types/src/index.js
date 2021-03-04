// @flow
import createBabelFile from 'babel-file';
import createBabylonOptions from 'babylon-options';

import convert, { convertComponentExports } from './converter';
import { findExports } from './export-manager';

export type * from './kinds';

function getContext(
  typeSystem: 'flow' | 'typescript',
  filename?: string,
  resolveOptions?: Object = {}
) {
  const plugins = ['jsx', ['decorators', { decoratorsBeforeExport: true }]];
  if (!resolveOptions.extensions) {
    // The resolve package that babel-file-loader uses only resolves .js files by default instead of the
    // default extension list of node (.js, .json and .node) so add .json back here.
    resolveOptions.extensions = ['.js', '.json'];
  }

  if (typeSystem !== 'flow' && typeSystem !== 'typescript') {
    throw new Error('typeSystem must be either "flow" or "typescript"');
  }

  if (typeSystem === 'flow') {
    plugins.push(['flow', { all: true }]);
  }

  if (typeSystem === 'typescript') {
    plugins.push('typescript');

    resolveOptions.extensions.push('.tsx');
    resolveOptions.extensions.push('.ts');
  }

  /* $FlowFixMe - need to update types in babylon-options */
  const parserOpts = createBabylonOptions({ stage: 2, plugins });

  return { resolveOptions, parserOpts };
}

export function extractReactTypes(
  code: string,
  typeSystem: 'flow' | 'typescript',
  filename?: string,
  inputResolveOptions?: Object
) {
  const { resolveOptions, parserOpts } = getContext(typeSystem, filename, inputResolveOptions);
  const file = createBabelFile(code, { parserOpts, filename });
  return convert(file.path, { resolveOptions, parserOpts });
}

export function findExportedComponents(
  programPath: any,
  typeSystem: 'flow' | 'typescript',
  filename?: string,
  resolveOptions?: Object
) {
  return convertComponentExports(
    findExports(programPath, 'all'),
    getContext(typeSystem, filename, resolveOptions)
  );
}
