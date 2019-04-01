# Getting Started

Please add pretty-proptypes as dependency to the project,

```sh
yarn add pretty-proptypes
```

## Using webpack loader

Add the extract-react-types-loader as dev dependency,

```bash
yarn add extract-react-types-loader  --dev
```

We can use webpack's inline loader feature to create documentation,

```jsx
import Props from 'pretty-proptypes';

// render the props documentation on the page
<Props
    heading="My Cool Component"
    props={require('!!extract-react-types-loader!../MyCoolComponent')}
/>
```

## Using Babel plugin

Add the babel-plugin-extract-react-types as dev dependency,

```bash
yarn add babel-plugin-extract-react-types  --dev
```

Update the babel config to use this plugin,

```js
{
  "plugins": ["babel-plugin-extract-react-types"]
}
```

```js
import MyCoolComponent from 'MyCoolComponent';
import Props from 'pretty-proptypes';
 
<Props 
    heading="My Cool Component"
    props={MyCoolComponent)}
```
