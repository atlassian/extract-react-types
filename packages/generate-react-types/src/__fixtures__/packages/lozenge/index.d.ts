import React from 'react';
export declare type ThemeAppearance =
  | 'default'
  | 'inprogress'
  | 'moved'
  | 'new'
  | 'removed'
  | 'success'
  | {};
export declare interface ThemeProps {
  appearance: ThemeAppearance | {};
  isBold: boolean;
  maxWidth: number | string;
}
declare interface ThemeTokens {
  backgroundColor: string;
  maxWidth: number | string;
  textColor: string;
}
declare var Lozenge: React.ComponentType<{
  appearance: ThemeAppearance;
  children?: React.Node;
  isBold: boolean;
  maxWidth: number | string;
  theme?: (
    themeProp: (themeProps: ThemeProps) => ThemeTokens,
    themeProps: ThemeProps
  ) => ThemeTokens;
}>;
export default Lozenge;
