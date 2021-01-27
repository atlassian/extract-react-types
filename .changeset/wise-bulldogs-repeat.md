---
'extract-react-types': minor
'babel-plugin-extract-react-types': patch
'kind2string': patch
---

Added a safe bail-out for when extract-react-types encounters an unsupported keyword or syntax.
In that case, the type will be output as a raw string and summary type will be `unsupported`.
