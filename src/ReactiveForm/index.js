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

    this.onSubmitModal = props.onSubmitModal;

    this.model = {
      recaptchaUsed: false
    };

    this.fields_valid = false;

    //a fallback for when the form element does not have an id
    this.form_id = Math.random().toString(36).substring(2, 15) 
      + Math.random().toString(36).substring(2, 15);;

    this.state = {
      form_valid: false
    };

    // This binding is necessary to make `this` work in the callback
    var barr = ['handleChange', 'recapHandleChange', 'handleSubmit', 'resetForm'];

    //yes, karl is lazy, yet obsessed with efficiency
    for(let i in barr){
      this[barr[i]] = this[barr[i]].bind(this);
    }

    this.action = "";
  }

  handleSubmit(event, value) {
    event.preventDefault();

    let values = this.model;

    //where form gets submitted to.
    var endpoint = this.action;

    //if this is a Contact Form 7 form...
    if( this.action.includes("#wpcf7") ){
      let fid = this.action.replace(/(.)*#wpcf7-f|-o(\w)+/g, "");

      //this changes the action URL to that which works from the WP Rest API.
      endpoint = Config.base_api_url + 
      `/contact-form-7/v1/contact-forms/${fid}/feedback`;
    }

    var XHR = new XMLHttpRequest();
    // POST to httpbin which returns the POST data as JSON
    XHR.open('POST', endpoint, /* async = */ true);

    XHR.onload = () => {
      console.log( {XHR} );

      if (XHR.status >= 200 && XHR.status < 400) {
        //happy message for successful form submitters
        this.onSubmitModal();

        //standard javascript form reset.
        document.querySelector("#"+this.form_id).reset();

        console.log( "XHR.responseText = ", XHR.responseText );
      } 
    };

    var formData = new FormData();

    for( let i in values ){
      formData.append(i, values[i] );
    }

    //send the form data.
    XHR.send(formData);
  }

  /* only covers changes of main form elements, not recaptcha... 'target' is the
   html element that just got changed. */
  handleChange({target}){
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    //used by the submission function
    this.model[name] = value;

    this.areFieldsValid(target.form);
  }

  areFieldsValid(form){
    //which of these form elements are required?
    let tfe = [...form.elements].filter(e => e.required);

    //which of the filtered form elements from above that are required are also valid.
    let tfev = tfe.filter(e => e.validity.valid);

    //are all required fields valid?
    let teq = ( tfe.length === tfev.length );

    //This will be one of two approvals for the form to be officially ready to submit.
    this.fields_valid = teq;

    this.formReadyToSubmit();
  }

  //only for when a recaptcha instance changes.
  recapHandleChange(value){
    //...second of two approvals for the form to be officially ready to submit.
    this.model.recaptchaUsed = value ? true : false;

    //what comes from the Google Recaptcha service.
    this.model["g-recaptcha-response"] = value;

    this.formReadyToSubmit();
  }

  //this determines whether this form is valid so that it can be submitted.
  formReadyToSubmit(){
    const form_valid = this.fields_valid && this.model.recaptchaUsed;

    //'true' means that the form is submittable, 'false' means it is not.
    this.setState( {form_valid} );
  }

  //handles individual form fields within this form.
  renderIfTag(node, k){
    if (node.type === 'tag' ) {

      switch(node.name) {
        case "select":
          /* starts out as null, because the 'node' object here does not have
            the selected value of its select box, because it is not yet rendered
            on the page. */
          this.model[ node.attribs.name ] = null;

          return <SelectTransform node={node} key={k} k={k} f={this.handleChange} />;
        case "input":
          if(node.attribs.type === "submit"){
            return <input type="submit" disabled={!this.state.form_valid}
              title={this.state.form_valid ? "" : "please complete the form"}
              className={node.attribs.class} key={k}></input>;
          }

          return <InputTransform attribs={node.attribs} key={k} k={k} 
            f={this.handleChange} />;
        case "textarea":
          return <TextAreaTransform attrs={node.attribs} key={k} k={k}
            f={this.handleChange} />;
        case "div":
          let retval = "";

          if( node.attribs.class === "wpcf7-form-control-wrap" ){
            retval = <ReCAPTCHA style={{ display: "inline-block" }}
              sitekey={TEST_SITE_KEY} key={k} onChange={this.recapHandleChange}
              onExpired={this.recapHandleChange} />;
          }else{
            retval = convertNodeToElement(node, k);
          }

          return retval;
        default:
        break;
      }
    }
  }

  /*
  created for every possible type of reset for this form, whether internal or
  external.
  */
  resetForm(){
    //reset the model property to as if the form were untouched.
    Object.entries(this.model).forEach(([key, value]) => {
      this.model[key] = (key.includes("ecaptcha") ) ? false : null;
    });

    //but some of the fields, like select boxes, will still have their own native values.
    this.defaultValsToModel();

    this.setState({form_valid: false});
  }

  render(){
    let {props} = this;

    this.action = props.action;

    Modal.setAppElement('#root');

    this.form_id = props.id || this.form_id;

    return <form action={props.action} className={props.class || ""}
      id={this.form_id} name={props.name || ""} encType={props.enctype || ""}
      k={props.k} onSubmit={this.handleSubmit} onReset={this.resetForm}>
    {
      props.children.map(
        (item, k) => convertNodeToElement(item, k, (node, k) => {
          return this.renderIfTag(node, k);
        })
      )
    }
    </form>;
  }

  //unfortunate hack for fields which somehow fall by the wayside when updating the component state.
  defaultValsToModel(){
    //which fields in the form are null? (but probably shouldn't be)
    let null_vals = Object.entries(this.model).filter( e => e[1] === null );

    //so now fix parts of the model (really, form fields) that should be populated.
    for(let i in null_vals){
      let j = null_vals[i][0];
      let v = document.querySelector(`*[name='${j}']`) ?
        document.querySelector(`*[name='${j}']`).value : null;

      this.model[j] = v;
    }
  }

  componentDidUpdate(){
    this.defaultValsToModel();
  }
}

export default ReactiveForm;
