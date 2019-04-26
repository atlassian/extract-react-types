// @flow
import stripIndent from 'strip-indent';
import generateReactTypes from '../index';

const strip = x => stripIndent(x).trim();

test('generate ts definition for flow boolean', () => {
  let code = `
    class Component extends React.Component<{ foo: boolean }> {
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
