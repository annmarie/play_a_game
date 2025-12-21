import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
      </nav>
    </div>
  );
};

export default Header;
