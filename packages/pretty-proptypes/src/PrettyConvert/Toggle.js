// @flow
import React, { Component, type Node, type ElementRef } from 'react';

const Collapse = ({
  height,
  isCollapsed,
  innerRef,
  ...props
}: {
  height: number,
  isCollapsed: boolean,
  innerRef: ElementRef<*>
}) => (
  <div
    ref={innerRef}
    css={`
      height: ${isCollapsed ? 0 : `${height}px`};
      overflow: hidden;
      transition: height 260ms cubic-bezier(0.2, 0, 0, 1);
    `}
    {...props}
  />
);

type toggleProps = {
  beforeCollapse: (boolean, () => mixed) => Node,
  afterCollapse: (boolean, () => mixed) => Node,
  beginClosed: boolean,
  children: Node
};

type toggleState = {
  isCollapsed: boolean,
  contentHeight: number
};

export default class Toggle extends Component<toggleProps, toggleState> {
  static defaultProps = {
    beforeCollapse: () => null,
    afterCollapse: () => null,
    beginClosed: false,
    children: null
  };

  content: ?HTMLElement;

  constructor(props: toggleProps) {
    super(props);

    this.state = {
      isCollapsed: this.props.beginClosed,
      contentHeight: 0
    };
  }

  componentDidMount() {
    const contentHeight = this.content ? this.content.scrollHeight : 0;
    this.setState({ contentHeight });
  }

  componentWillReceiveProps() {
    const contentHeight = this.content ? this.content.scrollHeight : 0;
    if (contentHeight !== this.state.contentHeight) {
      this.setState({ contentHeight });
    }
  }

  getContent = (ref: ElementRef<*>) => {
    if (!ref) return;
    this.content = ref;
  };

  toggleCollapse = () => {
    const contentHeight = this.content ? this.content.scrollHeight : 0;
    this.setState({ contentHeight, isCollapsed: !this.state.isCollapsed });
  };

  render() {
    let { beforeCollapse, children, afterCollapse } = this.props;
    let { isCollapsed, contentHeight } = this.state;

    return (
      <div>
        {beforeCollapse(isCollapsed, this.toggleCollapse)}
        <Collapse
          isCollapsed={isCollapsed}
          duration={500}
          height={contentHeight}
          innerRef={this.getContent}
        >
          {children}
        </Collapse>
        {afterCollapse(isCollapsed, this.toggleCollapse)}
      </div>
    );
  }
}
