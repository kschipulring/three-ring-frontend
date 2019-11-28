import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import logo from './logo.svg';
import './App.scss';

class App extends React.Component {
  blog_url = "http://3ringprototype.com/blog";
  base_api_url = `${this.blog_url}/wp-json`;

  ep_nav = "/menus/v1/menus/test-nav-1";
  ep_pages = "/wp/v2/pages?order=asc&orderby=include&include=";

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
   * To get rid of annoying html entities and replace them with what they are supposed to render as.
   * @param {string} html - the source html.
   * @return {string} - the processed html.
   */
  decodeEntities(html) {
    var cache = {},
        character,
        e = document.createElement('div');

    return html.replace(/([&][^&; ]+[;])/g, function(entity) {
      character = cache[entity];
      if (!character) {
        e.innerHTML = entity;
        if (e.childNodes[0]){
          character = cache[entity] = e.childNodes[0].nodeValue;
        } else{
          character = '';
        }
      }
      return character;
    });
  }


  /**
   * Returns an individual navigation item in jsx html from a nav item object.
   * @param {object} item - navigation item source object.
   * @return {object<jsx>} - an individual navigation html in jsx format
   */
  navItem( item ){
    var short_url = item.url.replace(this.blog_url, "");

    var return_jsx = [];

    return_jsx.push( <a href={short_url} key={item.ID}>{
      this.decodeEntities( item.title )
    }</a> );

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

      //the final page id array
      let page_ids_1Darr = page_ids_str.split(",");

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
      console.log( "this = ", this );

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

  showMenu(){
    //base the menu visibility on the state property
    let new_state = this.state;

    new_state.menu_active = !this.state.menu_active;

    this.setState(new_state);
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
      console.log( items );

      var navClassName = this.state.menu_active ? "show" : "hide";

      return (
        <main>
          <button onClick={this.showMenu} className="nav_expander">
            <span className="default">_<br/>_<br/>_</span>
            <span className="expanded {navClassName}">X</span>
          </button>
          <nav className={navClassName}>
            <ul>
            {nav_render}
            </ul>
          </nav>
          {items.map(item => (
            <section key={item.id} id={ item.title.rendered.toLowerCase().replace(/\s/g, "-") } >
            {
              ReactHtmlParser(
                `<h2>${item.title.rendered}</h2>${item.content.rendered}`
              )
            }
            </section>
          ))}
        </main>
      );
    }
  }
}

export default App;
