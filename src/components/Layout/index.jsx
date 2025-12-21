import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './Layout.module.css'

const Layout = ({ children, showHeader = true }) => {
  return (
    <div className={styles.main}>
      {showHeader && (
        <div className={styles.header}>
          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>Home</Link>
          </nav>
        </div>
      )}
      {children}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  showHeader: PropTypes.bool,
};

export default Layout;
