import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllPlatforms, selectPlatformById } from '../features/platforms/platformsSlice';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const platform = useSelector((state) => selectPlatformById(state, post.platformId));
  const platforms = useSelector(selectAllPlatforms);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [platformId, setPlatformId] = useState(post.platformId);

  const cancelEdit = () => {
    setTitle(post.title);
    setContent(post.content);
    setPlatformId(post.platformId);
    setIsEditing(false);
  };

  const saveEdit = (event) => {
    event.preventDefault();
    if (!title.trim() || !platformId) return;

    onUpdate(post.id, { title: title.trim(), content, platformId });
    setIsEditing(false);
  };

  return (
    <article className="post-card">
      {isEditing ? (
        <form className="edit-post-form" onSubmit={saveEdit}>
          <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Post title" />
          <textarea className="field content-field" value={content} onChange={(event) => setContent(event.target.value)} maxLength={300} rows={4} aria-label="Post content" />
          <div className="edit-form-footer">
            <span className="character-count">{content.length}/300</span>
            <select className="field" value={platformId} onChange={(event) => setPlatformId(event.target.value)} aria-label="Platform">
              {platforms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <div className="post-actions">
              <button className="button button-secondary" type="button" onClick={cancelEdit}>Cancel</button>
              <button className="button button-primary" type="submit">Save changes</button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div>
            <span className="platform-tag">{platform ? platform.name : 'Unknown platform'}</span>
            <h3>{post.title}</h3>
            {post.content && <p>{post.content}</p>}
          </div>
          <div className="post-actions">
            <button className="button button-secondary" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="button button-danger" onClick={() => onDelete(post.id)}>Delete</button>
          </div>
        </>
      )}
    </article>
  );
};

export default PostCard;
