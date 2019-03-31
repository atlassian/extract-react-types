import React, { Component, Fragment } from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import PrettyProps from 'pretty-proptypes';
import ert from 'extract-react-types';
import './style.css';
import * as uriUtils from './utils/uriUtils';

const STARTING_CODE = {
  code: `type ButtonPropType = {
    /* This is*/
  label: string
}
class Button extends React.Component<ButtonPropType>{
}`,
  typeSystem: 'flow'
};

class App extends Component {
  state = {
    code:
      uriUtils.parseQuery().code_lz !== undefined
        ? uriUtils.decompress(uriUtils.parseQuery().code_lz)
        : STARTING_CODE.code,
    dataForPropTypes: ert(STARTING_CODE.code, STARTING_CODE.typeSystem),
    typeSystem: STARTING_CODE.typeSystem,
    error: null
  };

  updateCode = code => {
    try {
      const ast = ert(code, this.state.typeSystem);
      this.setState({
        dataForPropTypes: ast,
        error: null
      });
      uriUtils.updateQuery({ code: uriUtils.compress(code) });
    } catch (error) {
      this.setState({
        error
      });
      window.error = error;
    }
  };

  handleSelectChange = event => {
    this.setState(
      {
        typeSystem: event.target.value
      },
      () => this.updateCode(this.state.code)
    );
  };

  render() {
    const { code, dataForPropTypes, error } = this.state;
    return (
      <Fragment>
        <div className="container">
          <div className="block">
            <CodeMirror
              style={{ height: '100%' }}
              value={code}
              options={{ lineNumbers: true }}
              onChange={this.updateCode}
            />
          </div>
          <div className="block proptypes">
            {dataForPropTypes && <PrettyProps className="block" props={dataForPropTypes} />}
          </div>
        </div>
        {error && <pre className="error-container">{error.stack}</pre>}
      </Fragment>
    );
  }
}

export default App;
