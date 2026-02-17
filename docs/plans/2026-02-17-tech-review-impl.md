# Tech Review 자동화 블로그 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Perplexity 리서치 이메일을 자동 파싱하여 Jekyll 블로그에 게시하고, 포트폴리오 Writing 섹션에 최근 글을 표시하는 하이브리드 시스템 구축.

**Architecture:** Jekyll(GitHub Pages) 블로그가 전체 아카이브를 담당하고, Google Apps Script가 Gmail에서 Perplexity 메일을 감지하여 GitHub Actions를 트리거. GitHub Actions가 포스트를 생성/빌드/배포. 포트폴리오 React 앱은 블로그의 feed.json을 런타임 fetch하여 최근 글 카드를 렌더링.

**Tech Stack:** Jekyll + GitHub Pages, Google Apps Script, GitHub Actions, Claude API, React + Vite (포트폴리오)

---

## Phase 1: Jekyll Blog Setup

### Task 1: Jekyll 프로젝트 초기화

**Files:**
- Create: `tech-review/_config.yml`
- Create: `tech-review/Gemfile`
- Create: `tech-review/.gitignore`
- Create: `tech-review/index.html`

**Step 1: GitHub 레포 생성**

```bash
gh repo create paulseongminpark/tech-review --public --clone
cd tech-review
```

**Step 2: Jekyll 기본 설정 파일 생성**

`_config.yml`:
```yaml
title: Tech Review
description: Daily tech trend analysis
url: "https://paulseongminpark.github.io"
baseurl: "/tech-review"
markdown: kramdown
permalink: /:categories/:year/:month/:day/:title/

defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
```

`Gemfile`:
```ruby
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
```

`.gitignore`:
```
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
vendor/
```

**Step 3: 루트 index.html (언어 감지 리다이렉트)**

`index.html`:
```html
---
layout: null
---
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    (function() {
      var saved = localStorage.getItem('tech-review-lang');
      var lang = saved || (navigator.language.startsWith('ko') ? 'ko' : 'en');
      window.location.replace('{{ site.baseurl }}/' + lang + '/');
    })();
  </script>
</head>
<body></body>
</html>
```

**Step 4: 커밋**

```bash
git add -A
git commit -m "[tech-review] Jekyll 프로젝트 초기화"
```

---

### Task 2: 레이아웃 및 i18n 구조

**Files:**
- Create: `tech-review/_layouts/default.html`
- Create: `tech-review/_layouts/post.html`
- Create: `tech-review/_includes/lang-toggle.html`
- Create: `tech-review/ko/index.html`
- Create: `tech-review/en/index.html`

**Step 1: default 레이아웃**

`_layouts/default.html`:
```html
<!DOCTYPE html>
<html lang="{{ page.lang | default: 'en' }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ page.title }} | {{ site.title }}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, 'Noto Sans KR', sans-serif; max-width: 720px; margin: 0 auto; padding: 2rem 1rem; color: #1a1a1a; line-height: 1.7; }
    a { color: #0066cc; text-decoration: none; }
    .lang-toggle { position: fixed; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; }
    .lang-toggle a { padding: 0.25rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.85rem; }
    .lang-toggle a.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
    .post-list { list-style: none; }
    .post-list li { padding: 1rem 0; border-bottom: 1px solid #eee; }
    .post-meta { color: #666; font-size: 0.85rem; }
    .post-tags { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .post-tags span { background: #f0f0f0; padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.8rem; }
    h1 { margin-bottom: 1.5rem; }
    h2 { margin: 1.5rem 0 0.5rem; font-size: 1.1rem; }
    .content p { margin: 0.5rem 0; }
  </style>
</head>
<body>
  {% include lang-toggle.html %}
  {{ content }}
</body>
</html>
```

**Step 2: 포스트 레이아웃**

