import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from '@/slice';
import { localStorageService } from '@services/localStorage';
import styles from './Home.module.css'
import Layout from '@/components/Layout';

const Home = () => {
  const dispatch = useDispatch();
  const [inputName, setInputName] = useState('');
  const userName = useSelector((state) => state.main.name);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      dispatch(setName(inputName.trim()));
      setInputName('');
    }
  };

  const handleSignOut = () => {
    dispatch(setName(null));
    localStorageService.clearUserData();
    dispatch({ type: 'backgammon/resetGame' });
    dispatch({ type: 'connect4/resetGame' });
    dispatch({ type: 'multiplayer/reset' });
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
            <button onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
          </div>
        )}

        <div className={styles.gameLinks}>
          <Link to="/backgammon" className={styles.gameLink}>
            <h2>Backgammon</h2>
          </Link>
          <Link to="/connect4" className={styles.gameLink}>
            <h2>Connect Four</h2>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
