import { Link } from 'react-router-dom';

const Hello = () => {
  return (
    <ul className="list">
      <li className="list-item"><Link to="/backgammon">Backgammon</Link></li>
      <li className="list-item"><Link to="/connect4">Connect4</Link></li>
      <li className="list-item"><Link to="/slidepuzzle">SlidePuzzle</Link></li>
      <li className="list-item"><Link to="/pegsolitaire">PegSolitaire</Link></li>
    </ul>
  );
};

export default Hello
