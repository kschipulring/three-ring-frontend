import React from 'react';
import Carousel from "react-elastic-carousel";
import Modal from 'react-modal';

import Config from './Config';
import CoreComponent from './CoreComponent';

export default class PortfoliosCaseStudies extends CoreComponent {
  constructor(props){
    super(props);

    this.state = {
      contents: "",
      modal_inner_html_array: [],
      showModal: false,
      currentIndex: 0,
      Carousel: {}
    };

    //WP REST API URL for the desired portfolio / gallery
    let url = `${Config.ep_portfolio}/${props.pfhub_id}`;

    this.ajaxLoadThen( url, (result) => {
      console.log( {result} );

      //the main HTML of the portfolio grid
      let contents = this.renderGalleryHTML( result );

      //the HTML for the portfolio modal
      let modal_inner_html_array = this.renderModalHTML( result );

      this.stateUpdate({contents, modal_inner_html_array});
    }, this);

    // This binding is necessary to make `this` work in the callback
    var bind_arr = ["handleCloseModal", "handleOpenModal", "handleThumbChange"];

    for( let i in bind_arr ){
      this[ bind_arr[i] ] = this[ bind_arr[i] ].bind(this);
    }
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

    //if this is not a .svg file, then get the wordpress filtered version of image URL.
    let fixed_urls = old_urls.map( i => {
      return i.includes(".svg")? i : i.replace(/http(s)?:\/\//i, "https://i0.wp.com/");
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
    let retval_contents = items.map( (item, key) => {
      let fixed_urls = this.itemFixedURLs(item);

      let [first_image] = fixed_urls;

      first_image += "?w=450";

      let element_id = "pfhub_portfolio_pupup_element_" + item.id;

      /* each on page gallery item is clickable - which opens the modal that 
      presents more about the gallery item. */
      return <li key={key} id={element_id} className={"portelement"}>
        <img src={first_image} alt={item.name} onClick={() => this.handleOpenModal(key)} />
        <h4>{item.name}</h4>
      </li>
    });

    return <ul>{retval_contents} {this.state.showModal}</ul>;
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
    var carousel_contents = this.state.modal_inner_html_array;

    return (
      <span>
        {this.state.contents}
      
        <Modal 
          isOpen={this.state.showModal}
          contentLabel="Case Study closeup"
          className="Modal"
          overlayClassName="Overlay"
          handleCloseModal={this.handleCloseModal} 
        >
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" 
                aria-label="Close" onClick={this.handleCloseModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Carousel ref={(ref) => (this.carousel = ref)}
                initialActiveIndex={this.state.currentIndex}>

                {carousel_contents}
              </Carousel>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary"
                data-dismiss="modal">
                xxx
              </button>
            </div>
          </div>
        </Modal>
      </span>
    );
  }
}
