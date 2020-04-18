import React from 'react';

class ThreeRingHamburgerButton extends React.Component {
  render(){
    // supplment to the nav bar
    return (<button onClick={this.props.showMenu} className="nav_expander">
      <span className={this.props.burgerClassName}>
        <div className="one">_</div>
        <div className="two">_</div>
        <div className="three">_</div>
      </span>
    </button>);
  }
}

export default ThreeRingHamburgerButton;
