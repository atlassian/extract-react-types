Changes default export of `extract-react-types` to a named export. See below for changes.

```diff
-import extractReactTypes from 'extract-react-types';
+import { extractReactTypes } from 'extract-react-types';
// or in cjs
-const extractReactTypes = require('extract-react-types');
+const { extractReactTypes } = require('extract-react-types');
```
