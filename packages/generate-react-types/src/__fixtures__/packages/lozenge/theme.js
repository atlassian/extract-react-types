// @flow
export type ThemeAppearance =
  | 'default'
  | 'inprogress'
  | 'moved'
  | 'new'
  | 'removed'
  | 'success'
  | {};

export type LozengeThemeTokens = {
  backgroundColor: string,
  maxWidth: number | string,
  textColor: string
};

export type LozengeThemeProps = {
  appearance: ThemeAppearance | {},
  isBold: boolean,
  maxWidth: number | string
};
