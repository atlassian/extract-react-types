import React from 'react';
import Props from './Props';

export let ComponentProps = ({ component, ...props }) => {
  return (
    <Props
      {...props}
      props={{
        type: 'program',
        component: component.___types
      }}
    />
  );
};