`_layouts/post.html`:
```html
---
layout: default
---
<article>
  <header>
    <p class="post-meta">{{ page.date | date: "%Y-%m-%d" }}</p>
    <h1>{{ page.title }}</h1>
    <div class="post-tags">
      {% for tag in page.tags %}<span>{{ tag }}</span>{% endfor %}
    </div>
  </header>
  <div class="content">
    {{ content }}
  </div>
  <footer style="margin-top:2rem; padding-top:1rem; border-top:1px solid #eee;">
    <a href="{{ site.baseurl }}/{{ page.lang }}/">&larr; {{ page.lang == 'ko' | default: false | ternary: '목록으로', 'Back to list' }}</a>
  </footer>
</article>
```

**Step 3: 언어 토글**

`_includes/lang-toggle.html`:
```html
{% assign current_lang = page.lang | default: page.url | split: '/' | last %}
{% if page.pair %}
  {% assign other_lang = 'en' %}
  {% if page.lang == 'en' %}{% assign other_lang = 'ko' %}{% endif %}
  {% assign paired = site.posts | where: "pair", page.pair | where: "lang", other_lang | first %}
  <div class="lang-toggle">
    <a href="{{ site.baseurl }}/ko/" {% if page.lang == 'ko' %}class="active"{% endif %} onclick="localStorage.setItem('tech-review-lang','ko')">KO</a>
    <a href="{{ site.baseurl }}/en/" {% if page.lang == 'en' %}class="active"{% endif %} onclick="localStorage.setItem('tech-review-lang','en')">EN</a>
  </div>
{% else %}
  <div class="lang-toggle">
    <a href="{{ site.baseurl }}/ko/" {% if page.url contains '/ko' %}class="active"{% endif %} onclick="localStorage.setItem('tech-review-lang','ko')">KO</a>
    <a href="{{ site.baseurl }}/en/" {% if page.url contains '/en' %}class="active"{% endif %} onclick="localStorage.setItem('tech-review-lang','en')">EN</a>
  </div>
{% endif %}
```

**Step 4: 언어별 인덱스 페이지**

`ko/index.html`:
```html
---
layout: default
title: Tech Review
lang: ko
---
<h1>Tech Review</h1>
<ul class="post-list">
  {% assign ko_posts = site.posts | where: "lang", "ko" %}
  {% for post in ko_posts %}
  <li>
    <p class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
    <a href="{{ post.url | prepend: site.baseurl }}"><strong>{{ post.title }}</strong></a>
    <div class="post-tags">
      {% for tag in post.tags %}<span>{{ tag }}</span>{% endfor %}
    </div>
  </li>
  {% endfor %}
</ul>
```

`en/index.html`:
```html
---
layout: default
title: Tech Review
lang: en
---
<h1>Tech Review</h1>
<ul class="post-list">
  {% assign en_posts = site.posts | where: "lang", "en" %}
  {% for post in en_posts %}
  <li>
    <p class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
    <a href="{{ post.url | prepend: site.baseurl }}"><strong>{{ post.title }}</strong></a>
    <div class="post-tags">
      {% for tag in post.tags %}<span>{{ tag }}</span>{% endfor %}
    </div>
  </li>
  {% endfor %}
</ul>
```

**Step 5: 커밋**

```bash
git add -A
git commit -m "[tech-review] 레이아웃 및 i18n 구조 추가"
```

---

### Task 3: 샘플 포스트 작성

**Files:**
- Create: `tech-review/_posts/ko/2026-02-17-ai-agent-trends.md`
- Create: `tech-review/_posts/en/2026-02-17-ai-agent-trends.md`

**Step 1: KO 샘플 포스트**

