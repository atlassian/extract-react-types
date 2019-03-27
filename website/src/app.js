import React from 'react';
import ReactDOM from 'react-dom';

const App = () => <div>Hello World!</div>;

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

ReactDOM.render(<App />, document.getElementById('root'));
