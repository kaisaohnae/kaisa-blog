/**
 * One-shot: migrate workspace-study markdown into kaisa-blog/content/posts
 * Run: node scripts/migrate-posts-from-workspace.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = 'C:\\workspace-study';
const DEST_ROOT = path.join(BLOG_ROOT, 'content', 'posts');

/** @type {Record<string, {label: string, items: {src: string, kebab: string}[]}>} */
const CATALOG = {
  'spring-boot': {
    label: 'Spring Boot',
    items: [
      {src: 'Spring Boot 3와 Java 21 시작하기.md', kebab: 'spring-boot-3-java-21'},
      {src: 'IoC Bean Configuration 의존성 주입.md', kebab: 'ioc-bean-configuration'},
      {src: 'REST API 설계 Validation Problem Details RestClient.md', kebab: 'rest-api-validation-problem-details'},
      {src: 'Spring Data JPA와 영속성 계층.md', kebab: 'spring-data-jpa'},
      {src: 'Spring Security 6 인증 인가 OAuth2 JWT.md', kebab: 'spring-security-6'},
      {src: '테스트 JUnit5 MockMvc Testcontainers.md', kebab: 'testing-junit-testcontainers'},
      {src: 'Observability Actuator Micrometer OpenTelemetry.md', kebab: 'observability-actuator-otel'},
      {src: '비동기 메시징 Virtual Threads.md', kebab: 'async-messaging-virtual-threads'},
      {src: '캐시 Resilience 성능 최적화.md', kebab: 'cache-resilience-performance'},
      {src: '운영 배포 Docker Native 프로덕션 체크리스트.md', kebab: 'ops-docker-native'},
    ],
  },
  laravel: {
    label: 'Laravel',
    items: [
      {src: 'Laravel 11과 PHP 시작하기.md', kebab: 'laravel-11-modern-php'},
      {src: '라우팅 미들웨어 컨트롤러 요청 생명주기.md', kebab: 'routing-middleware-controller'},
      {src: 'Eloquent ORM과 데이터베이스.md', kebab: 'eloquent-orm'},
      {src: 'Validation Form Request API Resource.md', kebab: 'validation-form-request-resource'},
      {src: '인증 인가 Sanctum Policy Gate.md', kebab: 'auth-sanctum-policy'},
      {src: '테스트 PHPUnit Pest Feature 테스트.md', kebab: 'testing-pest'},
      {src: '큐 Job 이벤트 스케줄링.md', kebab: 'queue-job-events'},
      {src: '캐시 Redis 성능 최적화.md', kebab: 'cache-redis-performance'},
      {src: 'Blade Livewire Inertia 프론트 전략.md', kebab: 'blade-livewire-inertia'},
      {src: '운영 배포 Sail Forge 프로덕션 체크리스트.md', kebab: 'ops-sail-forge'},
    ],
  },
  'react-native': {
    label: 'React Native',
    items: [
      {src: 'React Native와 Expo로 시작하기.md', kebab: 'react-native-expo'},
      {src: '컴포넌트 스타일 레이아웃 Flex StyleSheet.md', kebab: 'components-style-layout'},
      {src: '상태 훅 폼 사용자 입력.md', kebab: 'state-hooks-forms'},
      {src: '리스트 네비게이션 FlatList Expo Router.md', kebab: 'lists-navigation-expo-router'},
      {src: '네트워킹 Fetch React Query 에러 처리.md', kebab: 'networking-react-query'},
      {src: '인증 보안저장소 디바이스 권한.md', kebab: 'auth-secure-store-permissions'},
      {src: '애니메이션 제스처 UX.md', kebab: 'animation-gesture-ux'},
      {src: '상태관리 아키텍처 모듈화.md', kebab: 'state-architecture'},
      {src: '테스트 디버깅 성능.md', kebab: 'testing-debug-performance'},
      {src: 'EAS 빌드 스토어 배포 OTA.md', kebab: 'eas-build-store-ota'},
    ],
  },
};

function extractTitleAndSummary(raw) {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/);
  let title = '';
  let summary = '';
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!title && line.startsWith('# ')) {
      title = line.slice(2).trim();
      bodyStart = i;
      continue;
    }
    if (title && !summary) {
      const m = line.match(/^>\s*요약:\s*(.+)$/);
      if (m) {
        summary = m[1].trim();
        bodyStart = i + 1;
        // skip following ---
        if (lines[bodyStart]?.trim() === '---') bodyStart += 1;
        while (lines[bodyStart]?.trim() === '') bodyStart += 1;
        break;
      }
    }
  }

  if (!title) title = 'Untitled';
  const body = lines.slice(bodyStart).join('\n').trimStart();
  return {title, summary, body};
}

function readingMinutes(text) {
  const words = text.replace(/\s+/g, ' ').trim().length;
  return Math.max(1, Math.ceil(words / 900));
}

fs.mkdirSync(DEST_ROOT, {recursive: true});

const manifest = [];

for (const [category, {label, items}] of Object.entries(CATALOG)) {
  const destDir = path.join(DEST_ROOT, category);
  fs.mkdirSync(destDir, {recursive: true});

  items.forEach((item, index) => {
    const nn = String(index + 1).padStart(2, '0');
    const srcPath = path.join(SOURCE_ROOT, category, item.src);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing source: ${srcPath}`);
    }
    const raw = fs.readFileSync(srcPath, 'utf8');
    const {title, summary, body} = extractTitleAndSummary(raw);
    const slug = `${category}-${nn}`;
    const fileName = `${nn}-${item.kebab}.md`;
    const publishedAt = '2026-08-26';
    const frontmatter = [
      '---',
      `slug: ${slug}`,
      `order: ${index + 1}`,
      `category: ${category}`,
      `categoryLabel: ${label}`,
      `title: ${JSON.stringify(title)}`,
      `summary: ${JSON.stringify(summary || title)}`,
      `publishedAt: ${publishedAt}`,
      `tags: [${JSON.stringify(category)}]`,
      '---',
      '',
      `# ${title}`,
      '',
      summary ? `> 요약: ${summary}` : '',
      summary ? '' : '',
      '---',
      '',
      body.trim(),
      '',
    ]
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(path.join(destDir, fileName), frontmatter, 'utf8');
    manifest.push({
      category,
      order: index + 1,
      slug,
      file: `${category}/${fileName}`,
      title,
      readingMinutes: readingMinutes(body),
    });
    console.log(`OK ${slug} <- ${item.src}`);
  });
}

fs.writeFileSync(
  path.join(DEST_ROOT, 'manifest.json'),
  JSON.stringify({generatedAt: new Date().toISOString(), posts: manifest}, null, 2),
  'utf8',
);

console.log(`\nMigrated ${manifest.length} posts -> ${DEST_ROOT}`);
