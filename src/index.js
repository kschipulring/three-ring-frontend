import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import prerenderCache from './prerenderCache';

/* 
for handling pre-rendered pages. Must be done here and not in the App class, as
the special cached DOM elements will not exist after ReactDOM.render... fires 
*/
let my_props = prerenderCache();

//Renders the entire webpage, cached or regular
ReactDOM.render(<App {...my_props} />, document.getElementById('root'));

//TEST
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
