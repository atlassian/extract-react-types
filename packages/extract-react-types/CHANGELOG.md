# extract-react-types

## 0.29.2

### Patch Changes

- [`8688631`](https://github.com/atlassian/extract-react-types/commit/8688631d360bc7d4f42f166d62ac14ae07750f5e) [#167](https://github.com/atlassian/extract-react-types/pull/167) Thanks [@danieldelcore](https://github.com/danieldelcore)! - Minor variable rename and code formatting

## 0.29.1

### Patch Changes

- [`945eb91`](https://github.com/atlassian/extract-react-types/commit/945eb91b43a0ab0b0baa354515007c8b0aad79f2) [#164](https://github.com/atlassian/extract-react-types/pull/164) Thanks [@danieldelcore](https://github.com/danieldelcore)! - forwardRef wrapped in a memo now works with type inference

## 0.29.0

### Minor Changes

- [`683eac7`](https://github.com/atlassian/extract-react-types/commit/683eac7d701293b1ff6a6fc345e9b1b59d0b02e9) [#159](https://github.com/atlassian/extract-react-types/pull/159) Thanks [@danieldelcore](https://github.com/danieldelcore)! - Add support for memos typed with generics

## 0.28.0

### Minor Changes

- [`68bcec6`](https://github.com/atlassian/extract-react-types/commit/68bcec67728218b861fedb99c735a5ddc062ee53) [#152](https://github.com/atlassian/extract-react-types/pull/152) Thanks [@danieldelcore](https://github.com/danieldelcore)! - Added a safe bail-out for when extract-react-types encounters an unsupported keyword or syntax.
  In that case, the type will be output as a raw string and summary type will be `raw`.

## 0.27.1

### Patch Changes

- [`1eea112`](https://github.com/atlassian/extract-react-types/commit/1eea112cfc308f07219ee5e20f4813f25ab25fda) [#151](https://github.com/atlassian/extract-react-types/pull/151) Thanks [@danieldelcore](https://github.com/danieldelcore)! - Minor clean-up and formatting

## 0.27.0

### Minor Changes

- [`cf31e5e`](https://github.com/atlassian/extract-react-types/commit/cf31e5e4e99648994ceb6bb1719e20226f816532) [#143](https://github.com/atlassian/extract-react-types/pull/143) Thanks [@danieldelcore](https://github.com/danieldelcore)! - Added support for React.FC type annotations

## 0.26.0

### Minor Changes

- [`19b9bc8`](https://github.com/atlassian/extract-react-types/commit/19b9bc8164216ae3ed40d6abfc93920016ba63e2) [#134](https://github.com/atlassian/extract-react-types/pull/134) Thanks [@danieldelcore](https://github.com/danieldelcore)! - Add support for forwardRefs typed via TS type arguments (aka generics)

## 0.25.0

### Minor Changes

- [`d1115ee`](https://github.com/atlassian/extract-react-types/commit/d1115eecdeedda23caa558f253ee4f769e3f0606) [#126](https://github.com/atlassian/extract-react-types/pull/126) Thanks [@pgmanutd](https://github.com/pgmanutd)! - add support for TSTypeQuery

## 0.24.0

### Minor Changes

- [`99f6c8a`](https://github.com/atlassian/extract-react-types/commit/99f6c8a1cd0c41091caa870d233b34c0500b0565) [#118](https://github.com/atlassian/extract-react-types/pull/118) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Update ert to resolve export { default } to a relevant react component

### Patch Changes

- [`63c7367`](https://github.com/atlassian/extract-react-types/commit/63c7367b5aa449ef8fffbf1d9daf0da71c5dabff) Thanks [@Noviny](https://github.com/Noviny)! - Interal refactor, no logic changes

## 0.23.0

### Minor Changes

- [minor][acb8499](https://github.com/atlassian/extract-react-types/commit/acb8499):
  Adds support for the TSUnknownKeyword

## 0.22.1

### Patch Changes

- [patch][3385ac3](https://github.com/atlassian/extract-react-types/commit/3385ac3):
  Enusre 'value' exists before attempting to filter its members

## 0.22.0

### Minor Changes

- [minor][dc4b719](https://github.com/atlassian/extract-react-types/commit/dc4b719):
  Adds support for TypeScript's as expression.

### Patch Changes

- [patch][2e473dd](https://github.com/atlassian/extract-react-types/commit/2e473dd):
  Fix to ensure members exist before attempting to filter them
- [patch][6eea533](https://github.com/atlassian/extract-react-types/commit/6eea533):
  Introduces a workaround for TypeScript types that are unable to be resolved and return null

## 0.21.0

### Minor Changes

- [minor][dc4b719](https://github.com/atlassian/extract-react-types/commit/dc4b719):
  Adds support for TypeScript's as expression.

## 0.20.1

### Patch Changes

- [patch][e6cc1f5](https://github.com/atlassian/extract-react-types/commit/e6cc1f5):
  Remove dangerous debug code that broke everything

## 0.20.0

### Minor Changes

- [minor][533d172](https://github.com/atlassian/extract-react-types/commit/533d172):
  Add support for opaque types

## 0.19.0

### Minor Changes

- [minor][d232e30](https://github.com/atlassian/extract-react-types/commit/d232e30):
  Implement stub for TSConditionalType

## 0.18.0

### Minor Changes

- [minor][907688c](https://github.com/atlassian/extract-react-types/commit/907688c):
  sets 'all' option in flow parser to true

### Patch Changes

- [patch][e4c1b4b](https://github.com/atlassian/extract-react-types/commit/e4c1b4b):
  - Changed the babel-explode-module to be referenced from @aparna036/babel-explode-module which has the opaque type
    variable declaration support.

## 0.17.0

### Minor Changes

- [minor][e682bbb](https://github.com/atlassian/extract-react-types/commit/e682bbb):
  Changes default export of `extract-react-types` to a named export. See below for changes.

  ```diff
  -import extractReactTypes from 'extract-react-types';
  +import { extractReactTypes } from 'extract-react-types';
  // or in cjs
  -const extractReactTypes = require('extract-react-types');
  +const { extractReactTypes } = require('extract-react-types');
  ```

### Patch Changes

- [patch][4b3b4a4](https://github.com/atlassian/extract-react-types/commit/4b3b4a4):
  - Add logicalExpression converter

## 0.16.1

- [patch][e401ba8](https://github.com/atlassian/extract-react-types/commit/e401ba8):

  - Add converter for typeCastExpression

- [patch][6769531](https://github.com/atlassian/extract-react-types/commit/6769531):
  - Decorators should work again
  - Allow default props to be missing
  - Return correct names for nested properties in an object
  - Add `key` field to arrays (missing previously)

## 0.16.0

- [minor][277b0be](https://github.com/atlassian/extract-react-types/commit/277b0be):

  - Add findExportedComponents function

- [minor][8f04dad](https://github.com/atlassian/extract-react-types/commit/8f04dad):

  - Add name to function components like class components

- [minor][6bc521c](https://github.com/atlassian/extract-react-types/commit/6bc521c):
  - Support memo, forwardRef and function expressions

## 0.15.1

- **bug fix** We were calling `convert` in our initial function setup. We have switched to using nodes instead so we do not run convert on all assignment expressions.

## 0.15.0

- **breaking:** We have changed how we approach types in a file. We try and resolve default exports, rather than resolving all react class componets in the file. This causes two breaking changes:
  - instead of an array of classes, `Program` now has a single `component` property.
  - Because of this, anything that relied on the `classes` attribute is invalid.
- **breaking** We now will attempt to resolve the default export before falling back its previous method of analyzing props (using the first component class in a file).
- 🎉 FEATURE 🎉: `extract-react-types` now supports functional components as default exports. We will resolve both the props and the default props as a best effort. Huge thanks to [Peter Gleeson](https://github.com/petegleeson) for working on this.

## 0.14.7

- add support for non-imported TS index access

## 0.14.6

- add support for TSIndexedAccessType and fix TSQualifiedName for imported types

## 0.14.5

- Do not throw an error when prop types contain a generic spread
- Update generic converter to convert utility types - at this time only $Exact, with the intent to add more.
    $Exact<T> is now converted to T directly to make object spreading
  easier to work with as we do not care about exactness when spreading
  from a prop documentation perspective.
- Gitignore vscode metadata
- Add referenceIdName to identifiers converted in type mode
  This provides a name that can be used when wanting to print the name of
  a generic or similar, which is what we're doing with the typeof node.
- Update typeof to use referenceIdName if name does not exist

## 0.14.4

- `getProp` recursive function now relies on `resolveFromGeneric` to escape from intersections, allowing for nested interrsections to find props.

## 0.14.3

- call to `loadFileSync` in `ExportNamedDeclaration` was not being passed in the loaderOpts, causing an error in the parsing. Options are now passed through correctly.
- Fix Id to have additional optional property.

## 0.14.2

- fix decorator plugin implementation

## v0.14.1

- add decorators plugin to the babel process.

## v0.14.0

- Add Proper Typescript support

Most typescript types should now have converters. Using `extract-react-types` with typescript is no longer likely to be disappointing and upsetting.

If you find any converters that were not added, please contact @noviny, or submit a pull request. <3

## v0.13.1

- Fix incorrect typing
- Add Changelog
