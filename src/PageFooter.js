import React from 'react';

import NavBar from './NavBar';

function PageFooter(props){
  let nav_items = props.items;

  console.log( {nav_items} );

  return (
      <>
        <footer id="/footer/">
          <NavBar id="footer_nav" items={nav_items} />

          <p>Stamford, CT</p>
          <p>Clemson, SC</p>
        </footer>
      </>
    );
}

export default PageFooter;
