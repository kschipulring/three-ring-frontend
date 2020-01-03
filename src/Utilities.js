import React from 'react';
import { Link } from "react-router-dom";
import { convertNodeToElement } from 'react-html-parser';

import Config from './Config';

export default class Utilities {

  /**
   * To get rid of annoying html entities and replace them with what they are supposed to render as.
   * @param {string} html - the source html.
   * @return {string} - the processed html.
   */
  static decodeEntities(html) {
    var cache = {},
      character,
      e = document.createElement('div');

    if( html.replace ){
      return html.replace(/([&][^&; ]+[;])/g, function(entity) {
        character = cache[entity];
        if (!character) {
          e.innerHTML = entity;
          if (e.childNodes[0]){
            character = cache[entity] = e.childNodes[0].nodeValue;
          } else{
            character = '';
          }
        }
        return character;
      });
    }
  }

  static handleSubmit(event, value) {
    if (value) {
      //setList(list.concat(value));

      console.log( {value} );
    }
    /*setValue('');*/
    console.log( event.target.value );

    event.preventDefault();
  }

  static handleChange(event){
    return true;
  }


  /**
   * Transforms a standard 'a' tag into a react router 'Link' element. This is 
   * really only necessary for a tag elements from CMS Ajax source, as other 
   * Link elements are able to be semi-manually written.
   * NOTE: should only be for local links, not to places on other sites.
   * @param {object} node - html node. Should only be the 'a' tag.
   * @param {number} k - for each Link element to be unique and not make React cranky.
   * @return {Link(object)} - an individual Link element.
   */
  static a2LinkTransform(node, k){
    return (
      <Link to={node.attribs.href} className={node.attribs.class || "" } key={k}>
        {
          node.children.map(
            (item) => item.data || item.children.map( i => i.data || "" )
          )
        }
      </Link>
    );
  }

  static formTransform(node, k){
    let new_action = node.attribs.action.includes(Config.base_url) ? 
      node.attribs.action : Config.base_url + node.attribs.action;

    //console.log( node.children );

    return (
      <form action={new_action} className={node.attribs.class || "" }
        id={node.attribs.id || ""} encType={node.attribs.enctype || ""}
        key={k} onSubmit={this.handleSubmit}>
        {
          /**
           * convertNodeToElement(node, index, transform);
          */
          
          node.children.map(
            (item, k) => convertNodeToElement(item, k, (node, k) => {
              if (node.type === 'tag' ) {

                switch(node.name) {
                  case "select":
                    return Utilities.selectTransform(node, k);
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

  static selectTransform(node, k){

/*
<select name="select-233"
class="wpcf7-form-control wpcf7-select wpcf7-validates-as-required"
aria-required="true" aria-invalid="false">
  <option value="General Inquiry">General Inquiry</option>
  <option value="Request A Quote">Request A Quote</option>
</select>

*/

    let attrs = node.attribs;

    attrs.className = attrs.class;

    delete attrs.class;

    console.log( node.children );

    return <select className={attrs.className} name={attrs.name || ''} key={k} >
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

  static inputTransform(node, k){
    let attrs = node.attribs;

    attrs.className = attrs.class;

    delete attrs.class;

    return <input type={attrs.type} className={attrs.className}
    name={attrs.name} key={k} />;
  }

  static textAreaTransform(node, k){
    let attrs = node.attribs;

    attrs.className = attrs.class;

    delete attrs.class;

    return (
      <textarea {...attrs} key={k}></textarea>
    );
  }
}
