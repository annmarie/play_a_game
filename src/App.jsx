import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import Home from '@components/Home';
import Backgammon from '@components/Backgammon';
import Connect4 from '@components/Connect4';
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
