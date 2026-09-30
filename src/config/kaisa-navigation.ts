/**
 * kaisa-blog header navigation — this site only (headers are no longer shared across kaisa sites).
 * The logo and the single menu item both point to this site's home.
 */
export type KaisaSite = 'blog';

export const KAISA_NAV = [
  {id: 'blog', label: 'Blog', href: '/'}
] as const;
export const KAISA_HOME_URL = '/';
export function activeKaisaNav(site: KaisaSite, _pathname: string) {
  return site;
}

export const KAISA_NAV_LABELS = {
  en: {blog: 'BLOG'},
  ko: {blog: '블로그'},
  zh: {blog: '博客'},
  hi: {blog: 'ब्लॉग'}
} as const;
