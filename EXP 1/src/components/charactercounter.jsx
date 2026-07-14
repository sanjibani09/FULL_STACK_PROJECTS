function CharacterCounter({ count, limit }) {
  return (
    <span className="counter" aria-label={`${count} of ${limit} characters used`}>{count} / {limit}</span>
  );
}

export default CharacterCounter;
