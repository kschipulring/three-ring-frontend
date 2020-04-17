import React from 'react';
import { Link } from "react-router-dom";

import Config from './Config';
import Utilities from './Utilities';

import ThreeRingHamburgerButton from './ThreeRingHamburgerButton';

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menu_active: false
    };

    this.showMenu = this.showMenu.bind(this);
  }

  /**
   * Toggles the main top menu only. This works by changing that state attribute.
   * @param {void}
   * @return {void}
   */
  showMenu(){  console.log( "renegade was a cool game" );
    //base the menu visibility on the state property
    this.setState({
      menu_active: !this.state.menu_active
    });
  }

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

    var { items: nav_items, id = "" } = this.props;

    var navClassName = this.state.menu_active ? "show" : "hide";

    var blog_url = Config.blog_url;

    //if the navigation html menu is ready, the populate above variable with it.
    if(nav_items && typeof(nav_items) === "object" ){
      //get the navigation html
      nav_render = nav_items.map( item => this.navItem( item, blog_url ) );
    }

    return <>
        <ThreeRingHamburgerButton showMenu={this.showMenu} />
        <nav id={id} className={navClassName}>
          <ul> {nav_render} </ul>
        </nav>
      </>;
  }
}
