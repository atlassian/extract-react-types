// @flow
export type ThemeAppearance =
  | 'default'
  | 'inprogress'
  | 'moved'
  | 'new'
  | 'removed'
  | 'success'
  | {};

export type ThemeProps = {
  appearance: ThemeAppearance | {},
  isBold: boolean,
  maxWidth: number | string
};
