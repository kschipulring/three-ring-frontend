import React from 'react';

import Config from './Config';
import Utilities from './Utilities';

class ReactiveForm extends React.Component {
  render(){

    let new_action = node.attribs.action.includes(Config.base_url) ? 
    node.attribs.action : Config.base_url + node.attribs.action;

    return (
      <form action={new_action} className={node.attribs.class || "" }
        id={node.attribs.id || ""} encType={node.attribs.enctype || ""}
        key={k} onSubmit={this.handleSubmit}>
        {

          node.children.map(
            (item, k) => convertNodeToElement(item, k, (node, k) => {
              if (node.type === 'tag' ) {

                switch(node.name) {
                  case "input":
                    return Utilities.inputTransform(node, k);
                  case "textarea":
                    return Utilities.textAreaTransform(node, k);
                  default:
                  break;
                }
                
              }
            })
          )
        }
      </form>
    );
  }
}

export default ReactiveForm;