import React from 'react';

function InputTransform({attribs, k, f}){
  //for a phone field to be valid, it must have the following pattern.
  attribs.pattern = attribs.type === "tel" ?
    "[0-9]{3} ?[0-9]{3} ?[0-9]{4}" : null;

  attribs.className = attribs.class;
  
  delete attribs.class;
  delete attribs.value;

  attribs.required = attribs['aria-required'] ? true : false;

  attribs.k = k;
  attribs.onChange = f;

  return (<input {...attribs} />);
}

export default InputTransform;
