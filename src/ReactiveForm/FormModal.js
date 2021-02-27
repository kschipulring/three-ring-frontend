import React from 'react';
import Config from '../Config';
import ThreeRingModal from '../ThreeRingModal';
import CoreComponent from '../CoreComponent';

export default class FormModal extends CoreComponent{
  constructor(props){
    super(props);

    this.props = props;

    // This binding is necessary to make `this` work in the callback
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  /**
   * Event Handler for whenever user closes a modal. Antonym of above.
   * @param {void}
   */
  handleCloseModal(){
    this.props.stateUpdate({showModal: false});
  }

  render(){
    return (
      <ThreeRingModal 
        {...this.props}
        contentFooterLabel={"Got it"}
        handleCloseModal={() => this.handleCloseModal()}
      >
        <img alt="Three Ring Design" className="modal-logo"
          src={Config.cloud_uploads_url + "2019/12/02234111/three_ring_logo.svg"}
        />
        <br/>
        <h2 className="modal-title">
          Thanks for <br/>getting in touch.
        </h2>
        <p>We shall reply to you shortly.</p>
      </ThreeRingModal>
    );
  }
}
