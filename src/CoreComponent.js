import Config from './Config';
import React from 'react';

export default class CoreComponent extends React.Component {

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

  stateUpdate(prop){
    let new_state = { ...this.state, ...prop };
    
    this.setState(new_state);
  }
}