`_posts/ko/2026-02-17-ai-agent-trends.md`:
```markdown
---
layout: post
title: "멀티에이전트 오케스트레이션 가속화"
date: 2026-02-17
lang: ko
pair: 2026-02-17-ai-agent-trends
tags: [ai, agent, orchestration]
---

## Industry
Tech / AI Infrastructure

## Who
Anthropic, OpenAI, Google DeepMind

## What
Anthropic Claude Opus 4.6이 100만 토큰 컨텍스트와 멀티에이전트 팀 기능을 출시. OpenAI는 Frontier 엔터프라이즈 에이전트 플랫폼과 Snowflake 2억 달러 파트너십을 발표.

## When
2026년 2월 둘째 주

## Why
단일 LLM 챗봇에서 역할 분리된 멀티에이전트 팀 구조로의 전환이 가속. 에이전트 오케스트레이션 레이어가 필수 인프라로 부상.

## How
에이전트 팀이 프로젝트를 분할/협업하는 워크플로. Snowflake 데이터 클라우드에 네이티브 통합되어 거버넌스된 데이터 위에서 에이전트가 추론/분석/결정 수행.

## So?
결국 미들웨어 시장이 "에이전트 오케스트레이터"로 재편된다. 단일 모델 API 래퍼 비즈니스는 끝.

## Source
https://www.marketingprofs.com/opinions/2026/54257/ai-update-february-6-2026

## Comments
- **산업 연관성**: 에이전트 오케스트레이터가 미들웨어 시장을 새로 만들 것
- **직무 연관성**: 멀티에이전트 설계 경험이 곧 필수 역량
- **자소서/면접**: "왜 단일 모델이 아니라 에이전트 팀인가" 질문 대비
```

**Step 2: EN 샘플 포스트**

`_posts/en/2026-02-17-ai-agent-trends.md`:
```markdown
---
layout: post
title: "Multi-Agent Orchestration Accelerates"
date: 2026-02-17
lang: en
pair: 2026-02-17-ai-agent-trends
tags: [ai, agent, orchestration]
---

## Industry
Tech / AI Infrastructure

## Who
Anthropic, OpenAI, Google DeepMind

## What
Anthropic's Claude Opus 4.6 ships 1M token context and multi-agent team capabilities. OpenAI announces Frontier enterprise agent platform with $200M Snowflake partnership.

## When
Week of Feb 10, 2026

## Why
The shift from single-LLM chatbots to role-separated multi-agent team architectures is accelerating. Agent orchestration layers are becoming essential infrastructure.

## How
Agent teams divide and collaborate on projects as workflows. Native integration with Snowflake data cloud enables agents to reason, analyze, and decide on governed data.

## So?
The middleware market is being reshaped into "agent orchestrators." Single-model API wrapper businesses are done.

## Source
https://www.marketingprofs.com/opinions/2026/54257/ai-update-february-6-2026

## Comments
- **Industry relevance**: Agent orchestrators will create a new middleware market
- **Role relevance**: Multi-agent design experience becomes a must-have skill
- **Interview prep**: Be ready for "Why agent teams instead of single models?"
```

**Step 3: 커밋**

```bash
git add -A
git commit -m "[tech-review] 샘플 포스트 KO/EN 추가"
```

---

### Task 4: feed.json 생성

**Files:**
- Create: `tech-review/feed.json`

**Step 1: Liquid 기반 feed.json**

`feed.json`:
```liquid
---
layout: null
---
{
  "posts": [
    {%- assign pairs = site.posts | map: "pair" | uniq -%}
    {%- assign count = 0 -%}
    {%- for p in pairs -%}
      {%- if count >= 5 -%}{%- break -%}{%- endif -%}
      {%- assign ko_post = site.posts | where: "pair", p | where: "lang", "ko" | first -%}
      {%- assign en_post = site.posts | where: "pair", p | where: "lang", "en" | first -%}
      {%- if ko_post and en_post -%}
        {%- if count > 0 -%},{%- endif -%}
        {
          "date": "{{ ko_post.date | date: '%Y-%m-%d' }}",
          "pair": "{{ p }}",
          "title": {
            "ko": {{ ko_post.title | jsonify }},
            "en": {{ en_post.title | jsonify }}
          },
          "tags": {{ ko_post.tags | jsonify }},
          "url": {
            "ko": "{{ ko_post.url | prepend: site.baseurl }}",
            "en": "{{ en_post.url | prepend: site.baseurl }}"
          }
        }
        {%- assign count = count | plus: 1 -%}
      {%- endif -%}
    {%- endfor -%}
  ]
}
```

**Step 2: 커밋**

```bash
git add feed.json
git commit -m "[tech-review] feed.json Liquid 템플릿 추가"
```

---

### Task 5: GitHub Pages 배포

