import React from 'react';
import Carousel from "react-elastic-carousel";

import Config from './Config';
import CoreComponent from './CoreComponent';

import ThreeRingModal from './ThreeRingModal';

export default class PortfoliosCaseStudies extends CoreComponent {
  constructor(props){
    super(props);

    this.state = {
      contents: "",
      modal_inner_html_array: [],
      showModal: false,
      currentIndex: 0,
      Carousel: {},
      loaded: false,
      portfolio_json: {}
    };

    //if the page was pre-rendered
    if( props["prerender-json"] ){
      this.from_cache = true;
      this.prerender_json = props["prerender-json"];
    }else{
      //for regular loads without whole page caching
      this.portfolioJSONAjax2State(props);
    }

    // This binding is necessary to make `this` work in the callback
    var bind_arr = ["handleCloseModal", "handleOpenModal", "handleThumbChange"];

    for( let i in bind_arr ){
      this[ bind_arr[i] ] = this[ bind_arr[i] ].bind(this);
    }
  }

  componentDidMount() {
    //for page prerender cached loads. Must be done here, because in constructor, doing this yields an error.
    if( this.from_cache && !this.state.loaded ){
      this.portfolioJSON2State( this.prerender_json );
    }
  }

  portfolioJSONAjax2State(props){
    //WP REST API URL for the desired portfolio / gallery
    let url = `${Config.ep_portfolio}/${props.pfhub_id}`;

    this.ajaxLoadThen( url, (result) => {
      this.portfolioJSON2State(result);
    }, this);
  }

  portfolioJSON2State(portfolio_json){
    //the main HTML of the portfolio grid
    let contents = this.renderGalleryHTML( portfolio_json );

    //the HTML for the portfolio modal
    let modal_inner_html_array = this.renderModalHTML( portfolio_json );

    this.stateUpdate({contents, modal_inner_html_array, loaded: true, portfolio_json});

    //tell the main app that the portfolio is loaded
    this.props.onLoaded();
  }

  /**
   * Event Handler for whenever user opens a modal.
   *
   * @param {number} key - Sets the 'currentIndex' property of this components state.
   * This is used by the modal to determine which Carousel slide to currently show.
   */
  handleOpenModal(key=0){
    this.stateUpdate({showModal: true, currentIndex: key});
  }

  /**
   * Event Handler for whenever user closes a modal. Antonym of above.
   * @param {void}
   */
  handleCloseModal(){
    this.stateUpdate({showModal: false});
  }
 
  /**
   * Event Handler for whenever user clicks an image thumb within the carousel 
   * modal to make it the prime one within that particular portfolio project.
   *
   * @param {integer} item_id - the id of the portfolio piece from the Wordpress site.
   * @param {string} URL - the URL of the image that should be the main image 
   * within the currently shown project.
   */
  handleThumbChange(item_id, URL){
    //yes, lazy old school JS way, not 'React' way to change image source
    document.getElementById(`wd-cl-img1_${item_id}`).src = URL;
  }

