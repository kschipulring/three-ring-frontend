import React from 'react';

import Config from './Config';
import Utilities from './Utilities';
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
  }

  handleSubmit(event, value) {

    console.log( this.model );

    event.preventDefault();
  }

  handleChange(event){
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.model[name] = value;

    console.log( this.model );
  }

  recapHandleChange(value){
    this.model.recaptchaUsed = true;
    this.model.recaptchaValue = value;
  }

  render(){
    let {props} = this;

    return <form action={props.action} className={props.class || "" }
    id={props.id || ""} encType={props.enctype || ""} k={props.k} 
    onSubmit={this.handleSubmit}>
    {

      props.children.map(
        (item, k) => convertNodeToElement(item, k, (node, k) => {
          if (node.type === 'tag' ) {

            switch(node.name) {
              case "select":
                return Utilities.selectTransform(node, k, this.handleChange);
              case "input":
                return Utilities.inputTransform(node, k, this.handleChange);
              case "textarea":
                return Utilities.textAreaTransform(node, k, this.handleChange);
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