**Files:**
- Create: `tech-review/.github/workflows/deploy.yml`

**Step 1: GitHub Actions 워크플로**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy Jekyll to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/jekyll-build-pages@v1
        with:
          source: ./
          destination: ./_site
      - uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: GitHub 레포 설정에서 Pages 소스를 "GitHub Actions"로 변경**

```bash
gh api repos/paulseongminpark/tech-review/pages -X PUT -f build_type=workflow
```

**Step 3: push 및 배포 확인**

```bash
git add -A
git commit -m "[tech-review] GitHub Pages 배포 워크플로 추가"
git push -u origin main
```

Expected: `https://paulseongminpark.github.io/tech-review/` 에서 언어 감지 후 리다이렉트 확인

---

## Phase 2: Automation Pipeline

### Task 6: Google Apps Script 작성

**Files:**
- Create: Google Apps Script 프로젝트 (script.google.com)

**Step 1: GAS 코드 작성**

`Code.gs`:
```javascript
function checkPerplexityEmails() {
  var threads = GmailApp.search('from:perplexity is:unread newer_than:1d');

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    var msg = messages[messages.length - 1];
    var body = msg.getPlainBody();
    var subject = msg.getSubject();

    var lang = /[가-힣]/.test(body.substring(0, 200)) ? 'ko' : 'en';
    var date = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');

    triggerGitHubAction(lang, body, date, subject);
    msg.markRead();
  });
}

function triggerGitHubAction(lang, content, date, subject) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  var url = 'https://api.github.com/repos/paulseongminpark/tech-review/dispatches';

  var payload = {
    event_type: 'new-review',
    client_payload: {
      lang: lang,
      content: content,
      date: date,
      subject: subject
    }
  };

  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    },
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}
```

**Step 2: GAS 트리거 설정**

- script.google.com에서 시간 기반 트리거 추가
- `checkPerplexityEmails` 함수를 매 30분마다 실행
- Script Properties에 `GITHUB_TOKEN` 설정 (repo scope PAT)

**Step 3: 테스트**

- Perplexity에서 테스트 메일 수신
- GAS 실행 → GitHub Actions 트리거 확인

---

### Task 7: GitHub Actions - 포스트 자동 생성

**Files:**
- Create: `tech-review/.github/workflows/create-post.yml`
- Create: `tech-review/scripts/parse-content.js`
- Create: `tech-review/.github/style-guide.yml`

**Step 1: style-guide.yml**

`.github/style-guide.yml`:
```yaml
author_style:
  tone: "짧고 직관적, 예측 중심"
  format: "bullet 1-2문장, 3개 항목"
  sections:
    - "산업 연관성"
    - "직무 연관성"
    - "자소서/면접 활용"
  examples:
    - input: "Anthropic Opus 4.6 멀티에이전트 팀 기능 출시"
      output: |
        - **산업 연관성**: 에이전트 오케스트레이터가 미들웨어 시장을 새로 만들 것
        - **직무 연관성**: 멀티에이전트 설계 경험이 곧 필수 역량
        - **자소서/면접 활용**: "왜 단일 모델이 아니라 에이전트 팀인가" 질문 대비
    - input: "Edge AI inference moves closer to the grid"
      output: |
        - **Industry relevance**: Edge orchestration becomes the new cloud middleware
        - **Role relevance**: Understanding distributed inference is a differentiator
        - **Interview prep**: "How would you architect inference at the edge vs cloud?"
```

**Step 2: 파싱 스크립트**

