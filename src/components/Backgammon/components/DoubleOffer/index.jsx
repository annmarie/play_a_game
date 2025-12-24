import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { PLAYER } from '../../globals';
import { acceptDouble, declineDouble } from '../../slice';
import Checker from '../Checker';
import styles from './DoubleOffer.module.css';

const DoubleOffer = ({ pendingOffer }) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.doubleOffer}>
      <div className={styles.doubleQuestion}>
        <span>Does</span>
        <Checker player={pendingOffer === PLAYER.LEFT ? PLAYER.RIGHT : PLAYER.LEFT} />
        <span>accept the offer?</span>
      </div>
      <div className={styles.doubleButtons}>
        <button
          className={styles.acceptButton}
          onClick={() => dispatch(acceptDouble())}
          aria-label="Accept the double"
        >
          Accept
        </button>
        <button
          className={styles.declineButton}
          onClick={() => dispatch(declineDouble())}
          aria-label="Decline the double"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

DoubleOffer.propTypes = {
  pendingOffer: PropTypes.string
};

export default DoubleOffer;
