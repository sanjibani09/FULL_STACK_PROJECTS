import React, { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost, selectPostById, updatePost } from '../features/posts/postsSlice';
import { selectPlatformOptions, selectPlatformById } from '../features/platforms/platformsSlice';

const PostCard = ({ postId }) => {
  const dispatch = useDispatch();
  const post = useSelector((state) => selectPostById(state, postId));
  const platform = useSelector((state) => selectPlatformById(state, post.platformId));
  const platforms = useSelector(selectPlatformOptions);
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

  const saveEdit = useCallback((event) => {
    event.preventDefault();
    if (!title.trim() || !platformId) return;

    dispatch(updatePost({ id: post.id, changes: { title: title.trim(), content, platformId } }));
    setIsEditing(false);
  }, [content, dispatch, platformId, post.id, title]);

  const deleteCurrentPost = useCallback(() => {
    dispatch(deletePost(post.id));
  }, [dispatch, post.id]);

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
            <button className="button button-danger" onClick={deleteCurrentPost}>Delete</button>
          </div>
        </>
      )}
    </article>
  );
};

export default memo(PostCard);
