import React from 'react';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useRouteMatch,
  Redirect
} from "react-router-dom";

import Config from './Config';
import Utilities from './Utilities';
import NavBar from './NavBar';

import ReactiveForm from './ReactiveForm';

import './App.scss';

class App extends React.Component {
  static current_page = "";

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

    return fetch( Config.base_api_url + ep)
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

  componentDidMount() {
    //when the initial AJAX operation, for the nav menu occurs.
    let menu_fetch = this.ajaxLoadThen( Config.ep_nav, (result) => {

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
      let pages_ep = `${Config.ep_pages}${this.state.page_ids_str}`;

      this.ajaxLoadThen(pages_ep, (result) => {
        //console.log( "the result of pages = ", result );

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
  RouteHandle(params){
    let match = useRouteMatch();

    /* 
    hack for making the page scroll up to home if there are no characters in 
    the new route. (Like after when someone hits a '/home/' link, which 
    redirects to '/', but which would also not directly pertain to an element
    with the article that has the id of '/home/').
    */
    let mu = match.url.length > 1 ? match.url : "/home/";

    App.current_page = mu;

    params.ready();

    return "";
  }

  render() {
    const { error, isLoaded, items, nav_items } = this.state;

    //the rendering of navigation menu and html to the page.
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded || items.length < 1) {
      return <div>Loading...</div>;
    } else {
      var navClassName = this.state.menu_active ? "show" : "hide";

      return (
        <main>
          <Router>
            {/* A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. */}
            <Switch>
              <Redirect from='/home/' to='/' />
              <Route path="/:pageId?/:innerPageId?">
                <this.RouteHandle ready={ this.pageScrollTo } />
              </Route>
            </Switch>

            <button onClick={this.showMenu} className="nav_expander">
              <span className="default">_<br/>_<br/>_</span>
              <span className="expanded {navClassName}">X</span>
            </button>

            <NavBar id="main_nav" items={nav_items} navClassName={navClassName} />

            {items.map( (item) => {

              let img_url = item._embedded['wp:featuredmedia'] ?
                item._embedded['wp:featuredmedia'][0].source_url : "";

              let img_tag = img_url ?
              <img src={img_url} className="header-img"
              alt={item._embedded['wp:featuredmedia'][0].slug} /> : "";

              return (
                <article key={item.id} id={item.link.replace(Config.blog_url, "")}>
                  { img_tag }

                  <h2>{ Utilities.decodeEntities(item.title.rendered) }</h2>
                  {
                    ReactHtmlParser( item.content.rendered, {
                      transform: (node, k) => {
                        if (node.type === 'tag' ) {
                          switch(node.name) {
                            case "a":
                              return Utilities.a2LinkTransform(node, k);
                            case "form":
                              return <ReactiveForm {...node.attribs} key={k}
                              k={k} children={node.children} />;
                            default:
                            break;
                          }
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

  pageScrollTo(){
    let element = document.getElementById( App.current_page );
  
    //scroll to the particular section of the page.
    if( element ){
      element.scrollIntoView({behavior: 'smooth'});
    }
  }

  componentDidUpdate(){
    console.log( "component did update test" );

    this.pageScrollTo();
  }
}

export default App;
