import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNowStrict, format, isThisWeek, differenceInHours } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function formatDate(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const hoursAgo = differenceInHours(now, targetDate);

  // For times less than 24 hours ago
  if (hoursAgo < 24) {
    if (hoursAgo < 1) {
      return 'Recently';
    }
    return `${hoursAgo} ${hoursAgo === 1 ? 'hour ago' : 'hours ago'}`;
  }

  // For times less than a week ago
  if (isThisWeek(targetDate, { weekStartsOn: 1 })) {
    return formatDistanceToNowStrict(targetDate, { addSuffix: true });
  }

  // For older dates
  return format(targetDate, 'MMM d, yyyy');
}
