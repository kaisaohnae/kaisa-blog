import fs from 'node:fs';
import path from 'node:path';

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  readingMinutes: number;
  order: number;
  filePath: string;
};

const POSTS_ROOT = path.join(process.cwd(), 'content', 'posts');

const CATEGORY_LABELS: Record<string, string> = {
  'spring-boot': 'Spring Boot',
  laravel: 'Laravel',
  'react-native': 'React Native',
  nextjs: 'Next.js',
  aws: 'AWS',
  'html-css': 'HTML/CSS',
  nginx: 'Nginx',
  db: 'DB',
  vue: 'Vue',
  angular: 'Angular',
  flutter: 'Flutter',
  wpf: 'WPF',
};

function parseFrontmatter(raw: string): {data: Record<string, string>; body: string} {
  const text = raw.replace(/^\uFEFF/, '');
  if (!text.startsWith('---')) {
    return {data: {}, body: text};
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    return {data: {}, body: text};
  }
  const fm = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\s*\n/, '');
  const data: Record<string, string> = {};
  for (const line of fm.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return {data, body};
}

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (!inner) return [];
  return inner
    .split(',')
    .map((part) => part.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function readingMinutes(text: string): number {
  return Math.max(1, Math.ceil(text.replace(/\s+/g, ' ').trim().length / 900));
}

function loadAllPosts(): BlogPost[] {
  if (!fs.existsSync(POSTS_ROOT)) return [];

  const posts: BlogPost[] = [];
  const categories = fs
    .readdirSync(POSTS_ROOT, {withFileTypes: true})
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const dir = path.join(POSTS_ROOT, category);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const {data, body} = parseFrontmatter(raw);
      const orderMatch = file.match(/^(\d+)-/);
      const order = Number(data.order || orderMatch?.[1] || 0);
      const slug = data.slug || `${category}-${String(order).padStart(2, '0')}`;
      const title =
        data.title ||
        body.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
        file.replace(/\.md$/, '');
      const summaryMatch = body.match(/^>\s*요약:\s*(.+)$/m);
      const excerpt = data.summary || summaryMatch?.[1]?.trim() || title;
      const categoryLabel =
        data.categoryLabel || CATEGORY_LABELS[category] || category;

      posts.push({
        slug,
        title,
        excerpt,
        content: body,
        publishedAt: data.publishedAt || '2026-08-26',
        category: data.category || category,
        categoryLabel,
        tags: parseTags(data.tags).length ? parseTags(data.tags) : [category],
        readingMinutes: readingMinutes(body),
        order,
        filePath: path.posix.join(category, file),
      });
    }
  }

  return posts.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.order - b.order;
  });
}

let cache: BlogPost[] | null = null;

export function getAllBlogPosts(): BlogPost[] {
  // Dev: always re-read so new/edited markdown shows up without restart.
  if (process.env.NODE_ENV === 'development') {
    return loadAllPosts();
  }
  if (!cache) cache = loadAllPosts();
  return cache;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}

/** Same-category neighbors by `order`. Missing side is omitted by callers. */
export function getAdjacentBlogPosts(slug: string): {
  prev: BlogPost | null;
  next: BlogPost | null;
} {
  const post = getBlogPost(slug);
  if (!post) return {prev: null, next: null};

  const siblings = getBlogPostsByCategory(post.category);
  const index = siblings.findIndex((item) => item.slug === slug);
  if (index < 0) return {prev: null, next: null};

  return {
    prev: index > 0 ? siblings[index - 1] : null,
    next: index < siblings.length - 1 ? siblings[index + 1] : null,
  };
}

export function getBlogPostSlugs(): string[] {
  return getAllBlogPosts().map((post) => post.slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.category === category);
}

export function getBlogCategories(): {id: string; label: string; count: number}[] {
  const map = new Map<string, {id: string; label: string; count: number}>();
  for (const post of getAllBlogPosts()) {
    const current = map.get(post.category);
    if (current) {
      current.count += 1;
    } else {
      map.set(post.category, {
        id: post.category,
        label: post.categoryLabel,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}
