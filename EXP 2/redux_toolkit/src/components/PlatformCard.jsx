import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deletePlatform, selectPlatformById } from '../features/platforms/platformsSlice';

const PlatformCard = ({ platformId }) => {
  const dispatch = useDispatch();
  const platform = useSelector((state) => selectPlatformById(state, platformId));

  const deleteCurrentPlatform = useCallback(() => {
    dispatch(deletePlatform(platformId));
  }, [dispatch, platformId]);

  return (
    <div className="platform-card">
      <strong>{platform.name}</strong>
      <button className="icon-button" aria-label={`Delete ${platform.name}`} onClick={deleteCurrentPlatform}>
        Delete
      </button>
    </div>
  );
};

export default memo(PlatformCard);
