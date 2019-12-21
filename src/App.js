import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch
} from "react-router-dom";

import Utilities from './Utilities.js';
//import NavBar from './NavBar.js';

import './App.scss';

class App extends React.Component {
  blog_url = "http://3ringprototype.com/blog";
  base_api_url = `${this.blog_url}/wp-json`;

  ep_nav = "/menus/v1/menus/test-nav-1";
  ep_pages = "/wp/v2/pages?order=asc&_embed&orderby=include&include=";

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      page_ids_str: "",
      menu_active: false
    };

    // This binding is necessary to make `this` work in the callback
    this.showMenu = this.showMenu.bind(this);
  }

  /**
   * Universal middleware function for AJAX functions.
   * @param {string} ep - URL endpoint.
   * @param {function} curry_func - URL endpoint.
   * @return {void}
   */
  ajaxLoadThen( ep, curry_func ){

    return fetch( this.base_api_url + ep)
    .then(res => res.json())
    .then(
      (result) => {
        curry_func( result );
      },

      /*
      Note: it's important to handle errors here
      instead of a catch() block so that we don't swallow
      exceptions from actual bugs in components.
      */
      (error) => {

        let new_state = this.state;

        new_state.isLoaded = true;
        new_state.error = error;
        
        this.setState( new_state );    
      }
    );
  }

  /**
   * Returns an individual navigation item in jsx html from a nav item object.
   * @param {object} item - navigation item source object.
   * @return {object<jsx>} - an individual navigation html in jsx format
   */
  navItem( item ){
    var short_url = item.url.replace(this.blog_url, "");

    var return_jsx = [];

    return_jsx.push( <Link to={short_url} key={item.ID}>{
      Utilities.decodeEntities( item.title )
    }</Link> );

    if( item["child_items"] ){
      for(let j in item["child_items"] ){

        return_jsx.push(
          <ul key={item["child_items"][j].ID}>
            { this.navItem( item["child_items"][j]) }
          </ul>
        );        
      }
    }

    return <li key={item.ID}>{return_jsx}</li>;
  }

  componentDidMount() {
    //when the initial AJAX operation, for the nav menu occurs.
    let menu_fetch = this.ajaxLoadThen( this.ep_nav, (result) => {

      //getting the page ids to be list to collect from
      let page_id_arr = result.items.map((item) => {
        return item.child_items ?
        [item.object_id, item.child_items.map( (c_item) => c_item.object_id )] :
         item.object_id;
      });
      
      //flatten the array into a one dimensional array with 2 steps.
      let page_ids_str = page_id_arr.join();

      //to update the core state.
      let new_state = this.state;

      //attach the ids list to the state
      new_state.page_ids_str = page_ids_str;

      //get the nav items to the state
      new_state.nav_items = result.items;

      this.setState( new_state );
    });

    /*
    now that the final list of page IDs have been retrieved, get all their
    associated pages with their HTML content.
    */
    menu_fetch.then(() => {
      let pages_ep = `${this.ep_pages}${this.state.page_ids_str}`;

      this.ajaxLoadThen(pages_ep, (result) => {
        console.log( "the result of pages = ", result );

        let new_state = this.state;

        new_state.isLoaded = true;
        new_state.items = result;

        this.setState( new_state );
      });
    });
  }

  /**
   * Toggles the main top menu only. This works by changing that state attribute.
   * @param {void}
   * @return {void}
   */
  showMenu(){
    //base the menu visibility on the state property
    let new_state = this.state;

    new_state.menu_active = !this.state.menu_active;

    this.setState(new_state);
  }

  /**
   * THE event handler for url routing in this app.  Really just scrolls to
   *  where the URL has a bookmark for.
   * @param {void}
   * @return {object<jsx>} - the html which outputs. Not really needed except for testing.
   */
  RouteHandle(){
    let match = useRouteMatch();

    let element = document.getElementById( match.url );
  
    //scroll to the particular section of the page.
    if( element ){
      element.scrollIntoView({behavior: 'smooth'});
    }
    
    return <h2>current route test: {match.url}</h2>;
  }

  render() {
    const { error, isLoaded, items, nav_items } = this.state;

    var nav_render = "";
    
    //if the navigation html menu is ready, the populate above variable with it.
    if(nav_items && typeof(nav_items) === "object" ){
      //get the navigation html
      nav_render = nav_items.map( item => this.navItem( item ) );
    }

    //the rendering of navigation menu and html to the page.
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded || items.length < 1) {
      return <div>Loading...</div>;
    } else {
      console.log( {items} );

      var navClassName = this.state.menu_active ? "show" : "hide";

      return (
        <main>
          <Router>
            {/* A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. */}
            <Switch>
              <Route path="/:pageId?/:innerPageId?">
                <this.RouteHandle />
              </Route>
            </Switch>

            <button onClick={this.showMenu} className="nav_expander">
              <span className="default">_<br/>_<br/>_</span>
              <span className="expanded {navClassName}">X</span>
            </button>
            <nav id="main_nav" className={navClassName}>
              <ul> {nav_render} </ul>
            </nav>
            {items.map( (item) => {

              let img_url = item._embedded['wp:featuredmedia'] ?
                  item._embedded['wp:featuredmedia'][0].source_url : "";

              let img_tag = img_url ?
              <img src={img_url} className="header-img"
              alt={item._embedded['wp:featuredmedia'][0].slug} /> : "";

              return (
                <article key={item.id}
                id={ item.link.replace(this.blog_url, "") }>
                  { img_tag }

                  <h2>{ Utilities.decodeEntities(item.title.rendered) }</h2>

                  {
                    ReactHtmlParser( item.content.rendered, {
                      transform: (node, k) => {
                        if (node.type === 'tag' && node.name === 'a') {
                          return Utilities.a2LinkTransform(node, k);
                        }
                      }
                    })
                  }
                </article>
              )
            }
            )}
          </Router>
        </main>
      );
    }
  }
}

export default App;
