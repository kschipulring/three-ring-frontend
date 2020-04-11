import React from 'react';

function InputTransform(node, k, f=null){
  let attrs = node.attribs;  console.log( {f} );

  //we want the submit button to be disabled by default.  Avoids spammy stuff.
  let if_disabled = (attrs.type === "submit") && !(attrs.form_enabled);
  let if_title = if_disabled ? "please complete the form" : "";

  attrs.className = attrs.class;

  delete attrs.class;

  return <input type={attrs.type} className={attrs.className} title={if_title}
  name={attrs.name} key={k} onChange={f} disabled={if_disabled} />;
}

export default InputTransform;