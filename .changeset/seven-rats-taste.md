---
"extract-react-types-loader": major
---

Remove Atlaskit specific process.env switches (#195)

BREAKING CHANGE
This removes the previously available process.env switches to conditionally disable the loader. 
To restore the previous behaviour you'll have to use the `resolveLoader` webpack config, e.g. 

```js
// webpack.config.js
const enabled = ['production', 'staging'].includes(process.env.WEBSITE_ENV) || process.env.FORCE_EXTRACT_REACT_TYPES;

module.exports = {
  /* ... */
  resolveLoader: {
    alias: {
      'extract-react-types-loader': enabled ? undefined : require.resolve('./noop-extract-react-types-loader')
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
