import React from 'react';
import { useSelector } from 'react-redux';
import { selectPostIds } from './postsSlice';
import PostCard from '../../components/PostCard';
import PostForm from '../../components/Postform';

const PostsList = () => {
  const postIds = useSelector(selectPostIds);

  return (
    <section className="panel posts-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Publishing queue</p>
          <h2>Posts</h2>
        </div>
      </div>
      <PostForm />
      {postIds.length === 0 ? (
        <p className="empty-state">No posts yet. Add your first post above.</p>
      ) : (
        postIds.map((postId) => (
          <PostCard key={postId} postId={postId} />
        ))
      )}
    </section>
  );
};

export default PostsList;
