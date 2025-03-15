import PropTypes from 'prop-types';
import './styles.css'

const Cell = ({ rowIndex, colIndex, cellValue, selectedPeg, onClick }) => {
  const isSelected = selectedPeg?.row === rowIndex && selectedPeg?.col === colIndex;
  const cellClass = `cell ${
    cellValue === 1 ? 'peg' : cellValue === 0 ? 'empty' : 'invalid'
  } ${isSelected ? 'selected' : ''}`;

  const ariaLabel = `Cell at row ${rowIndex + 1}, column ${colIndex + 1} is ${
    cellValue === 1 ? 'a peg' : cellValue === 0 ? 'empty' : 'not playable'
  }${isSelected ? ' and selected' : ''}`;

  const thisOnClick = (cellValue === 1 || cellValue === 0) ? onClick : () => {};

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={cellClass}
      onClick={thisOnClick}
      role="button"
      aria-label={ariaLabel}
      aria-disabled={cellValue === null || cellValue === 'invalid'}
    ></div>
  );
};

Cell.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  colIndex: PropTypes.number.isRequired,
  cellValue: PropTypes.oneOf([0, 1, null, 'invalid']),
  selectedPeg: PropTypes.shape({
    row: PropTypes.number,
    col: PropTypes.number,
  }),
  onClick: PropTypes.func.isRequired,
};

export default Cell;
