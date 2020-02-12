import React from 'react';
import Modal from 'react-modal';

export default class ModalHandler extends React.Component{
  handleOpenModal() {
    this.stateUpdate({showModal: true});
  }
  
  handleCloseModal() {
    this.stateUpdate({showModal: false});
  }

  render(){
    return (
      <React.Fragment>
        <button onClick={this.handleOpenModal}>Trigger Modal</button>
        <Modal 
          isOpen={this.props.showModal}
          contentLabel="Minimal Modal Example"
        >
          <button onClick={this.handleCloseModal}>Close Modal</button>
        </Modal>
      </React.Fragment>
    );
  }
}