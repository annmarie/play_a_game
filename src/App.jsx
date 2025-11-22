import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import SlidePuzzle from './SlidePuzzle';
import Connect4 from './Connect4';
import PegSolitaire from './PegSolitaire';
import Backgammon from './Backgammon';
import Home from './Home';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/slidepuzzle" element={<SlidePuzzle />} />
          <Route path="/connect4" element={<Connect4 />} />
          <Route path="/pegsolitaire" element={<PegSolitaire />} />
          <Route path="/backgammon" element={<Backgammon />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