`scripts/parse-content.js`:
```javascript
const fs = require('fs');
const path = require('path');

const content = process.env.RAW_CONTENT;
const lang = process.env.LANG;
const date = process.env.POST_DATE;

// Perplexity 출력에서 토픽 분리 (--- 구분자)
const topics = content.split(/^---$/m).filter(t => t.trim());

topics.forEach((topic, i) => {
  const lines = topic.trim().split('\n');

  // 제목 추출
  const titleMatch = topic.match(/^## (.+)$/m);
  if (!titleMatch) return;
  const title = titleMatch[1].trim();

  // slug 생성
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const filename = `${date}-${slug}.md`;
  const dir = path.join('_posts', lang);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 필드 추출
  const extract = (marker) => {
    const re = new RegExp(`\\*\\*${marker}\\*\\*:\\s*(.+)`, 'i');
    const m = topic.match(re);
    return m ? m[1].trim() : '';
  };

  const fields = ['Industry', 'Who', 'What', 'When', 'Why', 'How', 'So?', 'Source'];
  let body = '';
  fields.forEach(f => {
    const val = extract(f);
    if (val) body += `## ${f}\n${val}\n\n`;
  });

  // tags 추출 (Industry에서)
  const industry = extract('Industry');
  const tags = industry
    .toLowerCase()
    .split(/[\/,]/)
    .map(t => t.trim())
    .filter(Boolean);

  const frontmatter = [
    '---',
    'layout: post',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `lang: ${lang}`,
    `pair: ${date}-${slug}`,
    `tags: [${tags.join(', ')}]`,
    '---',
    ''
  ].join('\n');

  // Comments 자리표시자 (Claude API 호출 후 교체)
  body += '## Comments\n{{ COMMENTS_PLACEHOLDER }}\n';

  fs.writeFileSync(path.join(dir, filename), frontmatter + body);
  console.log(`Created: ${dir}/${filename}`);
});
```

**Step 3: GitHub Actions 워크플로**

`.github/workflows/create-post.yml`:
```yaml
name: Create Post from Perplexity

on:
  repository_dispatch:
    types: [new-review]

permissions:
  contents: write

jobs:
  create-post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Parse content and create markdown
        env:
          RAW_CONTENT: ${{ github.event.client_payload.content }}
          LANG: ${{ github.event.client_payload.lang }}
          POST_DATE: ${{ github.event.client_payload.date }}
        run: node scripts/parse-content.js

      - name: Generate Comments via Claude API
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          LANG: ${{ github.event.client_payload.lang }}
        run: |
          for file in $(find _posts/$LANG -name "${{ github.event.client_payload.date }}*.md" -newer .git); do
            CONTENT=$(cat "$file")
            STYLE=$(cat .github/style-guide.yml)

            PROMPT="Based on the style guide below, generate the Comments section for this tech review post. Language: $LANG. Output ONLY the 3 bullet points, nothing else.\n\nStyle Guide:\n$STYLE\n\nPost Content:\n$CONTENT"

            RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
              -H "x-api-key: $ANTHROPIC_API_KEY" \
              -H "anthropic-version: 2023-06-01" \
              -H "content-type: application/json" \
              -d "{
                \"model\": \"claude-haiku-4-5-20251001\",
                \"max_tokens\": 300,
                \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]
              }" | jq -r '.content[0].text')

            sed -i "s|{{ COMMENTS_PLACEHOLDER }}|$RESPONSE|" "$file"
          done

      - name: Update feed.json build
        run: echo "feed.json is generated by Jekyll at build time"

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add _posts/
          git diff --cached --quiet || git commit -m "[tech-review] auto: ${{ github.event.client_payload.date }} ${{ github.event.client_payload.lang }} post"
          git push
```

**Step 4: GitHub Secrets 설정**

```bash
gh secret set ANTHROPIC_API_KEY -R paulseongminpark/tech-review
```

**Step 5: 커밋**

```bash
git add -A
git commit -m "[tech-review] 자동화 파이프라인 (GH Actions + 파싱 스크립트)"
git push
```

---

## Phase 3: Portfolio Integration

### Task 8: seed.ts에 Tech Review 섹션 추가

**Files:**
- Modify: `C:\dev\01_projects\02_portfolio\src\shared\seed.ts`

**Step 1: tech-review 섹션 추가**

`writing-1` 뒤에 추가:

```typescript
  {
    id: 'tech-review',
    category: 'Writing',
    eyebrow: 'Ongoing',
    title: 'Tech Review',
    shortTitle: 'Tech Review',
    description: 'AI·빅테크·신기술 트렌드를 매일 추적하고, 산업·직무 관점에서 짧은 인사이트를 기록합니다.',
    heroRatio: '16:9'
  },
