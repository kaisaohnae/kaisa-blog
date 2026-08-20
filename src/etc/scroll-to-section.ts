export type PortfolioSection = 'home' | 'works' | 'illustration';

const SECTION_IDS: Record<PortfolioSection, string> = {
  home: 'home',
  works: 'works',
  illustration: 'illustration',
};

export const PORTFOLIO_PATHS = ['/', '/works', '/works/', '/illustration', '/illustration/'];

export function scrollToSection(section: PortfolioSection, behavior: ScrollBehavior = 'smooth') {
  const id = SECTION_IDS[section];
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({behavior, block: 'start'});
}

export function isPortfolioPath(pathname: string | null) {
  if (!pathname) return false;
  return PORTFOLIO_PATHS.includes(pathname);
}
