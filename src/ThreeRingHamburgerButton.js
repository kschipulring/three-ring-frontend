import React from 'react';

class ThreeRingHamburgerButton extends React.Component {

  /*
<span class="default" style="
    transform: rotate(-90deg);
"><div style="
    transform: rotate(45deg) translate(15px, -5px);
">_</div><div style="
    transform: scaleX(1.75) translate(-4px);
">_</div><div style="
    transform: rotate(-45deg) translate(-5px, -5px);
">_</div></span>
  */

  render(){
    // supplment to the nav bar
    return (<button onClick={this.props.showMenu} className="nav_expander">
      <span className="default">_<br/>_<br/>_</span>
      <span className="expanded {navClassName}">X</span>
    </button>);
  }
}

export default ThreeRingHamburgerButton;
