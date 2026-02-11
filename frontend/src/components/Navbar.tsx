import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          Promoly
        </Link>

        {/* BOTÃO HAMBURGER */}
        <button
          className={`navbar__toggle ${isOpen ? "is-active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`navbar__menu ${isOpen ? "is-active" : ""}`}>
          <ul className="navbar__list">
            <li className="navbar__item">
              <Link
                className="navbar__link"
                to="/categoria/eletronicos"
                onClick={() => setIsOpen(false)}
              >
                Eletrônicos
              </Link>
            </li>

            <li className="navbar__item">
              <Link
                className="navbar__link"
                to="/categoria/casa"
                onClick={() => setIsOpen(false)}
              >
                Casa
              </Link>
            </li>

            <li className="navbar__item">
              <Link
                className="navbar__link"
                to="/categoria/pet"
                onClick={() => setIsOpen(false)}
              >
                Pet
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
