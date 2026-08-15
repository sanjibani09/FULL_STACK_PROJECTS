import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('');

  const platforms = useSelector(selectAllPlatforms);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !platformId) return;

    dispatch(addPost({ title, content, platformId }));
    setTitle('');
    setContent('');
    setPlatformId('');
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input
        className="field post-title-field"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select className="field platform-select" value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
        <option value="">Select Platform</option>
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="content-input-wrap">
        <textarea
          className="field content-field"
          placeholder="Post content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={300}
          rows={4}
        />
        <p className="character-count" aria-live="polite">{content.length}/300</p>
      </div>
      <button className="button button-primary" type="submit">Add post</button>
    </form>
  );
};

export default PostForm;
