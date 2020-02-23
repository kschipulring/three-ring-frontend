import React from 'react';
import { Link } from "react-router-dom";

import Config from './Config';
import Utilities from './Utilities';

export default class NavBar extends React.Component {
  /**
   * Returns an individual navigation item in jsx html from a nav item object.
   * @param {object} item - navigation item source object.
   * @return {object<jsx>} - an individual navigation html in jsx format
   */
  navItem( item, blog_url = "" ){
    var short_url = item.url.replace(Config.blog_url, "");

    var return_jsx = [];

    return_jsx.push( <Link to={short_url} key={item.ID}>{
      Utilities.decodeEntities( item.title ) }</Link> );

    if( item.child_items ){
      for(let j in item.child_items ){

        return_jsx.push(
          <ul key={item.child_items[j].ID}>
            { this.navItem( item.child_items[j], blog_url) }
          </ul>
        );
      }
    }

    return <li key={item.ID}>{return_jsx}</li>;
  }

  render(){
    var nav_render = "";

    var { items: nav_items, id = "", navClassName = "" } = this.props;

    var blog_url = Config.blog_url;

    //if the navigation html menu is ready, the populate above variable with it.
    if(nav_items && typeof(nav_items) === "object" ){
      //get the navigation html
      nav_render = nav_items.map( item => this.navItem( item, blog_url ) );
    }

    return <nav id={id} className={navClassName}>
      <ul> {nav_render} </ul>
    </nav>;
  }
}
