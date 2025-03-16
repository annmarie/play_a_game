import { Link } from 'react-router-dom';
import './styles.css'

const Home = () => {
  return (<div className="main">
    <h1 className="header">Play A Game</h1>
    <ul className="list">
      <li className="list-item"><Link to="/backgammon">Backgammon</Link></li>
      <li className="list-item"><Link to="/connect4">Connect4</Link></li>
      <li className="list-item"><Link to="/slidepuzzle">SlidePuzzle</Link></li>
      <li className="list-item"><Link to="/pegsolitaire">PegSolitaire</Link></li>
    </ul>
  </div>);
};

export default Home;
