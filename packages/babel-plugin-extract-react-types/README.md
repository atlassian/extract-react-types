# babel-plugin-extract-react-types

> A Babel plugin to store the types of React components as a property on the component for documentation

## Install

```bash
yarn add babel-plugin-extract-react-types
```

## Usage

`.babelrc`

```json
{
  "plugins": ["babel-plugin-extract-react-types"]
}
```

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import SomeComponent from 'somewhere';
import Props from 'pretty-proptypes';

ReactDOM.render(<Props component={SomeComponent} />, document.getElementById('root'));
```
