// @flow
import type { Components } from './components';

export type Kind = any;

export type CommonProps = {
  defaultValue?: string,
  description?: string,
  required: boolean,
  name: string,
  typeValue: Kind,
  type: string,
  shouldCollapse?: boolean,
  components: Components
};
