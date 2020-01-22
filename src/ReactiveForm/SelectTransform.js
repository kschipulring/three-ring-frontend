import React from 'react';

function SelectTransform(node, k, f=null){
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

export default SelectTransform;