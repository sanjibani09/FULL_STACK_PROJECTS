const PLATFORM_WINDOWS = {
  Instagram: { days: [1, 2, 3, 4], start: 11, end: 14, alternative: '11 AM - 2 PM on a weekday' },
  Twitter: { days: [1, 2, 3, 4, 5], start: 9, end: 12, alternative: '9 AM - 12 PM on a weekday' },
  LinkedIn: { days: [2, 3, 4], start: 8, end: 11, alternative: 'Tuesday - Thursday, 8 AM - 11 AM' },
  Facebook: { days: [1, 2, 3, 4, 5], start: 13, end: 16, alternative: '1 PM - 4 PM on a weekday' },
};

export function getSchedulingInsight(post, start) {
  const scheduledAt = new Date(start);
  const preferredAt = post.preferredStart ? new Date(post.preferredStart) : null;
  const matchesPreferredDate = preferredAt && preferredAt.getFullYear() === scheduledAt.getFullYear() && preferredAt.getMonth() === scheduledAt.getMonth() && preferredAt.getDate() === scheduledAt.getDate();
  if (matchesPreferredDate) {
    return { ...post, scheduledAt, score: 'great', label: 'Good to go', message: 'This matches your original preferred publishing date.', alternative: 'Your saved preferred date', preference: 94 };
  }
  const window = PLATFORM_WINDOWS[post.platform] || PLATFORM_WINDOWS.Instagram;
  const inDayRange = window.days.includes(scheduledAt.getDay());
  const hour = scheduledAt.getHours() + scheduledAt.getMinutes() / 60;
  const idealHour = (window.start + window.end) / 2;
  const timeScore = Math.max(0, 100 - Math.abs(hour - idealHour) * 12);
  const dayScore = inDayRange ? 100 : 20;
  const preference = Math.round((timeScore * 0.6) + (dayScore * 0.4));
  const score = preference >= 75 ? 'great' : preference >= 50 ? 'fair' : 'poor';
  const label = score === 'great' ? 'Good to go' : score === 'fair' ? 'Decent reach' : 'Consider a better time';
  const message = score === 'great' ? `This is a strong engagement time for ${post.platform}.` : score === 'fair' ? `This is usable, but moving closer to the best window should improve reach.` : `This timing is unlikely to catch your audience at its most active.`;
  return { ...post, scheduledAt, score, label, message, alternative: window.alternative, preference };
}
