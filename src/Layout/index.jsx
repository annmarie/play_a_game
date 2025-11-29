import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './layout.css'

const Layout = ({ children }) => {
  return (
    <div className="main">
      <div className="header">
        <nav className="nav">
          <Link to="/backgammon" className="nav-link">Backgammon</Link>
          <Link to="/connect4" className="nav-link">Connect Four</Link>
        </nav>
      </div>
      {children}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;