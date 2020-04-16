import React from 'react';
import Modal from 'react-modal';

import Config from './Config';

function ThreeRingModal({showModal, handleCloseModal}){
  return (<Modal 
    isOpen={showModal}
    contentLabel="Minimal Modal Example"
    className="Modal"
    overlayClassName="Overlay"
  >
    <div className="modal-content">
      <div className="modal-header">
        <button type="button" className="close" data-dismiss="modal" 
          aria-label="Close" onClick={handleCloseModal}>
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
          data-dismiss="modal" onClick={handleCloseModal}>
          Got it
        </button>
      </div>
    </div>
  </Modal>);
}

export default ThreeRingModal;
