import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          Promoly
        </Link>

        <nav className="navbar__menu">
          <ul className="navbar__list">
            <li className="navbar__item">
              <Link className="navbar__link" to="/categoria/eletronicos">
                Eletrônicos
              </Link>
            </li>
            <li className="navbar__item">
              <Link className="navbar__link" to="/categoria/casa">
                Casa
              </Link>
            </li>
            <li className="navbar__item">
              <Link className="navbar__link" to="/categoria/pet">
                Pet
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
