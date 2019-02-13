// @flow
import type { ComponentType } from 'react';
import { default as Indent } from './Indent';
import { default as Outline } from './Outline';
import { default as Required } from './Required';
import { default as Description } from './Description';
import { default as Button } from './Button';
import { default as Type, StringType, TypeMeta, FunctionType } from './Type';

const components = {
  Indent,
  Outline,
  Required,
  Type,
  StringType,
  TypeMeta,
  Description,
  Button,
  FunctionType
};

export default components;

export type Components = {
  Indent: ComponentType<any>,
  Outline: ComponentType<any>,
  Required: ComponentType<any>,
  Type: ComponentType<any>,
  StringType: ComponentType<any>,
  TypeMeta: ComponentType<any>,
  Description: ComponentType<any>,
  Button: ComponentType<any>,
  FunctionType: ComponentType<any>
};
