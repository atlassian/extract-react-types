# pretty-proptypes

## 1.6.1

### Patch Changes

- e0686d4: Changed the heading styles for deprecated props and removed "@deprecated" from the prop description.

## 1.6.0

### Minor Changes

- 33d0126: Introduces new functionality enabling permalinks to each section of a props list. It's done in a backwards-compatible manner requiring no code changes for a dependency bump, but you might want to double check styles are suitable to the surroundings of where the props are displayed.

## 1.5.2

### Patch Changes

- 2bef5ff: Reintroduces null check in the case where props can't be parsed and return empty

## 1.5.0

### Minor Changes

- f34959f: Adds the ability to override the Prop Expander + Fixes a few styling issues

## 1.4.0

### Minor Changes

- 093e1af: Adds a generic layout renderer which can be used to create bespoke prop tables. Also refactors the internals of the hybrid layout to utilise it

## 1.3.0

### Minor Changes

- [`a763063`](https://github.com/atlassian/extract-react-types/commit/a76306349bbccc1aa53a101ce7c444120c2a0ba4) [#199](https://github.com/atlassian/extract-react-types/pull/199) Thanks [@madou](https://github.com/madou)! - Props that have comments which start with `eslint-ignore` or `@ts-` are no longer rendered,
  other surrounding comments are still rendered for the prop however.

* [`a763063`](https://github.com/atlassian/extract-react-types/commit/a76306349bbccc1aa53a101ce7c444120c2a0ba4) [#199](https://github.com/atlassian/extract-react-types/pull/199) Thanks [@madou](https://github.com/madou)! - Props that have comments which contain `@internal` or `@access private` are no longer rendered to the props table,
  essentially having the prop and all of its comments hidden.

## 1.2.0

### Minor Changes

- [`84e9241`](https://github.com/atlassian/extract-react-types/commit/84e9241d0bfe9827f5331d96ae9f80cdf3e10894) [#174](https://github.com/atlassian/extract-react-types/pull/174) Thanks [@declan-warn](https://github.com/declan-warn)! - Added a new hybrid layout for displaying props.

## 1.1.4

### Patch Changes

- [`a879c29`](https://github.com/atlassian/extract-react-types/commit/a879c295a2b3131d00087d606a5d85cac60924ec) [#146](https://github.com/atlassian/extract-react-types/pull/146) Thanks [@declan-warn](https://github.com/declan-warn)! - Add missing jsx pragma in `packages/pretty-proptypes/src/PropsTable/index.js` which fixes an erroneous `css` attribute being rendered in prop table `tr`'s.

## 1.1.3

### Patch Changes

- [`0262fb3`](https://github.com/atlassian/extract-react-types/commit/0262fb3fb04147e5a7d2e2e1e5c20b7415ee13df) [#130](https://github.com/atlassian/extract-react-types/pull/130) Thanks [@pgmanutd](https://github.com/pgmanutd)! - add generic prop interface handling in pretty-proptypes

## 1.1.2

### Patch Changes

- Updated dependencies [[`d1115ee`](https://github.com/atlassian/extract-react-types/commit/d1115eecdeedda23caa558f253ee4f769e3f0606)]:
  - kind2string@0.8.0

## 1.1.1

### Patch Changes

- [`c7c50fa`](https://github.com/atlassian/extract-react-types/commit/c7c50fa09a571a77a5f1376a97b1872a8e85af2e) [#125](https://github.com/atlassian/extract-react-types/pull/125) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fix rendering bug in Props component

## 1.1.0

### Minor Changes

- [`e2519d0`](https://github.com/atlassian/extract-react-types/commit/e2519d040a16f55ff501da8716371b1331a379e5) [#122](https://github.com/atlassian/extract-react-types/pull/122) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Table view added to pretty-proptypes in the form of PropTable component, exported from src

## 1.0.6

### Patch Changes

- Updated dependencies [[`99f6c8a`](https://github.com/atlassian/extract-react-types/commit/99f6c8a1cd0c41091caa870d233b34c0500b0565), [`849c979`](https://github.com/atlassian/extract-react-types/commit/849c979faf91b6b1f24a85ce267698639e4caeb8)]:
  - extract-react-types@0.24.0
  - kind2string@0.7.3

## 1.0.5

- Updated dependencies [acb8499](https://github.com/atlassian/extract-react-types/commit/acb8499):
  - kind2string@0.7.2
  - extract-react-types@0.23.0

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
