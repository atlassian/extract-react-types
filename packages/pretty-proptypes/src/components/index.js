// @flow
import type { ComponentType } from 'react';
import Indent from './Indent';
import Outline from './Outline';
import Required from './Required';
import Description from './Description';
import Button from './Button';
import Expander from './Expander';
import Type, { StringType, TypeMeta, FunctionType } from './Type';

const components = {
  Indent,
  Outline,
  Required,
  Type,
  StringType,
  TypeMeta,
  Description,
  Button,
  FunctionType,
  Expander
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
  FunctionType: ComponentType<any>,
  Expander: ComponentType<any>
};
