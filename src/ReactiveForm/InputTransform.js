import React from 'react';

function InputTransform(node, k, f=null){
  let attrs = node.attribs;  console.log( {f} );

  attrs.className = attrs.class;

  delete attrs.class;

  return <input type={attrs.type} className={attrs.className}
  name={attrs.name} key={k} onChange={f} />;
}

export default InputTransform;