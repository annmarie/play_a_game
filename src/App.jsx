import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Connect4 from './Connect4';
import Backgammon from './Backgammon';
import './App.css'

const Hello = () => {
  return (
    <div className="well">
      <h2>Play A Game</h2>
      <ul>
        <li><NavLink to="/backgammon">Backgammon</NavLink></li>
        <li><NavLink to="/connect4">Connect Four</NavLink></li>
      </ul>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/connect4" element={<Connect4 />} />
        <Route path="/Backgammon" element={<Backgammon />} />
      </Routes>
    </Router>
  );
};

export default App;
