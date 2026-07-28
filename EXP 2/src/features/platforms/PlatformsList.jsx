import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPlatforms, addPlatform, deletePlatform } from './platformsSlice';
import PlatformCard from '../../components/PlatformCard';

const PlatformsList = () => {
  const platforms = useSelector(selectAllPlatforms);
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch(addPlatform(name));
    setName('');
  };

  return (
    <section className="panel platforms-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Channels</p>
          <h2>Platforms</h2>
        </div>
      </div>
      <div className="platform-form">
        <input
          className="field"
          placeholder="e.g. LinkedIn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="button button-primary" onClick={handleAdd}>Add</button>
      </div>

      <div className="platform-list">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onDelete={(id) => dispatch(deletePlatform(id))}
          />
        ))}
      </div>
    </section>
  );
};

export default PlatformsList;