  /**
  * Takes the list of images from one gallery item. Then cleans their URLs
  * and returns a modified image URL array for the gallery item.
  *
  * @param {object} item - gallery item.
  * @return {string[]} an array of URLs for a gallery item.
  */
  itemFixedURLs(item){
    //get the images per project.
    let old_urls = item.image_url.split(";");

    //remove empty entities
    old_urls = old_urls.filter((e) => { return true && e });

    //what is the main domain that the images come from?
    var base_url = "https://i0.wp.com/";

    /*
    if this is not a .svg file, or if it does not already have the base URL inside, 
    then get the wordpress filtered version of image URL.
    */
    let fixed_urls = old_urls.map( i => {
      return i.includes(".svg") || i.includes( base_url ) ? i : i.replace(/http(s)?:\/\//i, base_url);
    });

    return fixed_urls;
  }

  /**
  * The HTML content for the inside of the modal, which also happens to be 
  * the contents for the carousel. It is the same list of images as what 
  * appears on the regular page portion of Case Studies.
  *
  * @param {object[]} items - array of gallery objects.
  * Each item is an object containing the image information.
  * @return {jsx} the rendered HTML in JSX format.
  */
  renderModalHTML( items ){
    let retval_modal_contents = items.map( (item, key) => {
      //the image URLs for this project
      let fixed_urls = this.itemFixedURLs(item);

      //considered to be the primary image of a gallery portfolio item.
      let [first_image] = fixed_urls;

      /* possible image display sizes.  The first is for the modal carousel,
      the second is for thumbnail (only for inside of the modal carousel). */
      let [big, thumb] = ["?w=768", "?w=150"];

      first_image += big;

      let item_class = "pfhub-portfolio-popup-wrapper";

      return <div key={key} className={item_class} id={`${item_class}_${item.id}`}>
        <div className={`image-block_${item.id} image-block`}>
          <img alt={item.name} id={`wd-cl-img1_${item.id}`} src={first_image} />
        </div>
        
        <div className={"right-block"}>
          <h3 className={"title"}>{item.name}</h3>
          
          <ul className={"thumbs-list"} id={`thumbs-list_${item.id}`}>
            {fixed_urls.map((fixed_url, index) => { 
              let cn = index === this.state.currentIndex ? "active" : "";

              return (
                <li className={cn} key={index}>
                  <button onClick={() => this.handleThumbChange(item.id, fixed_url + big)}>
                    <img src={fixed_url + thumb} alt={item.name} />
                  </button>
                </li>
              )
            })}
          </ul>
          <div className={"description"}>{item.description}</div>
          <div className={"clear-both"}></div>
        </div>
        <div className={"clear-both"}></div>
      </div>
    });

    return retval_modal_contents;
  }

  /**
   * Generates the HTML content for the main part of the gallery which 
   * shows up on the page.
   *
   * @param {object[]} items - array of gallery objects. 
   * Each item is an object containing the image information.
   * @return {jsx} the rendered HTML in JSX format.
   */
  renderGalleryHTML( items ){
    let gallery_HTML_items = items.map( (item, key) => this.renderGalleryItem(item, key) );

    return <pfhub-portfolio>{gallery_HTML_items} {this.state.showModal}</pfhub-portfolio>;
  }

  //broken out from above for times when a new, individual portfolio item is needed.
  renderGalleryItem(item, key){
    let fixed_urls = this.itemFixedURLs(item);

    let [first_image] = fixed_urls;

    //append a max width URL parameter, but only if it does not have it already.
    first_image += /\?w=([0-9])+/.test(first_image) ? "" : "?w=450";

    let element_id = "pfhub_portfolio_pupup_element_" + item.id;

    /* each on page gallery item is clickable - which opens the modal that 
    presents more about the gallery item. */
    return <li key={key} id={element_id} className={"portelement"}>
      <img src={first_image} alt={item.name} onClick={() => this.handleOpenModal(key)} />
      <h4>{item.name}</h4>
    </li>
  }

  /**
   * Tells the carousel to go to the specified slide, specified by array index.
   * @param {integer} n - the slide number to go to.
   */
  goto(n) {
    this.carousel.goTo(n);
  }

  /**
   * Standard React Component method for display.
   */
  render(){
    //the carousel slides.  Goes into the modal directly.
    let {modal_inner_html_array: carousel_contents, contents, showModal, currentIndex} = this.state;

    return (
      <span>
        {contents}

        <ThreeRingModal 
          showModal={showModal}
          contentLabel="Case Study closeup"
          handleCloseModal={() => this.handleCloseModal()}
          contentFooterLabel=""
        >
          <Carousel ref={(ref) => (this.carousel = ref)}
            initialActiveIndex={currentIndex}>

            {carousel_contents}
          </Carousel>
        </ThreeRingModal>

        <script type="application/ld+json" id="portfolio_json">
          { JSON.stringify(this.state.portfolio_json) }
        </script>
      </span>
    );
  }
}
