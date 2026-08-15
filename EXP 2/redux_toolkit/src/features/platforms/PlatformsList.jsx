import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectPlatformIds, addPlatform } from './platformsSlice';
import PlatformCard from '../../components/PlatformCard';

const PlatformsList = () => {
  const platformIds = useSelector(selectPlatformIds);
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const handleAdd = useCallback(() => {
    if (!name.trim()) return;
    dispatch(addPlatform(name));
    setName('');
  }, [dispatch, name]);

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
        {platformIds.map((platformId) => (
          <PlatformCard key={platformId} platformId={platformId} />
        ))}
      </div>
    </section>
  );
};

export default PlatformsList;
