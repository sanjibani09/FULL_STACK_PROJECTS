function PlatformSelector({ platform, setPlatform }) {
  const options = ["Twitter", "Facebook", "Instagram", "LinkedIn"];

  return (
    <aside className="platform-selector">
      <h2>Select a platform</h2>
      <p>Choose one platform to write its post.</p>
      <div className="platform-list" role="tablist" aria-label="Social platforms">
        {options.map((option) => (
          <button
            className={platform === option ? "platform-option active-platform" : "platform-option"}
            key={option}
            type="button"
            role="tab"
            aria-selected={platform === option}
            onClick={() => setPlatform(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default PlatformSelector;
