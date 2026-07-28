import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPosts, deletePost, updatePost } from './postsSlice';
import PostCard from '../../components/PostCard';
import PostForm from '../../components/Postform';

const PostsList = () => {
  const posts = useSelector(selectAllPosts);
  const dispatch = useDispatch();

  return (
    <section className="panel posts-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Publishing queue</p>
          <h2>Posts</h2>
        </div>
      </div>
      <PostForm />
      {posts.length === 0 ? (
        <p className="empty-state">No posts yet. Add your first post above.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={(id) => dispatch(deletePost(id))}
            onUpdate={(id, changes) => dispatch(updatePost({ id, changes }))}
          />
        ))
      )}
    </section>
  );
};

export default PostsList;
