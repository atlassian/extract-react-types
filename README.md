# Kind 2 String - a parser for extract-react-types

Kind 2 Strong is designed to take the data structures outputted by [extract-react-tyes]() and convert it down to a (useful) string, as well as performing safe traversal through the output of `extract-react-types` so that trying to display information in your docs

It exposes a convert method which allows you to ensure the data structure resolves to a string. It also exposes its converter object, allowing you to overwrite converters of your choice, if you wish to perform some other action other than the default string converter.

Default use-case:

```js
import generatedData from './extract-react-type-write-location';
import convert from 'kind2string';

export default () => <div>convert(generatedData)</div>;
```
