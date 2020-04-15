import React from 'react';
//import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import ReactHtmlParser from 'react-html-parser';
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

import ReactiveForm from './ReactiveForm/index';

import './App.scss';

class App extends React.Component {
  static current_page = "";

  stateUpdate(prop){
    let new_state = { ...this.state, ...prop };
    
    this.setState(new_state);
  }

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      page_ids_str: "",
      menu_active: false,
      showModal: false
    };

    //
    this.subtitle = null;

    // This binding is necessary to make `this` work in the callback
    var bind_arr = ["showMenu", "handleCloseModal", "handleOpenModal"];

    for( let i in bind_arr ){
      this[ bind_arr[i]] = this[ bind_arr[i]].bind(this);
    }
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
        this.stateUpdate({isLoaded: true, error});
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

      //attach the ids list and the nav items to the state 
      this.stateUpdate({page_ids_str, nav_items: result.items});
    });

    /*
    now that the final list of page IDs have been retrieved, get all their
    associated pages with their HTML content.
    */
    menu_fetch.then(() => {
      let pages_ep = `${Config.ep_pages}${this.state.page_ids_str}`;

      this.ajaxLoadThen(pages_ep, (items) => {
        this.stateUpdate({isLoaded: true, items});
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
    this.stateUpdate({menu_active: !this.state.menu_active});
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

  handleOpenModal() {
    this.stateUpdate({showModal: true});
  }
  
  handleCloseModal() {
    this.stateUpdate({showModal: false});
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

  /**
   * To take an array of raw HTML items and return a filtered array of HTML items that works with React.
   * @param {array} items - the array of page items. Each item is in HTML format.
   * @return {array} - filtered array of page items.
   */
  pageItems(items){
    return items.map( (item) => {

      let img_url = item._embedded['wp:featuredmedia'] ?
        item._embedded['wp:featuredmedia'][0].source_url : "";

      let img_tag = img_url ?
      <img src={img_url} className="header-img"
      alt={item._embedded['wp:featuredmedia'][0].slug} /> : "";

      item.content.rendered = item.content.rendered.replace( "<h7", "<h6" );

      return (
        <article key={item.id} id={item.link.replace(Config.blog_url, "")}>
          { img_tag }

          <h2>{ Utilities.decodeEntities(item.title.rendered) }</h2>

          {
            ReactHtmlParser( item.content.rendered, {
              transform: (node, k) => {
                return this.renderIfTag(node, k);
              }
            })
          }
        </article>
      )
    })
  }

  //TODO
  onSubmitModal(){
    console.log("test submit ");
  }

  /**
   * handle for when an HTML item is an 'a' tag or a form tag.
   * @param {HTMLElement} node 
   * @param {number} k - for a unique element key.  React complains otherwise.
   * @return {HTMLElement} - post filtering
   */
  renderIfTag(node, k){
    if (node.type === 'tag' ) {
      switch(node.name) {
        case "a":
          return Utilities.a2LinkTransform(node, k);
        case "form":
          let attribs = node.attribs;

          console.log( {attribs} );

          return <ReactiveForm {...node.attribs} key={k} onSubmitModal={this.handleOpenModal}
          k={k} children={node.children} />;
        default:
        break;
      }
    }
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

            <Modal 
              isOpen={this.state.showModal}
              contentLabel="Minimal Modal Example"
              className="Modal"
              overlayClassName="Overlay"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" 
                    aria-label="Close" onClick={this.handleCloseModal}>
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <img alt="Three Ring Design" className="modal-logo"
                    src={Config.cloud_uploads_url + "2019/12/02234111/three_ring_logo.svg"}
                    />
                  <br/>
                  <h2 className="modal-title">
                    Thanks for <br/>getting in touch.
                  </h2>
                  <p>We shall reply to you shortly.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary"
                    data-dismiss="modal" onClick={this.handleCloseModal}>
                    Got it
                  </button>
                </div>
              </div>
            </Modal>

            {this.pageItems(items)}
          </Router>
        </main>
      );
    }
  }
}

export default App;
