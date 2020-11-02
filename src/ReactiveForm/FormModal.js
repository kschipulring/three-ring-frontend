import React from 'react';
import Config from '../Config';
import ThreeRingModal from '../ThreeRingModal';

export default class FormModal extends React.Component{
  render(){
    let {showModal, handleCloseModal, contentLabel} = this.props;

    let contentFooterLabel = "Got it";

    return (
      <ThreeRingModal 
      isOpen={showModal}
      handleCloseModal={handleCloseModal}
      contentLabel={contentLabel}
      contentFooterLabel={contentFooterLabel}>
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
