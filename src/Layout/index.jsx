import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './Layout.module.css'
import globalStyles from '../App.module.css'

const Layout = ({ children }) => {
  return (
    <div className={globalStyles.main}>
      <div className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/backgammon" className={styles.navLink}>Backgammon</Link>
          <Link to="/connect4" className={styles.navLink}>Connect Four</Link>
        </nav>
      </div>
      {children}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;