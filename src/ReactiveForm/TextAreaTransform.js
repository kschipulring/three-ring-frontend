import React from 'react';

function TextAreaTransform({attrs, k, f}) {
  //React likes this property, not the one it is being copied from.
  attrs.className = attrs.class;

  //React is cranky with this perfectly good, normal javascript attribute
  delete attrs.class;

  let required = attrs['aria-required'] ? true : false;

  return (
    <textarea {...attrs} key={k} onChange={f} required={required}></textarea>
  );
}

export default TextAreaTransform;
