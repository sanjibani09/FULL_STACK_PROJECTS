import { useState } from "react";
import PlatformSelector from "./platformselector";
import CharacterCounter from "./charactercounter";
import ValidationMessage from "./validatemessage";

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

function PostComposer() {
  const [platform, setPlatform] = useState("Twitter");
  const [posts, setPosts] = useState({});
  const [drafts, setDrafts] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState(null);
  const [draftFeedback, setDraftFeedback] = useState("");
  const [published, setPublished] = useState(false);
  const limits = { Twitter: 280, Facebook: 300, Instagram: 200, LinkedIn: 250 };
  const post = posts[platform] || "";

  const handlePostChange = (event) => {
    setPosts((currentPosts) => ({ ...currentPosts, [platform]: event.target.value }));
    setPublished(false);
  };

  const handlePlatformChange = (nextPlatform) => {
    setPlatform(nextPlatform);
    setPublished(false);
  };

  const handleSaveDraft = async () => {
    const content = post.trim();
    if (!content || isSavingDraft) return;

    setIsSavingDraft(true);
    setDraftFeedback("");
    await wait(500);

    const updatedAt = new Date().toISOString();
    if (editingDraftId) {
      setDrafts((currentDrafts) => currentDrafts.map((draft) => (
        draft.id === editingDraftId ? { ...draft, platform, content, updatedAt } : draft
      )));
      setDraftFeedback("Draft updated.");
    } else {
      setDrafts((currentDrafts) => [{
        id: crypto.randomUUID(),
        platform,
        content,
        updatedAt,
      }, ...currentDrafts]);
      setDraftFeedback("Draft saved.");
    }
    setIsSavingDraft(false);
  };

  const handleEditDraft = (draft) => {
    setPlatform(draft.platform);
    setPosts((currentPosts) => ({ ...currentPosts, [draft.platform]: draft.content }));
    setEditingDraftId(draft.id);
    setPublished(false);
    setDraftFeedback(`Editing ${draft.platform} draft.`);
  };

  const handleDeleteDraft = async (draftId) => {
    if (deletingDraftId) return;

    setDeletingDraftId(draftId);
    setDraftFeedback("");
    await wait(350);
    setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== draftId));
    if (editingDraftId === draftId) setEditingDraftId(null);
    setDeletingDraftId(null);
    setDraftFeedback("Draft deleted.");
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
          <div className="composer-actions">
            <button className="draft-button" type="button" disabled={!post.trim() || isSavingDraft} onClick={handleSaveDraft}>
              {isSavingDraft ? "Saving draft..." : editingDraftId ? "Update draft" : "Save draft"}
            </button>
            <button className="publish-button" type="button" disabled={!post.trim()} onClick={() => setPublished(true)}>Publish {platform} post</button>
          </div>
        </div>
        {published && <p className="success-message" role="status">Your {platform} post is ready to publish.</p>}

        <section className="drafts-section" aria-labelledby="drafts-heading">
          <div className="drafts-heading">
            <div>
              <h3 id="drafts-heading">Saved drafts</h3>
              <p>Save a post to return to it later.</p>
            </div>
            <span className="draft-count">{drafts.length}</span>
          </div>
          {draftFeedback && <p className="draft-feedback" role="status">{draftFeedback}</p>}
          {drafts.length === 0 ? (
            <p className="empty-drafts">No saved drafts yet.</p>
          ) : (
            <ul className="draft-list">
              {drafts.map((draft) => (
                <li className="draft-item" key={draft.id}>
                  <div className="draft-content">
                    <div className="draft-meta">
                      <span className="draft-platform">{draft.platform}</span>
                      <time dateTime={draft.updatedAt}>Updated {new Date(draft.updatedAt).toLocaleString()}</time>
                    </div>
                    <p>{draft.content}</p>
                  </div>
                  <div className="draft-actions">
                    <button type="button" className="draft-text-button" onClick={() => handleEditDraft(draft)}>Edit</button>
                    <button type="button" className="draft-text-button delete-draft-button" disabled={deletingDraftId === draft.id} onClick={() => handleDeleteDraft(draft.id)}>
                      {deletingDraftId === draft.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </div>
  );
}

export default PostComposer;
