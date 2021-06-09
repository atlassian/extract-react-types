# extract-react-types-loader

## 1.0.0

### Major Changes

- [`1ec5f76`](https://github.com/atlassian/extract-react-types/commit/1ec5f76c5e99ce78e952a83eac178fcc22e5f557) [#196](https://github.com/atlassian/extract-react-types/pull/196) Thanks [@marionebl](https://github.com/marionebl)! - Remove Atlaskit specific process.env switches (#195)

  BREAKING CHANGE
  This removes the previously available process.env switches to conditionally disable the loader.
  To restore the previous behaviour you'll have to use the `resolveLoader` webpack config, e.g.

  ```js
  // webpack.config.js
  const enabled =
    ['production', 'staging'].includes(process.env.WEBSITE_ENV) ||
    process.env.FORCE_EXTRACT_REACT_TYPES;

  module.exports = {
    /* ... */
    resolveLoader: {
      alias: {
        'extract-react-types-loader': enabled
          ? undefined
          : require.resolve('./noop-extract-react-types-loader')
      }
    }
  };
  ```

  ```js
  // noop-extract-react-types-loader.js
  module.exports = function noopExtractReactPropTypesLoader() {
    return `module.exports = {
      component: {
        kind: 'object',
        members: [
          {
            kind: 'property',
            key: { kind: 'id', name: 'Warning' },
            value: { kind: 'any' },
            optional: false,
            leadingComments: [
              {
                type: 'commentBlock',
                value: `extract-react-types is not being run in dev mode for speed reasons. If you need to
    see prop types add the environment variable \`FORCE_EXTRACT_REACT_TYPES\`
                raw: '**'
              }
            ],
            default: {
              kind: 'string',
              value: 'Prop types are not shown in dev mode'
            }
          }
        ],
        referenceIdName: 'NoopPropTpes'
      }
    };`
  }
  ```

## 0.3.17

### Patch Changes

- [`c1aa88d`](https://github.com/atlassian/extract-react-types/commit/c1aa88d6b5913b933711c3cc0139de63b2633678) [#172](https://github.com/atlassian/extract-react-types/pull/172) Thanks [@danieldelcore](https://github.com/danieldelcore)! - Forced minor (no changes)

- Updated dependencies [[`c1aa88d`](https://github.com/atlassian/extract-react-types/commit/c1aa88d6b5913b933711c3cc0139de63b2633678)]:
  - extract-react-types@0.30.0

## 0.3.16

### Patch Changes

- Updated dependencies [[`683eac7`](https://github.com/atlassian/extract-react-types/commit/683eac7d701293b1ff6a6fc345e9b1b59d0b02e9)]:
  - extract-react-types@0.29.0

## 0.3.15

### Patch Changes

- Updated dependencies [[`68bcec6`](https://github.com/atlassian/extract-react-types/commit/68bcec67728218b861fedb99c735a5ddc062ee53)]:
  - extract-react-types@0.28.0

## 0.3.14

### Patch Changes

- Updated dependencies [[`cf31e5e`](https://github.com/atlassian/extract-react-types/commit/cf31e5e4e99648994ceb6bb1719e20226f816532)]:
  - extract-react-types@0.27.0

## 0.3.13

### Patch Changes

- Updated dependencies [[`19b9bc8`](https://github.com/atlassian/extract-react-types/commit/19b9bc8164216ae3ed40d6abfc93920016ba63e2)]:
  - extract-react-types@0.26.0

## 0.3.12

### Patch Changes

- Updated dependencies [[`d1115ee`](https://github.com/atlassian/extract-react-types/commit/d1115eecdeedda23caa558f253ee4f769e3f0606)]:
  - extract-react-types@0.25.0

## 0.3.11

### Patch Changes

- Updated dependencies [[`99f6c8a`](https://github.com/atlassian/extract-react-types/commit/99f6c8a1cd0c41091caa870d233b34c0500b0565), [`849c979`](https://github.com/atlassian/extract-react-types/commit/849c979faf91b6b1f24a85ce267698639e4caeb8)]:
  - extract-react-types@0.24.0

## 0.3.10

- Updated dependencies [acb8499](https://github.com/atlassian/extract-react-types/commit/acb8499):
  - extract-react-types@0.23.0

## 0.3.9

### Patch Changes

- [patch][361a24b](https://github.com/atlassian/extract-react-types/commit/361a24b):
  Add readme

- Updated dependencies [dc4b719](https://github.com/atlassian/extract-react-types/commit/dc4b719):
  - extract-react-types@0.22.0

## 0.3.8

- Updated dependencies [dc4b719](https://github.com/atlassian/extract-react-types/commit/dc4b719):
  - extract-react-types@0.21.0

## 0.3.7

### Patch Changes

- [patch][e6cc1f5](https://github.com/atlassian/extract-react-types/commit/e6cc1f5):
  Remove dangerous debug code that broke everything

## 0.3.5

### Patch Changes

- [patch][47a2b1d](https://github.com/atlassian/extract-react-types/commit/47a2b1d):
  Don't pull types from src if types file exits

- Updated dependencies [533d172](https://github.com/atlassian/extract-react-types/commit/533d172):
  - extract-react-types@0.20.0

## 0.3.4

- Updated dependencies [d232e30](https://github.com/atlassian/extract-react-types/commit/d232e30):
  - extract-react-types@0.19.0

## 0.3.3

### Patch Changes

- [patch][e4c1b4b](https://github.com/atlassian/extract-react-types/commit/e4c1b4b):
  - Added support for loading modules from src as well as node_modules

* Updated dependencies [907688c](https://github.com/atlassian/extract-react-types/commit/907688c):
  - extract-react-types@0.18.0

## 0.3.2

- Updated dependencies [e682bbb](https://github.com/atlassian/extract-react-types/commit/e682bbb):
  - extract-react-types@0.17.0

## 0.3.1

- [patch][3299e3a](https://github.com/atlassian/extract-react-types/commit/3299e3a):

  - Fix the dev mode data to align with new structure for ERT 0.15, as previously no render was occurring

- Updated dependencies [277b0be](https://github.com/atlassian/extract-react-types/commit/277b0be):
- Updated dependencies [8f04dad](https://github.com/atlassian/extract-react-types/commit/8f04dad):
- Updated dependencies [6bc521c](https://github.com/atlassian/extract-react-types/commit/6bc521c):
  - extract-react-types@0.16.0

## 0.3.0

- [minor][882a85c](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/882a85c):

  - Use version 0.15.0 of extract-react-types - the breaking change cannot be absorbed by changes in this package.

## 0.2.2

- [patch] Upgrade extract-react-types to add TypeScript support. [c742e5a](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/c742e5a)

## 0.2.1

- [patch] Remove console log [e16d2b6](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/e16d2b6)

## 0.2.0

- [minor] Add pathFilter function to resolve atlaskit:src paths within atlaskit [c5214a3](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/c5214a3)

## 0.1.3

- [patch] Sanity test release, no actual change [481c086](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/481c086)

## 0.1.2

- [patch] Upgrade extract-react-types version [f78d035](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/f78d035)

## 0.1.1

- [patch] Makes packages Flow types compatible with version 0.67 [25daac0](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/25daac0)

## 0.1.0

- [minor] Npm fell behind code [9684be0](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/9684be0)
