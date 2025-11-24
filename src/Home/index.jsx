import { Link } from 'react-router-dom';
import Header from '../Header';
import './layout.css'

const Home = () => {
  return (<div className="main">
    <Header />
    <ul className="list">
      <li className="list-item"><Link to="/backgammon">Backgammon</Link></li>
      <li className="list-item"><Link to="/connect4">Connect4</Link></li>
    </ul>
  </div>);
};

export default Home;
