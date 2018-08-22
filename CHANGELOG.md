# pretty-proptypes

## v0.3.0

- Add arrayType converter
- Remove whitespace created by converting a type that wasn't there

## v0.2.3

- fix bug where object converter would assume all spreads had members when they were resolved from generic. Some spreads will resolve to an import. Used simple solution of allowing spreads that did not resolve to have members gets caught with a second call to prettyConvert.
