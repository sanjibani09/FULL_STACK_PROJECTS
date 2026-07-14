import { useState } from "react";
import PlatformSelector from "./platformselector";
import CharacterCounter from "./charactercounter";
import ValidationMessage from "./validatemessage";

function PostComposer() {
  const [platform, setPlatform] = useState("Twitter");
  const [posts, setPosts] = useState({});
  const [published, setPublished] = useState(false);
  const limits = { Twitter: 280, Facebook: 63206, Instagram: 2200, LinkedIn: 3000 };
  const post = posts[platform] || "";

  const handlePostChange = (event) => {
    setPosts((currentPosts) => ({ ...currentPosts, [platform]: event.target.value }));
    setPublished(false);
  };

  const handlePlatformChange = (nextPlatform) => {
    setPlatform(nextPlatform);
    setPublished(false);
  };

  const message = post.trim() ? "" : `Write a post for ${platform}.`;

  return (
    <div className="composer">
      <PlatformSelector platform={platform} setPlatform={handlePlatformChange} />
      <section className="composer-main">
        <div className="composer-topline">
          <div>
            <h2>Create your post</h2>
            <p className="composer-description">You are writing a post for {platform}.</p>
          </div>
        </div>

        <article className="platform-composer-card">
          <div className="platform-card-heading">
            <h3>{platform} post</h3>
            <CharacterCounter count={post.length} limit={limits[platform]} />
          </div>
          <textarea
            className="post-input"
            rows="8"
            maxLength={limits[platform]}
            placeholder={`Write your ${platform} post...`}
            value={post}
            onChange={handlePostChange}
          />
        </article>

        <div className="composer-footer">
          <ValidationMessage message={message} />
          <button className="publish-button" type="button" disabled={!post.trim()} onClick={() => setPublished(true)}>Publish {platform} post</button>
        </div>
        {published && <p className="success-message" role="status">Your {platform} post is ready to publish.</p>}
      </section>
    </div>
  );
}

export default PostComposer;
