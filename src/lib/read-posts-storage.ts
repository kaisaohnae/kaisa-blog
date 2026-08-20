export const READ_POSTS_KEY = 'kaisa_blog_read_posts';

export type ReadPostRecord = {
  postNo: number;
  slug: string;
};

function readRecords(): ReadPostRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_POSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ReadPostRecord =>
        item &&
        typeof item === 'object' &&
        typeof item.postNo === 'number' &&
        typeof item.slug === 'string',
    );
  } catch {
    return [];
  }
}

function writeRecords(records: ReadPostRecord[]) {
  localStorage.setItem(READ_POSTS_KEY, JSON.stringify(records));
}

export function isPostRead(target: {postNo?: number; slug?: string}) {
  const records = readRecords();
  if (target.postNo != null) {
    return records.some((item) => item.postNo === target.postNo);
  }
  if (target.slug) {
    return records.some((item) => item.slug === target.slug);
  }
  return false;
}

export function markPostAsRead(postNo: number, slug: string) {
  const records = readRecords();
  if (records.some((item) => item.postNo === postNo)) return;
  writeRecords([...records, {postNo, slug}]);
}

export function getReadPosts(): ReadPostRecord[] {
  return readRecords();
}
