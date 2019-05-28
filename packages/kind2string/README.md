# Kind 2 String - a parser for extract-react-types

Kind 2 String is designed to take the data structures output by [extract-react-types](https://www.npmjs.com/package/extract-react-types) and convert them to a (useful) string, as well as performing safe traversal through the output of `extract-react-types` so that trying to display information in your docs does not throw errors.

It exposes a `convert` method which allows you to ensure the data structure resolves to a string. It also exposes its `converter` object, allowing you to overwrite converters of your choice, if you wish to perform some other action other than the default string converter.

Default use-case:

```js
import generatedData from './extract-react-type-write-location';
import convert from 'kind2string';

export default () => <div>convert(generatedData)</div>;
```

Also, if you are handling the kinds in a custom way, it is good to pass the final kind to `kind2string`, to ensure that you always pass a string to your react components.

For examples of how to use this, the [@atlaskit/docs](https://www.npmjs.com/package/@atlaskit/docs) uses this package. A good pattern on how to implement `kind2string` can be found in the [prettyproptypes](https://github.com/atlassian/extract-react-types/tree/master/packages/pretty-proptypes) file.
