import React from 'react';
import { Link } from "react-router-dom";

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
}
