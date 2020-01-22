import React from 'react';

function TextAreaTransform(node, k, f=null){
  let attrs = node.attribs;

  attrs.className = attrs.class;

  delete attrs.class;

  return ( <textarea {...attrs} key={k} onChange={f}></textarea> );
}

export default TextAreaTransform;