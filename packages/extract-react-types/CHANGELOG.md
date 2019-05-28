# extract-react-types

## 0.17.0
### Minor Changes

- [minor] [e682bbb](https://github.com/atlassian/extract-react-types/commit/e682bbb):
  Changes default export of `extract-react-types` to a named export. See below for changes.

  ```diff
  -import extractReactTypes from 'extract-react-types';
  +import { extractReactTypes } from 'extract-react-types';
  // or in cjs
  -const extractReactTypes = require('extract-react-types');
  +const { extractReactTypes } = require('extract-react-types');
  ```


### Patch Changes

- [patch] [4b3b4a4](https://github.com/atlassian/extract-react-types/commit/4b3b4a4):
  - Add logicalExpression converter

## 0.16.1
- [patch] [e401ba8](https://github.com/atlassian/extract-react-types/commit/e401ba8):
  - Add converter for typeCastExpression

- [patch] [6769531](https://github.com/atlassian/extract-react-types/commit/6769531):
  - Decorators should work again
  - Allow default props to be missing
  - Return correct names for nested properties in an object
  - Add `key` field to arrays (missing previously)

## 0.16.0
- [minor] [277b0be](https://github.com/atlassian/extract-react-types/commit/277b0be):
  - Add findExportedComponents function

- [minor] [8f04dad](https://github.com/atlassian/extract-react-types/commit/8f04dad):
  - Add name to function components like class components

- [minor] [6bc521c](https://github.com/atlassian/extract-react-types/commit/6bc521c):
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
