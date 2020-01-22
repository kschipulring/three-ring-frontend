import React from 'react';

import Config from './Config';
import ReCAPTCHA from "react-google-recaptcha";

import { convertNodeToElement } from 'react-html-parser';

const TEST_SITE_KEY = "6Le5-T4UAAAAAL09DMkA6dffu36NsuFwg2a-Q5WC";

class ReactiveForm extends React.Component {
  constructor(props) {
    super(props);

    /*this.state = {
      recaptchaUsed: false
    };*/

    this.model = {
      recaptchaUsed: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.recapHandleChange = this.recapHandleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.action = "";
  }

  static selectTransform(node, k, f=null){
    let attrs = node.attribs;

    attrs.className = attrs.class;

    delete attrs.class;

    console.log( node.children );

    return <select className={attrs.className} key={k} {...attrs} onChange={f} >
    {
      node.children.map(
        (item, k2) => <option key={k2}>
        {
          item.data || item.children.map( i => i.data || "" )
        }
        </option>
      )
    }
    </select>;
  }

  static inputTransform(node, k, f=null){
    let attrs = node.attribs;  console.log( {f} );

    attrs.className = attrs.class;

    delete attrs.class;

    return <input type={attrs.type} className={attrs.className}
    name={attrs.name} key={k} onChange={f} />;
  }

  static textAreaTransform(node, k, f=null){
    let attrs = node.attribs;

    attrs.className = attrs.class;

    delete attrs.class;

    return ( <textarea {...attrs} key={k} onChange={f}></textarea> );
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

  render(){
    let {props} = this;

    this.action = props.action;

    return <form action={props.action} className={props.class || "" }
    id={props.id || ""} encType={props.enctype || ""} k={props.k} 
    onSubmit={this.handleSubmit}>
    {

      props.children.map(
        (item, k) => convertNodeToElement(item, k, (node, k) => {
          if (node.type === 'tag' ) {

            switch(node.name) {
              case "select":
                return ReactiveForm.selectTransform(node, k, this.handleChange);
              case "input":
                return ReactiveForm.inputTransform(node, k, this.handleChange);
              case "textarea":
                return ReactiveForm.textAreaTransform(node, k, this.handleChange);
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
        })
      )
    }
    </form>;
  }
}

export default ReactiveForm;
