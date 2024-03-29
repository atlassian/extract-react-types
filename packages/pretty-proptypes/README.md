# PrettyPropTypes

PrettyPropTypes is designed to display the output of
[extract-react-types](https://www.npmjs.com/package/extract-react-types). It is
designed to read the output from `extract-react-types`, and display rich prop
information for consumers.

## Core usage pattern

pretty-proptypes can display props from two sources.

- Using `babel-plugin-extract-react-types` and passing the component to `Props`

`.babelrc`

```json
{
  "plugins": ["babel-plugin-extract-react-types"]
}
```

```js
import MyCoolComponent from '../MyCoolComponent';

<Props heading="My Cool Component" component={MyCoolComponent} />;
```

- Directly passing a component's props to `Props` with `extract-react-types-loader` or getting types from `extract-react-types` and writing it to a file

```js
<Props
  heading="My Cool Component"
  props={require('!!extract-react-types-loader!../MyCoolComponent')}
/>
```

This analyses prop type definitions, and default props. It creates descriptions
from comments before the type definitions, and will render markdown syntax using [react-markings](https://www.npmjs.com/package/react-markings).

## Quick Tips

- Using [babel-plugin-extract-react-types](https://www.npmjs.com/package/babel-plugin-extract-react-types)
  is definitely the easiest way to get this information from your components, however
  you can use `extract-react-types-loader` or prebuild this data with `extract-react-types` and read it from a file if
  you prefer.
- When using `extract-react-types` directly or `extract-react-types-loader`, they will currently only look at the default export
  of a file. `babel-plugin-extract-types` will look at the default export as well as named exports.

## Customisation Props

### Heading

Display a heading for the collection of props. Pass in an empty string if you want
no heading, otherwise it defaults to "Props".

### shouldCollapseProps

Set whether the prop shapes should be shown by default, or whether they should
be hidden, and require being expanded.

### Components

Accepts an object that allows you to override particular style components within
our prop definition. The currently modifiable components are:

- Indent
- Outline
- Required
- Type
- StringType
- TypeMeta

Any that are not passed in will use the default component.

## Overrides

The `override` prop allows you to override a specific prop's definition. If you
want to keep the appearance aligned, we recommend using the `Prop` export from
PrettyPropType.

An override is invoked with all the props passed to the Prop component internally,
and renders the result. In the example below, we are changing the `type` field,
and stopping the shape component from appearing, while leaving other parts of the
component the same.

```js
import Props, { Prop } from 'pretty-proptypes'

${<Props
  heading=""
  props={require('!!extract-react-types-loader!../../PropTypes/Select')}
  overrides={{
    isACoolComponent: (props) => <Prop {...props} shapeComponent={() => null} type="All Components Object" /> }}
/>}
```

While you can pass style `components` directly to `Prop`, we recommend passing
style components in the top level Props, and letting them flow down.

## Custom layouts

In cases where a completely bespoke layout is required, use the `LayoutRenderer`. This component allows you to define a completely custom layout and substitute in your own UI.

The `renderTypes` prop is called for every prop found on a given component and allows you to specify how that type should be rendered.

If you don't want to override the default components, you can use the `components` property. Or import them directly from `pretty-proptypes`.

```js
import { LayoutRenderer } from 'pretty-proptypes';

<LayoutRenderer
  props={require('!!extract-react-types-loader!../MyCoolComponent')}
  renderTypes={({ typeValue, defaultValue, description, required, name, type, components }) => {
    <div>
      <h2>{name}</h2>
      <components.Description>{description}</components.Description>
      {required && <components.Required>Required</components.Required>}
      <components.Type>{type}</components.Type>
      <components.PropType typeValue={typeValue} />
    </div>;
  }}
/>;
```
