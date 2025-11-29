import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Home from './Home';
import Backgammon from './Backgammon';
import Connect4 from './Connect4';
import './App.module.css'

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/backgammon" element={<Backgammon />} />
          <Route path="/connect4" element={<Connect4 />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
