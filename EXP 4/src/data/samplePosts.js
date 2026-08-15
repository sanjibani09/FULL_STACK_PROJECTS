import { v4 as uuid } from 'uuid';

const PLATFORM_COLORS = {
  Instagram: '#E1306C',
  Twitter: '#1DA1F2',
  LinkedIn: '#0A66C2',
  Facebook: '#1877F2',
};

function today(dayOffset, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const seedPosts = [
  {
    id: uuid(),
    title: 'Product launch teaser',
    platform: 'Instagram',
    status: 'scheduled',
    start: today(1, 9),
    end: today(1, 9, 30),
    notes: 'Carousel post with 3 slides.',
    color: PLATFORM_COLORS.Instagram,
  },
  {
    id: uuid(),
    title: 'Weekly newsletter thread',
    platform: 'Twitter',
    status: 'draft',
    start: today(2, 14),
    end: today(2, 14, 30),
    notes: 'Summarize blog post in 5 tweets.',
    color: PLATFORM_COLORS.Twitter,
  },
  {
    id: uuid(),
    title: 'Hiring announcement',
    platform: 'LinkedIn',
    status: 'scheduled',
    start: today(4, 11),
    end: today(4, 11, 30),
    notes: 'Tag careers page.',
    color: PLATFORM_COLORS.LinkedIn,
  },
];

export { PLATFORM_COLORS };