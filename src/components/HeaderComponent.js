import React, { useState } from 'react';
import { Nav, Navbar, NavbarBrand, NavbarToggler, Collapse, NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';


const Header = (props) => {

  const [isNavOpen, setNavOpen] = useState(false)
  const toggleNav = () => setNavOpen(!isNavOpen)
  const state = { id: props.id, type: props.type }

  return (
    <React.Fragment>
      <Navbar dark expand="md">
        <div className="container">
          <NavbarToggler onClick={toggleNav} />
          <NavbarBrand className="mr-auto" href="/"><img src={window.location.origin + '/assets/images/logo.png'} height="30" width="120" alt='ListoBet' /></NavbarBrand>
          <Collapse isOpen={isNavOpen} navbar>
            <Nav navbar>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {props.type === "admin" ? <NavItem width="50%">
                <NavLink className="nav-link" to='/admin' state={state}><span className="fa fa-user-plus fa-lg"></span> Agente</NavLink>
              </NavItem> : null}
              {props.type === "admin" || props.type === "retail" ? <NavItem width="50%">
                <NavLink className="nav-link" to='/retail' state={state}><span className="fa fa-shopping-bag fa-lg"></span> Tienda</NavLink>
              </NavItem> : null}
              {props.type === "shop" ? <NavItem width="50%">
                <NavLink className="nav-link" to='/shop' state={state}><span className="fa fa-desktop fa-lg"></span> Máquina</NavLink>
              </NavItem> : null}
              <NavItem width="50%">
                <NavLink className="nav-link" to='/inventario/1' state={state}><span className="fa fa-bank fa-lg"></span> Inventario</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </div>
      </Navbar>
      <div className="jumbotron">
        <div className="container">
          <div className="row row-header">
            <div className="col-12 col-sm-6">
              <img src={window.location.origin + '/assets/images/0001.png'} height="180" width="524" alt='ListoBet' />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Header;