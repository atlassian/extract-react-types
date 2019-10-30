# pretty-proptypes

## 1.0.4

### Patch Changes

- [`6827845`](https://github.com/atlassian/extract-react-types/commit/68278457981fc557dc470f79ca56b686814c3e21) Thanks [@Noviny](https://github.com/Noviny)! - Fix build from previous release

- Updated dependencies [[`6827845`](https://github.com/atlassian/extract-react-types/commit/68278457981fc557dc470f79ca56b686814c3e21)]:
  - kind2string@0.7.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`dc667b4`](https://github.com/atlassian/extract-react-types/commit/dc667b45277ca0440f67f24051e1d0ada07f5e4d)]:
  - kind2string@0.7.0

## 1.0.2

### Patch Changes

- [patch][089780f](https://github.com/atlassian/extract-react-types/commit/089780f):
  Change console.error for null members in pretty-proptypes to console.warn

## 1.0.1

### Patch Changes

- [patch][ac12401](https://github.com/atlassian/extract-react-types/commit/ac12401):
  Work around added in object converter to not throw on null value in members list

## 1.0.0

### Major Changes

- [major][13719db](https://github.com/atlassian/extract-react-types/commit/13719db):
  Upgrade to emotion 10. If you've been using emotion-server to server render this package, you can remove it now because server rendering will work without it.

### Patch Changes

- [patch][58d12d8](https://github.com/atlassian/extract-react-types/commit/58d12d8):
  Fix a usage of the css prop that wasn't updated to emotion 10's syntax

- Updated dependencies [dc4b719](https://github.com/atlassian/extract-react-types/commit/dc4b719):
  - kind2string@0.6.3
  - extract-react-types@0.22.0

## 0.6.6

- Updated dependencies [dc4b719](https://github.com/atlassian/extract-react-types/commit/dc4b719):
  - kind2string@0.6.2
  - extract-react-types@0.21.0

## 0.6.5

### Patch Changes

- [patch][e6cc1f5](https://github.com/atlassian/extract-react-types/commit/e6cc1f5):
  Remove dangerous debug code that broke everything

## 0.6.4

- Updated dependencies [533d172](https://github.com/atlassian/extract-react-types/commit/533d172):
  - extract-react-types@0.20.0
  - kind2string@0.6.0

## 0.6.3

- Updated dependencies [d232e30](https://github.com/atlassian/extract-react-types/commit/d232e30):
  - kind2string@0.5.6
  - extract-react-types@0.19.0

## 0.6.2

- Updated dependencies [907688c](https://github.com/atlassian/extract-react-types/commit/907688c):
  - kind2string@0.5.5
  - extract-react-types@0.18.0

## 0.6.1

### Patch Changes

- [patch][287e4b4](https://github.com/atlassian/extract-react-types/commit/287e4b4):

  - Updated build to use preconstruct (this shouldn't affect usage, but calling this out just in case)

- Updated dependencies [e682bbb](https://github.com/atlassian/extract-react-types/commit/e682bbb):
  - kind2string@0.5.4
  - extract-react-types@0.17.0

## 0.6.0

- [minor][277b0be](https://github.com/atlassian/extract-react-types/commit/277b0be):

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
