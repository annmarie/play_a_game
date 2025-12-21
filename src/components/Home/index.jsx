import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import GameModeSelector from '../GameModeSelector';
import styles from './Home.module.css'
import Layout from '../Layout';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBackgammonMode = (payload) => {
    dispatch({ type: 'backgammon/setMultiplayerMode', payload });
    navigate('/backgammon');
  };

  const handleConnect4Mode = (payload) => {
    dispatch({ type: 'connect4/setMultiplayerMode', payload });
    navigate('/connect4');
  };

  return (
    <Layout showHeader={false}>
      <div className={styles.homeContent}>
        <h1>Welcome to Play A Game!</h1>
        <p>Select a game and mode to start playing:</p>
        
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
