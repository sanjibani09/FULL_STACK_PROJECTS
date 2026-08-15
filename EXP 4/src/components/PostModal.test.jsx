import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PostModal from './PostModal';

const post = {
  id: 'post-1',
  title: 'Launch announcement',
  platform: 'Instagram',
  status: 'scheduled',
  start: new Date('2026-08-20T09:00:00'),
  end: new Date('2026-08-20T09:30:00'),
  notes: '',
};

describe('PostModal', () => {
  it('shows validation feedback when the end time is before the start time', async () => {
    const user = userEvent.setup();
    render(<PostModal post={post} mode="edit" onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />);

    await user.clear(screen.getByLabelText('End'));
    await user.type(screen.getByLabelText('End'), '2026-08-20T08:30');
    await user.click(screen.getByRole('button', { name: 'Save post' }));

    expect(screen.getByRole('alert')).toHaveTextContent('End time must be later than the start time.');
  });

  it('saves edited values and supports deleting a post', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onDelete = vi.fn();
    render(<PostModal post={post} mode="edit" onClose={vi.fn()} onSave={onSave} onDelete={onDelete} />);

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated launch announcement');
    await user.click(screen.getByRole('button', { name: 'Save post' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'post-1', title: 'Updated launch announcement' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('post-1');
  });
});
