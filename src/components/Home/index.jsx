import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from '@/slice';
import GameModeSelector from '@/components/ModeSelector';
import styles from './Home.module.css'
import Layout from '@components/Layout';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [inputName, setInputName] = useState('');
  const userName = useSelector((state) => state.main.name);

  const handleBackgammonMode = (payload) => {
    dispatch({ type: 'backgammon/setMultiplayerMode', payload });
    navigate('/backgammon');
  };

  const handleConnect4Mode = (payload) => {
    dispatch({ type: 'connect4/setMultiplayerMode', payload });
    navigate('/connect4');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      dispatch(setName(inputName.trim()));
      setInputName('');
    }
  };

  return (
    <Layout showHeader={false}>
      <div className={styles.homeContent}>
        <h1>Play A Game!</h1>
        {!userName ? (
          <div className={styles.signInSection}>
            <form onSubmit={handleNameSubmit} className={styles.nameForm}>
              <input
                type="text"
                placeholder="Your name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className={styles.nameInput}
              />
              <button type="submit" className={styles.submitBtn}>Sign in</button>
            </form>
          </div>
        ) : (
          <div className={styles.welcomeSection}>
            <p className={styles.welcomeText}>Welcome back, {userName}!</p>
          </div>
        )}

        <div className={styles.gameSelectors}>
          <div className={styles.gameSection}>
            <h2>Backgammon</h2>
            <GameModeSelector
              gameType="backgammon"
              isMultiplayer={null}
              setMultiplayerMode={handleBackgammonMode}
            />
          </div>

          <div className={styles.gameSection}>
            <h2>Connect Four</h2>
            <GameModeSelector
              gameType="connect4"
              isMultiplayer={null}
              setMultiplayerMode={handleConnect4Mode}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
