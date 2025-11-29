import { Link } from 'react-router-dom';
import styles from './Home.module.css'
import globalStyles from '../App.module.css'

const Home = () => {
  return (
    <div className={globalStyles.main}>
      <div className={styles.homeContent}>
        <h1>Welcome to Play A Game!</h1>
        <p>Select a game to start playing:</p>
        <nav className={styles.nav}>
          <Link to="/backgammon" className={styles.navLink}>Backgammon</Link>
          <Link to="/connect4" className={styles.navLink}>Connect Four</Link>
        </nav>
      </div>
    </div>
  );
};

export default Home;
