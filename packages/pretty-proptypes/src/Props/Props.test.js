// @flow
import React from 'react';
import { render, screen } from '@testing-library/react';
import { extractReactTypes } from 'extract-react-types';

import Props from './';

const file = `
const MyComponent = (props: { simpleProp: string }) => null;

export default MyComponent;
`;

test('should visualise props from extract-types-loader', () => {
  const { container, getByText } = render(
    <Props props={extractReactTypes(file, 'flow')} heading="FormFooter Props" />
  );

  const prop = getByText('simpleProp');
  expect(prop).toBeTruthy();
  expect(getByText('required')).toBeTruthy();
  expect(getByText('string')).toBeTruthy();
});

test('simple facts about two props', () => {
  const file2 = `
const MyComponent = (props: { simpleProp: string, secondProp?: number }) => null;

export default MyComponent;
`;

  const { container, getByText } = render(
    <Props props={extractReactTypes(file2, 'flow')} heading="FormFooter Props" />
  );

  expect(getByText('simpleProp')).toBeTruthy();
  expect(getByText('secondProp')).toBeTruthy();
});

test('renders no children when passed on props', () => {
  const { container } = render(<Props heading="empty" />);
  expect(container.children).toHaveLength(0);
});

describe('#typescript typeSystem', () => {
  test('should visualize generic props from extract-types-loader', () => {
    const code = `
    import React from 'react';

    export type OnSubmitHandler<FormData> = (
      values: FormData,
      callback?: (errors?: Record<string, string>) => void,
    ) => void | Object | Promise<Object | void>;

    interface FormChildrenProps {
      ref: React.RefObject<HTMLFormElement>;
      onSubmit: (
        event?:
          | React.FormEvent<HTMLFormElement>
          | React.SyntheticEvent<HTMLElement>,
      ) => void;
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
    }

    interface FormProps<FormData> {
      children: (args: {
        formProps: FormChildrenProps;
        disabled: boolean;
        dirty: boolean;
        submitting: boolean;
        getValues: () => FormData;
        setFieldValue: (name: string, value: any) => void;
        reset: (initialValues?: FormData) => void;
      }) => ReactNode;
      onSubmit: OnSubmitHandler<FormData>;
      /* When set the form and all fields will be disabled */
      isDisabled?: boolean;
    }

    function Form<FormData extends Record<string, any> = {}>(
      props: FormProps<FormData>,
    ) {}

    Form.defaultProps = {
      isDisabled: true
    };

    export default Form;
  `;

    const { container, getByText } = render(
      <Props props={extractReactTypes(code, 'typescript')} heading="Form Props" />
    );

    const childrenProp = document.querySelector('#Form-children');
    expect(childrenProp).toBeTruthy();
    expect(childrenProp.textContent).toContain('required');
    expect(childrenProp.textContent).toContain('function');

    const onSubmitProp = document.querySelector('#Form-onSubmit');
    expect(onSubmitProp).toBeTruthy();
    expect(onSubmitProp.textContent).toContain('required');
    expect(onSubmitProp.textContent).toContain(
      '(values, callback) => undefined | Object | Promise<Object | undefined><FormData>'
    );

    const isDisabledProp = document.querySelector('#Form-isDisabled');
    expect(isDisabledProp).toBeTruthy();
    expect(isDisabledProp.textContent).not.toContain('required');
    expect(isDisabledProp.textContent).toContain('boolean');
    expect(isDisabledProp.textContent).toContain('true');
    expect(isDisabledProp.textContent).toContain(
      'When set the form and all fields will be disabled'
    );
  });
});
