const PLATFORM_PROFILES = {
  Instagram: { idealHour: 12.5, days: [62, 86, 94, 100, 96, 82, 70], window: 'Tuesday - Thursday, 11 AM - 2 PM' },
  Twitter: { idealHour: 10.5, days: [60, 88, 94, 96, 90, 78, 65], window: 'Tuesday - Thursday, 9 AM - 12 PM' },
  LinkedIn: { idealHour: 9.5, days: [44, 90, 98, 100, 94, 76, 42], window: 'Tuesday - Thursday, 8 AM - 11 AM' },
  Facebook: { idealHour: 14, days: [68, 84, 92, 94, 90, 80, 72], window: 'Tuesday - Thursday, 1 PM - 4 PM' },
};

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

function isSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function getSchedulingInsight(post, start, allPosts = [], end) {
  const scheduledAt = new Date(start);
  const duration = new Date(post.end).getTime() - new Date(post.start).getTime();
  const scheduledEnd = end ? new Date(end) : new Date(scheduledAt.getTime() + (duration || 30 * 60000));

  const profile = PLATFORM_PROFILES[post.platform] || PLATFORM_PROFILES.Instagram;
  const hour = scheduledAt.getHours() + scheduledAt.getMinutes() / 60;
  const dayScore = profile.days[scheduledAt.getDay()];
  const timeScore = clamp(100 - Math.abs(hour - profile.idealHour) * 11);

  // Any other post landing on the SAME DAY counts as a clash, not just exact time overlap
  const conflicts = allPosts.filter((item) => {
    if (item.id === post.id) return false;
    return isSameDay(scheduledAt, new Date(item.start)) ||
      rangesOverlap(scheduledAt, scheduledEnd, new Date(item.start), new Date(item.end));
  });

  const nearbyPosts = allPosts.filter((item) => {
    if (item.id === post.id) return false;
    const differenceInHours = Math.abs(new Date(item.start).getTime() - scheduledAt.getTime()) / 3600000;
    return differenceInHours < 3;
  });
  const samePlatformPosts = nearbyPosts.filter((item) => item.platform === post.platform).length;
  const capacityScore = clamp(100 - nearbyPosts.length * 16 - samePlatformPosts * 12 - conflicts.length * 25);

  const preferredAt = post.preferredStart ? new Date(post.preferredStart) : null;
  const matchesPreferredDate = preferredAt && preferredAt.getFullYear() === scheduledAt.getFullYear() && preferredAt.getMonth() === scheduledAt.getMonth() && preferredAt.getDate() === scheduledAt.getDate();
  const preference = clamp(dayScore * 0.36 + timeScore * 0.44 + capacityScore * 0.2 + (matchesPreferredDate ? 5 : 0));

  const hasConflict = conflicts.length > 0;
  const score = hasConflict ? 'poor' : preference >= 78 ? 'great' : preference >= 55 ? 'fair' : 'poor';
  const label = hasConflict ? `Clashes with ${conflicts.length} post${conflicts.length > 1 ? 's' : ''}` : score === 'great' ? 'Good to go' : score === 'fair' ? 'Decent reach' : 'Consider a better time';

  const weakestFactor = [
    { name: 'day', value: dayScore },
    { name: 'time', value: timeScore },
    { name: 'capacity', value: capacityScore },
  ].sort((a, b) => a.value - b.value)[0];

  const message = hasConflict
    ? `This shares a day with: ${conflicts.map((c) => c.title).join(', ')}.`
    : score === 'great'
      ? `This slot has a strong ${post.platform} audience pattern and a clear publishing window.`
      : weakestFactor.name === 'capacity'
        ? 'Nearby posts may compete for attention. Spacing this content out could improve reach.'
        : weakestFactor.name === 'day'
          ? `${scheduledAt.toLocaleDateString([], { weekday: 'long' })} is a weaker day for ${post.platform} engagement.`
          : `This time is outside the usual high-attention period for ${post.platform}.`;

  return {
    ...post,
    scheduledAt,
    scheduledEnd,
    score,
    label,
    message,
    alternative: profile.window,
    preference,
    hasConflict,
    conflicts,
    factors: [
      { label: 'Audience day', value: dayScore },
      { label: 'Posting time', value: timeScore },
      { label: 'Content spacing', value: capacityScore },
    ],
  };
}