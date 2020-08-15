import React from "react";

import { NavLink, Link } from "react-router-dom";

const Navbar = ({ user, signOut }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Amplify Market
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <span className="pt-2 d-block mr-2">
                Hello, <strong>{user ? user.username : "User"}</strong>
              </span>
            </li>
            <li className="nav-item">
              <NavLink exact to="/" className="nav-link">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink exact to="/profile" className="nav-link">
                Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <button className="btn btn-light text-muted" onClick={signOut}>
                Signout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
