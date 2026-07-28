import React from 'react';
import PostsList from './features/posts/PostsList';
import PlatformsList from './features/platforms/PlatformsList';

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Content workspace</p>
        <h1>Posts &amp; Platforms</h1>
        <p>Organize the channels you publish to and keep every post in one place.</p>
      </header>

      <section className="workspace" aria-label="Content management workspace">
        <PlatformsList />
        <PostsList />
      </section>
    </main>
  );
}

export default App;