```

**Step 2: 커밋**

```bash
cd /c/dev/01_projects/02_portfolio
git add src/shared/seed.ts
git commit -m "[portfolio] Tech Review 섹션을 Writing 카테고리에 추가"
```

---

### Task 9: TechReviewCards 컴포넌트 생성

**Files:**
- Create: `C:\dev\01_projects\02_portfolio\src\ui3\components\TechReviewCards.tsx`

**Step 1: 컴포넌트 작성**

`src/ui3/components/TechReviewCards.tsx`:
```tsx
import { useState, useEffect } from 'react';

interface ReviewPost {
  date: string;
  pair: string;
  title: { ko: string; en: string };
  tags: string[];
  url: { ko: string; en: string };
}

const FEED_URL = 'https://paulseongminpark.github.io/tech-review/feed.json';
const BLOG_URL = 'https://paulseongminpark.github.io/tech-review';

export function TechReviewCards() {
  const [posts, setPosts] = useState<ReviewPost[]>([]);
  const [lang, setLang] = useState<'ko' | 'en'>('en');

  useEffect(() => {
    const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
    setLang(browserLang);

    fetch(FEED_URL)
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {posts.slice(0, 4).map(post => (
          <a
            key={post.pair}
            href={`${BLOG_URL}${post.url[lang]}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '1.25rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#888')}
            onMouseOut={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
          >
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
              {post.date}
            </p>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.3 }}>
              {post.title[lang]}
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.7rem',
                  background: '#f0f0f0',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
      <a
        href={`${BLOG_URL}/${lang}/`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: '0.9rem', color: '#0066cc' }}
      >
        {lang === 'ko' ? '전체보기 →' : 'View all →'}
      </a>
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add src/ui3/components/TechReviewCards.tsx
git commit -m "[portfolio] TechReviewCards 컴포넌트 생성"
```

---

### Task 10: Page.tsx에 Tech Review 렌더링 통합

**Files:**
- Modify: `C:\dev\01_projects\02_portfolio\src\ui3\Page.tsx`

**Step 1: Page.tsx 확인**

Page.tsx에서 각 섹션을 렌더링하는 부분을 찾고, `tech-review` id일 때 `TechReviewCards` 컴포넌트를 렌더링하도록 분기 추가.

```tsx
// import 추가
import { TechReviewCards } from './components/TechReviewCards';

// 섹션 렌더링 부분에서 id === 'tech-review' 분기
{section.id === 'tech-review' && <TechReviewCards />}
```

정확한 삽입 위치는 Page.tsx의 섹션 렌더링 루프 내부. 기존 Work 상세뷰 분기와 동일한 패턴.

**Step 2: 로컬 테스트**

```bash
cd /c/dev/01_projects/02_portfolio
npm run dev
```

Expected: Writing 탭에 Tech Review 섹션이 카드 그리드와 함께 표시

**Step 3: 커밋**

```bash
git add src/ui3/Page.tsx
git commit -m "[portfolio] Tech Review 카드를 Page.tsx에 통합"
```

---

## Phase 4: Perplexity 지침 업데이트

### Task 11: Perplexity 예약 작업 설정

**Step 1: Perplexity 앱에서 기존 예약 작업 수정**

KO 예약: 디자인 문서 섹션 6의 KO 지침으로 교체
EN 예약: 디자인 문서 섹션 6의 EN 지침으로 교체

**Step 2: 테스트 실행**

Perplexity에서 수동 실행 → 메일 도착 → GAS 트리거 → GitHub Actions → 블로그 게시 확인

---

## 실행 순서 요약

```
Phase 1 (Jekyll Blog)
  Task 1 → Task 2 → Task 3 → Task 4 → Task 5

Phase 2 (Automation)
  Task 6 → Task 7

Phase 3 (Portfolio)
  Task 8 → Task 9 → Task 10

Phase 4 (Perplexity)
  Task 11

Phase 1과 Phase 3는 독립적으로 병렬 진행 가능.
Phase 2는 Phase 1 완료 후 진행.
Phase 4는 Phase 2 완료 후 진행.
```
