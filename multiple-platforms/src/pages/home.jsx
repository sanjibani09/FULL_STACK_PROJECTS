import PostComposer from "../components/postcomposer";
import { useEffect, useState } from "react";

function Home({ user, authMessage }) {
  const [showMessage, setShowMessage] = useState(Boolean(authMessage));

  useEffect(() => {
    setShowMessage(Boolean(authMessage));
    if (!authMessage) return undefined;
    const timeout = window.setTimeout(() => setShowMessage(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [authMessage]);

  return (
    <div className="page">
      {showMessage && (
        <div className="auth-notification" role="status">
          <span>✓</span>
          <div><strong>Welcome, {user?.name}!</strong><br />{authMessage}</div>
          <button type="button" aria-label="Close message" onClick={() => setShowMessage(false)}>×</button>
        </div>
      )}
      <section className="hero">
        <div className="eyebrow">Social Media Publishing Platform</div>
        <h1>{user ? `Hello, ${user.name}.` : "Platform for everyone."}</h1>
        <p>Create a post, choose your platforms, and keep every message within its character limit.</p>
      </section>
      <PostComposer />
    </div>
  );
}

export default Home;
