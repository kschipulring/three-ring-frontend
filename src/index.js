import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

let prerendered = false;
let nav_items_json = null;
let portfolio_json = null;
let main_html_str = null;

if( document.getElementById("footer_nav") && document.getElementById("footer_nav").innerHTML ) {
  prerendered = true;

  //for the navigation links used by both the menu and the footer
  let json_str = document.getElementById("nav_items_json").innerHTML || null;
  nav_items_json = JSON.parse(json_str);

  //for the portfolio items. This is needed to make the modal features work properly with prerendered content.
  let json_portfolio_str = document.getElementById("portfolio_json").innerHTML || null;
  portfolio_json = JSON.parse(json_portfolio_str);

  //for the prerendered html originally from chromedriver via the build/prerender.html file.
  main_html_str = document.getElementsByTagName("main")[0].outerHTML || null;
}

let my_props = {prerendered, main_html_str, nav_items_json, portfolio_json};

//Renders the entire webpage, cached or regular
ReactDOM.render(<App {...my_props} />, document.getElementById('root'));

//TEST
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
