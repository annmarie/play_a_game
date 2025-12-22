import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setName } from '@/slice';
import styles from './Header.module.css';

const Header = () => {
  const [showForm, setShowForm] = useState(false);
  const [inputName, setInputName] = useState('');
  const userName = useSelector((state) => state.main.name);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      dispatch(setName(inputName.trim()));
      setInputName('');
      setShowForm(false);
    }
  };

  const handleSignOut = () => {
    dispatch(setName(null));
    dispatch({ type: 'backgammon/resetGame' });
    dispatch({ type: 'connect4/resetGame' });
    dispatch({ type: 'multiplayer/reset' });
    navigate('/');
  };

  return (
    <div className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>

        {userName ? (
          <div className={styles.userSection}>
            <span className={styles.userName}>Hi, {userName}</span>
            <button onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
          </div>
        ) : (
          <div className={styles.signInSection}>
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className={styles.signInBtn}>Sign In</button>
            ) : (
              <form onSubmit={handleSubmit} className={styles.signInForm}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className={styles.nameInput}
                  autoFocus
                />
                <button type="submit" className={styles.submitBtn}>OK</button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Cancel</button>
              </form>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Header;
