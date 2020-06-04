// @flow
import React from 'react';
import { mount, configure } from 'enzyme';
import { extractReactTypes } from 'extract-react-types';
import Adapter from 'enzyme-adapter-react-16';

import Props from './';

configure({ adapter: new Adapter() });

const file = `
const MyComponent = (props: { simpleProp: string }) => null;

export default MyComponent;
`;

test('should visualise props from extract-types-loader', () => {
  const wrapper = mount(
    <Props props={extractReactTypes(file, 'flow')} heading="FormFooter Props" />
  );

  const prop = wrapper.find('Prop');

  expect(prop.length).toBe(1);
  expect(prop.prop('name')).toBe('simpleProp');
  expect(prop.prop('required')).toBe(true);
  expect(prop.prop('type')).toBe('string');
});

test('simple facts about two props', () => {
  const file2 = `
const MyComponent = (props: { simpleProp: string, secondProp?: number }) => null;

export default MyComponent;
`;

  const wrapper = mount(
    <Props props={extractReactTypes(file2, 'flow')} heading="FormFooter Props" />
  );

  const prop = wrapper.find('Prop');
  expect(prop.length).toBe(2);
});

test('renders no children when passed on props', () => {
  // $FlowFixMe
  const wrapper = mount(<Props heading="empty" />);

  expect(wrapper.children().length).toBe(0);
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

    const wrapper = mount(
      <Props props={extractReactTypes(code, 'typescript')} heading="Form Props" />
    );

    const Prop = wrapper.find('Prop');

    expect(Prop.length).toBe(3);

    const childrenProp = Prop.at(0);

    expect(childrenProp.prop('name')).toBe('children');
    expect(childrenProp.prop('required')).toBe(true);
    expect(childrenProp.prop('type')).toBe('function');

    const onSubmitProp = Prop.at(1);

    expect(onSubmitProp.prop('name')).toBe('onSubmit');
    expect(onSubmitProp.prop('required')).toBe(true);
    expect(onSubmitProp.prop('type')).toBe(
      '(values, callback) => undefined | Object | Promise<Object | undefined><FormData>'
    );

    const isDisabledProp = Prop.at(2);

    expect(isDisabledProp.prop('name')).toBe('isDisabled');
    expect(isDisabledProp.prop('required')).toBe(false);
    expect(isDisabledProp.prop('type')).toBe('boolean');
    expect(isDisabledProp.prop('defaultValue')).toBe('true');
    expect(isDisabledProp.prop('description')).toBe(
      `
When set the form and all fields will be disabled`
    );
  });
});
