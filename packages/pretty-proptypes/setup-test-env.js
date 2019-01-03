require('babel-register');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let jsDom = (new JSDOM(`...`)).window
global.window = jsDom.window;
global.document = window.document
global.navigator = window.navigator;
