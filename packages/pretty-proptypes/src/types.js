// @flow
import type { Components } from './components';

export type Kind = any;

export type CommonProps = {
  defaultValue?: string,
  description?: string,
  required: boolean,
  deprecated?: boolean,
  name: string,
  typeValue: Kind,
  type: string,
  shouldCollapse?: boolean,
  components: Components,
  // name of the component being rendered
  componentDisplayName: string
};
