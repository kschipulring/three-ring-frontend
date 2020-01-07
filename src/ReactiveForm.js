import React from 'react';

import Config from './Config';
import Utilities from './Utilities';
import ReCAPTCHA from "react-google-recaptcha";

import { convertNodeToElement } from 'react-html-parser';

const TEST_SITE_KEY = "6Le5-T4UAAAAAL09DMkA6dffu36NsuFwg2a-Q5WC";

class ReactiveForm extends React.Component {
  render(){
    let {props} = this;

    console.log( props.children );

    return <form  action={props.action} className={props.class || "" }
    id={props.id || ""} encType={props.enctype || ""} k={props.k}>
    {

      props.children.map(
        (item, k) => convertNodeToElement(item, k, (node, k) => {
          if (node.type === 'tag' ) {

            switch(node.name) {
              case "select":
                return Utilities.selectTransform(node, k);
              case "input":
                return Utilities.inputTransform(node, k);
              case "textarea":
                return Utilities.textAreaTransform(node, k);
              case "div":

                let retval = "";

                if( node.attribs.class === "wpcf7-form-control-wrap" ){
                  retval = <ReCAPTCHA
                      style={{ display: "inline-block" }}
                      sitekey={TEST_SITE_KEY}
                      key={k}
                    />;
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