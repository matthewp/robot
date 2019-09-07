import { html, Component, render } from './preact.js';

// Create your app
var name = 'hello';
const app = html`Testing ${name}`;

render(app, document.querySelector('main'));