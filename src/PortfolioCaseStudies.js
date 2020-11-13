import Config from './Config';
import React from 'react';

import Carousel from "react-elastic-carousel";

import CoreComponent from './CoreComponent';

import Modal from 'react-modal';

export default class PortfoliosCaseStudies extends CoreComponent {
  constructor(props){
    super(props);

    this.state = {
      contents: "",
      lightbox_contents: "",
      modal_inner_html_array: [],
      showModal: false,
      currentIndex: 0,
      Carousel: {}
    };

    let url = Config.ep_portfolio + "/" + props.pfhub_id;

    this.ajaxLoadThen( url, (result) => {
      console.log( {result} );

      //the main HTML of the portfolio grid
      let contents = this.renderGalleryHTML( result );

      //the HTML for the portfolio modal
      let modal_inner_html_array = this.renderModalHTML( result );

      this.stateUpdate({contents, modal_inner_html_array});
    }, this);

    // This binding is necessary to make `this` work in the callback
    var bind_arr = ["handleCloseModal", "handleOpenModal"];

    for( let i in bind_arr ){
      this[ bind_arr[i]] = this[ bind_arr[i]].bind(this);
    }
  }
  
  stateUpdate(prop){
    let new_state = { ...this.state, ...prop };
    
    this.setState(new_state);
  }

  handleOpenModal(image_wpid, key=0){
    this.stateUpdate({showModal: true, currentIndex: key});

    //make the Alice Carousel go elsewhere
    //this.Carousel.slideTo( key );

    console.log( image_wpid, key, this.state, this.Carousel );
  }

  handleCloseModal(){
    this.stateUpdate({showModal: false});
  }

  itemFixedURLs(item){
    //get the images per project.
    let old_urls = item.image_url.split(";");

    //remove empty entities
    old_urls = old_urls.filter((e) => { return true && e });

    //if this is not a .svg file, then get the wordpress filtered version.
    let fixed_urls = old_urls.map( i => {
      return i.includes(".svg")? i : i.replace(/http(s)?:\/\//i, "https://i0.wp.com/");
    });

    return fixed_urls;
  }

  renderModalHTML( items ){
    let retval_modal_contents = items.map( (item, key) => {
      //the image URLs
      let fixed_urls = this.itemFixedURLs(item);

      let [first_image] = fixed_urls;

      let [big, thumb] = ["?w=768", "?w=150"];

      first_image += thumb;

      console.log( {fixed_urls, first_image} );

      let item_class = "portelement portelement_" + item.id;

    
      return <div key={key} className={item_class}>
        <img src={first_image} alt={item.name} />
        <h4>{item.name}</h4>
      </div>
    });

    console.info( {retval_modal_contents} );

    return retval_modal_contents;
  }


  renderModalHTMLOld( items ){
    let retval_modal_contents = items.map( (item, key) => {

      //the image URLs
      let fixed_urls = this.itemFixedURLs(item);

      let [first_image] = fixed_urls;

      let [big, thumb] = ["?w=768", "?w=150"];

      first_image += thumb;

      console.log( {fixed_urls, first_image} );

      //let item_class = "portelement portelement_" + item.id;

    /*
    return <div key={key} className={item_class}>
      <img src={first_image} alt={item.name} />
      <h4>{item.name}</h4>
    </div>*/

    console.log( "this.state.currentIndex = ", this.state.currentIndex );

    return <div className={"pfhub-portfolio-popup-wrapper pfhub-portfolio-popup-wrapper_2"} key={key}>
        <div className={"image-block_2 image-block"}>
          <img alt={item.name} id="wd-cl-img1" src={first_image} />
        </div>
        <div className={"right-block"}>
          <h3 className={"title"}>{item.name}</h3>
          <div>
          <ul className={"thumbs-list thumbs-list_2"}>

            {fixed_urls.map((fixed_url, index) => { 
              let cn = index === this.state.currentIndex ? "active" : "";

              return (
              <li className={cn} key={index}>
                <a href={fixed_url} className={"img-thumb"} title={item.name}>
                  <img src={fixed_url + big} alt={item.name} />
                </a>
              </li>
            )})}


          </ul>
        </div>
        <div className={"description"}>{item.description}</div>
        <div className={"clear-both"}></div>
      </div>
      <div className={"clear-both"}></div>
    </div>
    });

    console.log( {retval_modal_contents} );

    return retval_modal_contents;
  }

  renderGalleryHTML( items ){
    let retval_contents = items.map( (item, key) => {
      let fixed_urls = this.itemFixedURLs(item);

      let [first_image] = fixed_urls;

      first_image += "?w=450";

      console.log( {first_image} );

      let element_id = "pfhub_portfolio_pupup_element_" + item.id;

      return <li key={key} id={element_id} className="portelement">
        <img src={first_image} alt={item.name} onClick={() => this.handleOpenModal(item.id, key)} />
        <h4>{item.name}</h4>
      </li>
    });

    return <ul>{retval_contents} {this.state.showModal}</ul>;
  }


  slideTo = (i) => this.setState({ currentIndex: i });

  onSlideChanged = (e) => this.setState({ currentIndex: e.item });

  slideNext = () => this.setState({ currentIndex: this.state.currentIndex + 1 });

  slidePrev = () => this.setState({ currentIndex: this.state.currentIndex - 1 });

  goto(n) {
    this.carousel.goTo(n);
  }

  render(){
    var carousel_contents = this.state.modal_inner_html_array; //this.state.currentIndex

    const items = [
      <img alt="a" src="https://i0.wp.com/threering-media.s3.amazonaws.com/blog/wp-content/uploads/2020/04/19193624/palma.jpg?w=150" />,
      <img alt="b" src="http://threering-media.s3.amazonaws.com/blog/wp-content/uploads/2019/12/13113020/MTA_NYC_logo.svg?w=150" />,
      <img src="https://i0.wp.com/threering-media.s3.amazonaws.com/blog/wp-content/uploads/2020/04/19200127/puppy-image.jpg?w=150"
        alt="Puppies Of Westport" />,
    ];

    return (
      <span>
        {this.state.contents}
      
        <Modal 
          isOpen={this.state.showModal}
          contentLabel="lee enfield"
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
              <button onClick={() => this.carousel.slidePrev()}>Prev</button>
              <button onClick={() => this.carousel.slideNext()}>Next</button>
              <hr />
              <Carousel ref={(ref) => (this.carousel = ref)}
                initialActiveIndex={this.state.currentIndex}>

                {items.map(item => <div>{item}</div>)}
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