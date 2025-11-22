import { Link } from 'react-router-dom';
import './layout.css'

const Header = () => {
  return (
    <div className="header">
      <h1><Link to="/">Play A Game</Link></h1>
    </div>
  );
};

export default Header;
