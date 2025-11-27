import { Link } from 'react-router-dom';
import './layout.css'

const Header = () => {
  return (
    <div className="header">
      <nav className="nav">
        <Link to="/backgammon" className="nav-link">Backgammon</Link>
        <Link to="/connect4" className="nav-link">Connect Four</Link>
      </nav>
    </div>
  );
};

export default Header;
