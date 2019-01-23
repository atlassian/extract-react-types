# extract-react-types

> Extract Flow & TypeScript types from React Components

## Features

- Supports flow and typescript
- Extracts the description of the props too ( Great for documentation )

## Usage

```sh
$ yarn add extract-react-types
```

```js
// Component.js

class Component extends React.Component<{ foo: boolean }> {}
```

Output:

```js
{
  "kind": "program",
  "classes": [
    {
      "kind": "object",
      "members": [
      {
        "kind": "property",
        "key": {
        "kind": "id",
        "name": "foo"
        },
        "value": {
        "kind": "boolean"
        },
        "optional": false
      }
      ],
      "name": {
      "kind": "id",
      "name": "Component",
      "type": null
      }
    }
  ]
}
```

## Related projects:

- [extract-react-types-loader](https://www.npmjs.com/package/extract-react-types-loader)
- [pretty-proptypes](https://github.com/Noviny/pretty-proptypes)
- [kind2string](https://github.com/gwyneplaine/kind2string)

