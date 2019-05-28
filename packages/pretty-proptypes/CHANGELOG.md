# pretty-proptypes

## 0.6.1
### Patch Changes

- [patch] [287e4b4](https://github.com/atlassian/extract-react-types/commit/287e4b4):
  - Updated build to use preconstruct (this shouldn't affect usage, but calling this out just in case)

- Updated dependencies [e682bbb](https://github.com/atlassian/extract-react-types/commit/e682bbb):
  - kind2string@0.5.4
  - extract-react-types@0.17.0

## 0.6.0
- [minor] [277b0be](https://github.com/atlassian/extract-react-types/commit/277b0be):
  - Add component prop to Props component

- Updated dependencies [277b0be](https://github.com/atlassian/extract-react-types/commit/277b0be):
- Updated dependencies [8f04dad](https://github.com/atlassian/extract-react-types/commit/8f04dad):
- Updated dependencies [6bc521c](https://github.com/atlassian/extract-react-types/commit/6bc521c):
  - kind2string@0.5.2
  - extract-react-types@0.16.0

## 0.5.0

- Update to support 0.15.0 of `extract-react-types`
- **breaking** The structure of the `Program` kind from `extract-react-types` has changed. `0.5.0` consumes and responds to that change, and will only work with later versions of `extract-react-types`.

## v0.4.2

- Use <Whitespace /> to mean the prop type can be selected separately to the prop name

Thanks [Maciej Adamczak](https://github.com/macku) for 

## v0.4.1

Thanks [Michael Blaszczyk](https://github.com/Blasz) for these contributions!

- Support spreading generic types that cannot be reduced down to objects
- Move reduceToObj to kind2string and then update kind2string dependency

## v0.4.0

- pull in newer version of kind2string, adding support for 'export' and 'exportSpecifier' kinds.

## v0.3.0

- Add arrayType converter
- Remove whitespace created by converting a type that wasn't there

## v0.2.3

- fix bug where object converter would assume all spreads had members when they were resolved from generic. Some spreads will resolve to an import. Used simple solution of allowing spreads that did not resolve to have members gets caught with a second call to prettyConvert.
