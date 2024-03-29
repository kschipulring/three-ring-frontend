import React from 'react';

import ReactHtmlParser from 'react-html-parser';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useRouteMatch,
  Redirect
} from "react-router-dom";

import CoreComponent from './CoreComponent';

import Config from './Config';
import Utilities from './Utilities';
import NavBar from './NavBar';

import ReactiveForm from './ReactiveForm/index';

import PageFooter from './PageFooter';

import PortfolioCaseStudies from './PortfolioCaseStudies';

import Prerender from './Prerender';

import './App.scss';

class App extends CoreComponent {
  static current_page = "";

  mainPageRendered = false;
  portfolioRendered = false;

  constructor(props) {
    super(props);

    window.origin_pathname = window.location.pathname;

    console.log( "window.location.pathname = " + window.location.pathname );

    //boolean
    this.prerendered = props.prerendered;

    //possible pre-rendered navigation items. Otherwise, null.
    this.nav_items_json = props.nav_items_json;

    //the prerendered HTML, if it is available.
    this.main_html_str = props.main_html_str;

    //prerendered portfolio json, if it is available.
    this.portfolio_json = props.portfolio_json;

    //if the footer was prerendered. BOOLEAN.
    this.prerendered_footer = props.prerendered_footer;

    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      page_ids_str: "",
      showModal: false,
      nav_items: this.nav_items_json
    };

    // This binding is necessary to make `this` work in the callback
    var bind_arr = ["handleCloseModal", "handleOpenModal"];

    for( let i in bind_arr ){
      this[ bind_arr[i]] = this[ bind_arr[i]].bind(this);
    }
  }

  menuFetchAjaxSource(){
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

  componentDidMount() {
    //only update if this page has not been pre-rendered
    if( !this.prerendered ){
      this.menuFetchAjaxSource();
    }else{
      //remove extra unwanted header elements. First, grab all except the first of them.
      var hh = document.querySelectorAll("header.nav_header:not(:first-child)");

      hh.forEach( (item) => { item.remove() } );
    }

    //force scroll into view for when the page is not home, but is the first page someone is visiting (like from a shared link)
    if( window.origin_pathname.match(/[\w]/) && document.getElementById(window.origin_pathname) && window.scrollY < 500 ){
      document.getElementById(window.origin_pathname).scrollIntoView();
    }
  }

  /**
   * THE event handler for url routing in this app.  Really just scrolls to
   *  where the URL has a bookmark for.
   * @param {object} params - has a 'ready' method
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

  //really for the forms, mostly.
  handleOpenModal() {
    this.stateUpdate({showModal: true});
  }
  
  handleCloseModal() {
    this.stateUpdate({showModal: false});
  }

  //scrolls to where the associated content is, but only after that page content loads.
  pageScrollTo(){
    let element = document.getElementById( App.current_page );
  
    //scroll to the particular section of the page.
    if( element ){
      element.scrollIntoView({behavior: 'smooth'});
    }
  }

  shouldPreRender(checkObj) {
    if( !checkObj ){
      return;
    }
  
    if( checkObj.mainPageRendered ){
      this.mainPageRendered = true;
    }
  
    if( checkObj.portfolioRendered ){
      this.portfolioRendered = true;
    }
  
    //now do the pre-render now that both the main page and also the portfolio have loaded.
    if( this.mainPageRendered && this.portfolioRendered ){
      Prerender.writeHTMLPrerender();
    }
  }

  //handles for the hashbang nav: uses above method.
  componentDidUpdate(){
    this.pageScrollTo();

    //automated pre render
    if( this.state.isLoaded && window.c && window.c.length > 2 ){
      console.log( "Pre-rendering..." );

      //Prerender.writeHTMLPrerender();
      this.shouldPreRender({mainPageRendered: true});
    }
  }

  /**
   * To take an array of raw HTML items and return a filtered array of HTML
   *  items that works with React.
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

      let item_id = item.link.replace(Config.blog_url, "");

      let item_className =  item_id.replace(/[/|\\]/g, "");

      return (
        <article key={item.id} id={item_id} className={item_className}>
          { img_tag }

          <h2>{ Utilities.decodeEntities(item.title.rendered) }</h2>

          { this.pageItem(item.content.rendered, item.slug ) }
        </article>
      )
    })
  }

  pageItem( html_content, slug ){
    return ReactHtmlParser( html_content, {
      transform: (node, k) => {
        if( !["style", "script"].includes(node.name) ){
          node.slug = slug;

          return this.renderIfTag(node, k);
        }else{
          return <br key={k} />; //a blank nothingburger instead of annoying style tag.
        }
      }
    });
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
        case "button":
          //for prerendered version. Handling the non-working navbar bug only in prerendered version.
          return node.attribs.class.includes("nav_expander") ? "" : null;
        case "form":
          return <ReactiveForm {...node.attribs} key={k} k={k}
            onSubmitModal={this.handleOpenModal} children={node.children} />;
        case "pfhub-portfolio":
          //'this.portfolio_json' prerendered JSON from prerender cache
          return <PortfolioCaseStudies pfhub_id={node.attribs.pfhub_id} key={k}
            k={k} prerender-json={this.portfolio_json} onLoaded={this.handlePortfolioLoaded.bind(this)} />;
        default:
        break;
      }
    }
  }

  handlePortfolioLoaded(){
    //get the main portfolio element that is rendered some time after the main page. Find out how many children it has.
    var ppl = document.querySelectorAll( "pfhub-portfolio > *" );

    if( ppl.length > 0 ){
      this.shouldPreRender({portfolioRendered: true});
    }
  }

  renderInner(content, nav_items){
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

          <header className="nav_header">
            <NavBar id="main_nav" items={nav_items} burger_menu="true" />
          </header>

          {content}

          { /* to help with in prerendered situations to avoid 2 footers! */
            this.prerendered_footer ? null : (<PageFooter items={nav_items} />)
          }
        </Router>

        {/*for caching of navigation items when a page is prerendered from the chromedriver service */}
        <script className='structured-data-list' type="application/ld+json" id="nav_items_json">
          { JSON.stringify(nav_items) }
        </script>
      </main>
    );
  }

  render() {
    /* 'isLoaded' is a boolean. 'items' is an array of objects originally gleaned 
    from the Wordpress API. Each item is an individual page content. 'nav_items'
    is an array of objects also from WP API which contains data to populate the 
    navigation bar and also the footer section.
    */
    var { error, isLoaded, items, nav_items } = this.state;

    //the rendering of navigation menu and html to the page.
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if( this.prerendered ) {

      //prerendered content from the Chromedriver / Sellenium service.
      return this.renderInner( this.pageItem( this.main_html_str, "Three Ring Design" ), nav_items );
    } else if (!isLoaded || items.length < 1) {
      return <div>Loading...</div>;
    } else {

      //default renderer, no cache
      return this.renderInner(this.pageItems(items), nav_items);
    }
  }
}

export default App;
