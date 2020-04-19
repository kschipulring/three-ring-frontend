import React from 'react';

import NavBar from './NavBar';

function PageFooter(props){
  let nav_items = props.items;

  return (
    <footer id="/footer/">
      <h2>Three Ring Design</h2>
      <NavBar id="footer_nav" items={nav_items} />

      <p>Stamford, CT</p>
      <p>Clemson, SC</p>
    </footer>
  );
}

export default PageFooter;
