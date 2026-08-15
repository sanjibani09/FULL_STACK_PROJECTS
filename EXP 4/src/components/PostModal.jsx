import { memo, useCallback, useState } from 'react';
import { PLATFORM_COLORS } from '../data/samplePosts';

function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = (value) => String(value).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PostModal({ post, mode, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...post, start: toLocalInputValue(post.start), end: toLocalInputValue(post.end) });
  const [error, setError] = useState('');
  const handleChange = useCallback((field) => (event) => { setError(''); setForm((current) => ({ ...current, [field]: event.target.value })); }, []);
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (new Date(form.end) <= new Date(form.start)) { setError('End time must be later than the start time.'); return; }
    onSave({ ...post, ...form, start: new Date(form.start), end: new Date(form.end), color: PLATFORM_COLORS[form.platform] });
  }, [form, onSave, post]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="post-modal-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="post-modal-title">{mode === 'create' ? 'Schedule a new post' : 'Edit scheduled post'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Title<input type="text" required value={form.title} onChange={handleChange('title')} placeholder="e.g. Product launch teaser" /></label>
          <label>Platform<select value={form.platform} onChange={handleChange('platform')}>{Object.keys(PLATFORM_COLORS).map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={handleChange('status')}><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option></select></label>
          <div className="row"><label>Start<input type="datetime-local" required value={form.start} onChange={handleChange('start')} /></label><label>End<input type="datetime-local" required value={form.end} onChange={handleChange('end')} /></label></div>
          <label>Notes / caption brief<textarea rows={3} value={form.notes} onChange={handleChange('notes')} placeholder="Caption ideas, links, tags..." /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">{mode === 'edit' && <button type="button" className="danger" onClick={() => onDelete(post.id)}>Delete</button>}<div className="spacer" /><button type="button" onClick={onClose}>Cancel</button><button type="submit" className="primary">Save post</button></div>
        </form>
      </div>
    </div>
  );
}

export default memo(PostModal);
