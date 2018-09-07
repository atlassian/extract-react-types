# extract-react-types

## 0.14.3

- call to `loadFileSync` in `ExportNamedDeclaration` was not being passed in the loaderOpts, causing an error in the parsing. Options are now passed through correctly.
- Fix Id to have additional optional property.

## 0.14.2

- fix decorator plugin implementation

## v0.14.1

- add decorators plugin to the babel process.

## v0.14.0

- Add Proper Typescript support

Most typescript types should now have converters. Using `extract-react-types` with typescript is no longer likely to be disappointing and upsetting.

If you find any converters that were not added, please contact @noviny, or submit a pull request. <3

## v0.13.1

- Fix incorrect typing
- Add Changelog
