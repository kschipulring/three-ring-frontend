import React from 'react';
import Modal from 'react-modal';

export default function ThreeRingModal(props){
  let {showModal, handleCloseModal, contentLabel, children, contentFooterLabel="Got it"} = props;

  return (<Modal 
    isOpen={showModal}
    contentLabel={contentLabel}
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
      <div className="modal-body"> {children} </div>
      <div className="modal-footer">
        {contentFooterLabel &&
          <button type="button" className="btn btn-primary"
            data-dismiss="modal" onClick={handleCloseModal}>
            {contentFooterLabel}
          </button>
        }
      </div>
    </div>
  </Modal>);
}
