import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  blog_url = "http://3ringprototype.com/blog";
  base_api_url = "http://3ringprototype.com/blog/wp-json";

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      page_ids_str: ""
    };
  }

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

  navItem( item ){
    var short_url = item.url.replace(this.blog_url, "");

    var ret_str = "\n\t<li><a href=\"" + short_url + "\">" + item.title + "</a>";

    if( item["child_items"] ){
      ret_str += "\n<ul>";
      for(let j in item["child_items"] ){
        ret_str += this.navItem( item["child_items"][j] );
      }
      ret_str += "\n</ul>";
    }

    ret_str += "</li>";

    return ret_str;
  }

  componentDidMount() {
    console.log( "this.state.page_ids_str = ", this.state.page_ids_str );

    let menu_fetch = this.ajaxLoadThen( "/menus/v1/menus/test-nav-1", (result) => {

      //getting the page ids to be list to collect from
      let page_id_arr = result.items.map((item) => {
        return item.child_items ?
        [item.object_id, item.child_items.map( (c_item) => c_item.object_id )] :
         item.object_id;
      });

      console.log( "page_id_arr = ", page_id_arr );

      let page_ids_str = page_id_arr.join();

      let page_ids_1Darr = page_ids_str.split(",");

      let new_state = this.state;

      new_state.page_ids_str = page_ids_str;

      let big_obj = {};

      for( let i=0; i<page_ids_1Darr.length; i++ ){
        big_obj[ "i_" + i + "_" + page_ids_1Darr[i] ] = {"content": "dog_feces"};
      }

      new_state.big_obj = big_obj;

      //get the navigation
      let nav_render = result.items.map( item => this.navItem( item ) );

      console.log( nav_render );

      this.setState( new_state );
    });


    menu_fetch.then(() => {
      console.log( "this = ", this );

      let pages_ep = "/wp/v2/pages?include=" + this.state.page_ids_str + "&order=asc&orderby=include";

      let pages_fetch = this.ajaxLoadThen(pages_ep, (result) => {
        console.log( "the result of pages = ", result );

        let new_state = this.state;

        new_state.isLoaded = true;
        new_state.items = result;

        this.setState( new_state );
      });
    });
  }

  render() {
    const { error, isLoaded, items } = this.state;
    console.log( "this.state = ", this.state );

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded || items.length < 1) {
      return <div>Loading...</div>;
    } else {
      console.log( items );

      return (
        <main>
          {items.map(item => (
            <section key={item.id}
            id={ item.title.rendered.replace(/\s/g, "-") }
            dangerouslySetInnerHTML={{
              __html: `<h2>${item.title.rendered}</h2>` + item.content.rendered
            }} >
            </section>
          ))}
        </main>
      );
    }
  }
}


export default App;
