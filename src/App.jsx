import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import SlidePuzzle from './SlidePuzzle';
import Connect4 from './Connect4';
import PegSolitaire from './PegSolitaire';
import TicTacToe from './TicTacToe';
import Backgammon from './Backgammon';

const Hello = () => {

  return (
    <ul>
      <li><Link to="/backgammon">Backgammon</Link></li>
      <li><Link to="/connect4">Connect4</Link></li>
      <li><Link to="/slidepuzzle">SlidePuzzle</Link></li>
      <li><Link to="/pegsolitaire">PegSolitaire</Link></li>
    </ul>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Hello />} />
          <Route path="/slidepuzzle" element={<SlidePuzzle />} />
          <Route path="/connect4" element={<Connect4 />} />
          <Route path="/pegsolitaire" element={<PegSolitaire />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
          <Route path="/backgammon" element={<Backgammon />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
