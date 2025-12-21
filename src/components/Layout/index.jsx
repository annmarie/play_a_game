import PropTypes from 'prop-types';
import Header from '@/components/Header';
import styles from './Layout.module.css'

const Layout = ({ children, showHeader = true }) => {
  return (
    <div className={styles.main}>
      {showHeader && <Header />}
      {children}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  showHeader: PropTypes.bool,
};

export default Layout;
