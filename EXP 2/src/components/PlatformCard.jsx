import React from 'react';

const PlatformCard = ({ platform, onDelete }) => {
  return (
    <div className="platform-card">
      <strong>{platform.name}</strong>
      <button className="icon-button" aria-label={`Delete ${platform.name}`} onClick={() => onDelete(platform.id)}>
        Delete
      </button>
    </div>
  );
};

export default PlatformCard;
