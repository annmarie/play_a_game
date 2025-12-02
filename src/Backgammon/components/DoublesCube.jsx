import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { offerDouble, acceptDouble, declineDouble } from '../slice';
import styles from '../Backgammon.module.css';
import Checker from './Checker';

const DoublesCube = ({ doublingCube, currentPlayer, winner, turnEnding }) => {
  const dispatch = useDispatch();

  const canOfferDouble = currentPlayer &&
    !winner &&
    !doublingCube.pendingOffer &&
    doublingCube.owner !== currentPlayer &&
    doublingCube.value < 64 &&
    turnEnding;

  const hasPendingOffer = doublingCube.pendingOffer &&
    doublingCube.pendingOffer !== currentPlayer &&
    currentPlayer;

  return (
    <div className={styles.doublesCube}>
      <div className={styles.cubeDisplay}>
        <div className={styles.cube}>
          {doublingCube.value}
        </div>
        {doublingCube.owner && (
          <div className={styles.owner}>
            Owned by: <Checker player={doublingCube.owner} />
          </div>
        )}
      </div>

      {doublingCube.pendingOffer && (
        <div className={styles.pendingOffer}>
          <Checker player={doublingCube.pendingOffer} /> offers to double!
        </div>
      )}

      <div className={styles.controls}>
        {canOfferDouble && (
          <button
            className={styles.offerButton}
            onClick={() => dispatch(offerDouble())}
            aria-label="Offer to double the stakes"
          >
            Double
          </button>
        )}

        {hasPendingOffer && (
          <div className={styles.responseButtons}>
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
        )}
      </div>
    </div>
  );
};

DoublesCube.propTypes = {
  doublingCube: PropTypes.shape({
    value: PropTypes.number.isRequired,
    owner: PropTypes.string,
    pendingOffer: PropTypes.string
  }).isRequired,
  currentPlayer: PropTypes.string,
  winner: PropTypes.string,
  diceValue: PropTypes.array,
  turnEnding: PropTypes.bool
};

export default DoublesCube;