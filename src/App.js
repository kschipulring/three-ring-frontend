import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import logo from './logo.svg';
import './App.css';

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
      page_ids_str: ""
    };
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
   * @param {object} item - URL endpoint.
   * @return {object<jsx>} - an individual navigation html in jsx format
   */
  navItem( item ){
    var short_url = item.url.replace(this.blog_url, "");

    var return_jsx = [];

    return_jsx.push( <a href={short_url} key={item.ID}>{item.title}</a> );

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

      new_state.page_ids_str = page_ids_str;

      let big_obj = {};

      for( let i=0; i<page_ids_1Darr.length; i++ ){
        big_obj[ `i_${i}_` + page_ids_1Darr[i] ] = {"content": "this_is_a_test"};
      }

      new_state.big_obj = big_obj;

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

  render() {
    const { error, isLoaded, items, nav_items } = this.state;
    console.log( "this.state = ", this.state );

    var nav_render = "";
    
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

      return (
        <main>
          {nav_render}
          {items.map(item => (
            <section key={item.id} id={ item.title.rendered.replace(/\s/g, "-") } >
            {
              ReactHtmlParser(`<h2>${item.title.rendered}</h2>${item.content.rendered}`)
            }
            </section>
          ))}
        </main>
      );
    }
  }
}

export default App;
