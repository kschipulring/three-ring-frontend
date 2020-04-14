import React from 'react';

function SelectTransform({node, k, f}){
  let attrs = node.attribs;

  attrs.className = attrs.class;
  delete attrs.class;

  /* React prefers the 'defaultValue' attribute instead of applying a 'selected'
  value to an individual option. So first find the single option array member, then... */
  let selected_option = node.children.filter(node => node.attribs.selected);

  //string value of above
  let sel_val = selected_option[0].attribs.value;
  
  let required = attrs['aria-required'] ? true : false;

  return <select key={k} {...attrs} onChange={f} defaultValue={sel_val} 
    required={required}>
  {
    node.children.map(
      (item, k2) => <option key={k2} value={item.attribs.value} >
      {
        item.data || item.children.map( i => i.data || "" )
      }
      </option>
    )
  }
  </select>;
}

export default SelectTransform;