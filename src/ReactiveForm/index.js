import React from 'react';

import Config from '../Config';
import ReCAPTCHA from "react-google-recaptcha";

import { convertNodeToElement } from 'react-html-parser';

import InputTransform from './InputTransform';
import TextAreaTransform from './TextAreaTransform';
import SelectTransform from './SelectTransform';

import Modal from 'react-modal';

const TEST_SITE_KEY = "6Le5-T4UAAAAAL09DMkA6dffu36NsuFwg2a-Q5WC";

class ReactiveForm extends React.Component {
  constructor(props) {
    super(props);

    this.model = {
      recaptchaUsed: false
    };

    // This binding is necessary to make `this` work in the callback
    var barr = ['handleChange', 'recapHandleChange', 'handleSubmit', 'handleOpenModal', 'handleCloseModal'];

    //yes, karl is lazy, yet obsessed with efficiency
    for(let i in barr){
      this[barr[i]] = this[barr[i]].bind(this);
    }

    this.action = "";
  }

  handleOpenModal() {
    this.stateUpdate({showModal: true});
  }
  
  handleCloseModal() {
    this.stateUpdate({showModal: false});
  }

  handleSubmit(event, value) {
    event.preventDefault();

    let values = this.model;

    //just in case this form uses Recaptcha...
    values["g-recaptcha-response"] = values.recaptchaValue || "";

    var endpoint = this.action;

    //if this is a Contact Form 7 form...
    if( this.action.includes("#wpcf7") ){
      let fid = this.action.replace(/(.)*#wpcf7-f|-o(\w)+/g, "");

      endpoint = Config.base_api_url + 
      `/contact-form-7/v1/contact-forms/${fid}/feedback`;
    }

    var request = new XMLHttpRequest();
    // POST to httpbin which returns the POST data as JSON
    request.open('POST', endpoint, /* async = */ true);

    var formData = new FormData();

    for( let i in values ){
      formData.append(i, values[i] );
    }

    request.send(formData);
    console.log(request.response);
  }

  handleChange(event){
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.model[name] = value;

    console.log( this.model );
  }

  //only for when a recaptcha instance changes.
  recapHandleChange(value){
    this.model.recaptchaUsed = true;
    this.model.recaptchaValue = value;
  }

  renderIfTag(node, k){
    if (node.type === 'tag' ) {

      switch(node.name) {
        case "select":
          return SelectTransform(node, k, this.handleChange);
        case "input":
          return InputTransform(node, k, this.handleChange);
        case "textarea":
          return TextAreaTransform(node, k, this.handleChange);
        case "div":

          let retval = "";

          if( node.attribs.class === "wpcf7-form-control-wrap" ){
            retval = <ReCAPTCHA style={{ display: "inline-block" }}
              sitekey={TEST_SITE_KEY} key={k}
              onChange={this.recapHandleChange} />;
          }else{
            retval = convertNodeToElement(node, k);
          }

          return retval;
        default:
        break;
      }
    }
  };

  render(){
    let {props} = this;

    this.action = props.action;

    Modal.setAppElement('#root');

    return <form action={props.action} className={props.class || "" }
    id={props.id || ""} encType={props.enctype || ""} k={props.k} 
    onSubmit={this.handleSubmit}>
    {
      props.children.map(
        (item, k) => convertNodeToElement(item, k, (node, k) => {
          return this.renderIfTag(node, k);
        })
      )
    }
    </form>;
  }
}

export default ReactiveForm;
