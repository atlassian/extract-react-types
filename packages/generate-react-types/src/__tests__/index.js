// @flow
import { readFileSync } from 'fs';
import { resolve } from 'path';
import stripIndent from 'strip-indent';
import generateReactTypes from '../index';

const strip = x => stripIndent(x).trim();

test('generate ts definition for flow boolean', () => {
  let code = `
    export class Component extends React.Component<{ foo: boolean }> {
      // ...
    }
  `;
  let result = generateReactTypes(code, 'typescript', __filename);
  expect(result).toEqual(
    strip(`
    import React from "react";
    export declare var Component: React.ComponentType<{
      foo: boolean;
    }>;
  `)
  );
});

test('generate ts definition for flow default props', () => {
  let code = `
    type Props = {
      name: string
    }

    const Component = (props: Props) => null;

    Component.defaultProps = {
      name: 'bob',
    };

    export default Component;
  `;
  let result = generateReactTypes(code, 'typescript', __filename);
  expect(result).toEqual(
    strip(`
    import React from "react";
    declare var Component: React.ComponentType<{
      name?: string;
    }>;
    export default Component;
  `)
  );
});

test('generates ts definitions for flow package', () => {
  let packagePath = resolve(__dirname, '../__fixtures__/packages/lozenge');
  let code = readFileSync(resolve(packagePath, './Lozenge/index.js'), 'utf8');
  let result = generateReactTypes(code, 'typescript', resolve(packagePath, './Lozenge/index.js'));
  expect(result).toEqual(readFileSync(resolve(packagePath, 'index.d.ts'), 'utf8'));
});
