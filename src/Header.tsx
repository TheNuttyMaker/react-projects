import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Header() {
  const [scroll, setScroll] = useState<boolean>(false);
  return (
    <>
      <section className="container">
        <div className="logo">
          <Link to="/">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
              alt="React Logo"
              className="logo-image"
            />
          </Link>
          <button onClick={() => setScroll(!scroll)}>Scroll </button>
        </div>
        <div className={scroll ? 'links scroll' : 'links'}>
          <NavLink to="/typeahead">Typeahead</NavLink>
          <NavLink to="/datatable">Datatable</NavLink>
          <NavLink to="/grid-light">GridLight</NavLink>
          <NavLink to="/todo">TODO</NavLink>
        </div>
      </section>
    </>
  );
}

export default Header;
