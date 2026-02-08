import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/">Promoly</Link>

      <div className="nav-links">
        <Link to="/categoria/eletronicos">Eletrônicos</Link>
        <Link to="/categoria/casa">Casa</Link>
        <Link to="/categoria/pet">Pet</Link>
      </div>
    </nav>
  );
}
