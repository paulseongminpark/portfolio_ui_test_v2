# STATE — 포트폴리오

## 지금 상태 (2026-02-19 기준)

**완료**
- W1~W5: Work 슬롯 재구성 + TOC + All탭 카드 + 상세 라우팅 + MD 주입
- About 3개 + System 5개 실콘텐츠 주입
- 탭 필터 + TOC 접기/펼치기 + 스크롤스파이
- 프로젝트 마이그레이션: portfolio_ui_test_v2 → 01_projects/02_portfolio
- GitHub repo rename: portfolio_20260215
- .claude/ 설정 완료 (CLAUDE.md, settings.json, skills)
- **Tech Review 자동화 파이프라인 완성** (2026-02-19)
  - Perplexity 예약 리서치 → Gmail → GAS → GitHub Actions → Jekyll 포스트 자동 생성
  - 매일 07:00 KST 자동 실행
  - KO/EN 동시 생성, 뉴스 헤드라인 제목, 태그 자동 추출
  - deploy 자동 트리거 (gh workflow run)
  - Comments 워크플로우: [YYYYMMDD 내용] 형식 → KO/EN 포스트 반영
  - 인코딩/한자 문제 해결 (fetch-perplexity.js + 프롬프트)
  - 포트폴리오 통합: TechReviewCards (최신 3개, 브라우저 언어 감지)

**다음 할 일 (W1~W14 로드맵 기준)**
- W6: OpenAI 스타일 레이아웃 전환 (미디어 블록 중심, 타이포/색상, Footnote)
- W7: Empty House 이미지 배치 시스템 (슬라이더/탭 UX 결정 및 구현)
- W8~W9: Skin Diary AI / PMCC 콘텐츠 완성
- W10: 글로벌 탭 인터랙션 (hover 라이브 포토, 클릭 애니메이션)
- W11: Writing 섹션 신규 구성 (기술/독서/미학연구 3분할)
- W12~W13: 버그 수정 + 에셋 품질 개선
- W14: 배포 및 최종 검증

**막힌 것**
- All 탭 스크롤 중 간헐적 Writing/Resume 점프
- Work 탭에서 TOC 간헐적 사라짐 (sticky 경계 조건)
- 이미지 에셋 미준비
- Resume/Contact 탭 노출 여부 미결정

---

## 시스템 작동 방식

**렌더링 흐름**
```
index.html → src/main.tsx → src/App.tsx → src/ui3/Page.tsx → src/shared/seed.ts (14개 섹션)
```

**데이터 구조**
- Work 3개: Empty House CPS / Skin Diary AI / PMCC
- About 3개 + System 5개 + Writing/Resume/Contact 각 1개
- 콘텐츠: src/content/*.md (?raw import)
- 스크롤스파이: IntersectionObserver + pendingScrollId

**핵심 원칙**
- 목표: 실콘텐츠 완성 → 배포 가능 v1
- 성공지표: "placeholder content" 문자열 0개
- 제약: UI3 레이아웃 유지, vanilla CSS, 해시 라우팅, 한국어
- 스타일: Noto Sans KR, 4-column grid

---

## 과거 결정

**2026-02-19**
- Tech Review 자동화 파이프라인 전체 완성
- TECH_REVIEW_TOKEN 재발급 (classic PAT, repo scope)
- Perplexity refusal 방지: search_recency_filter + system message + 프롬프트 지침
- deploy 자동 트리거: gh workflow run + actions: write 권한
- future: true 추가 (_config.yml)
- 소스 링크 수정: citations 배열 처리 (fetch-perplexity.js)
- 포스트 제목 뉴스 헤드라인 형식 (TITLE/TAGS 마커)
- 인코딩/한자 자동 제거 (U+FFFD, CJK 범위)
- Comments 형식 단순화: [YYYYMMDD 내용]
- 기존 포스트 보호 (skip-if-exists)
- 포트폴리오 TechReviewCards: 3개, 브라우저 언어 감지

**2026-02-16**
- STATE.md URL 전환: GitHub Pages → raw.githubusercontent.com (GPT 읽기 안정성 개선)

**2026-02-15**
- 프로젝트 마이그레이션 완료 (새 폴더 구조)
- GitHub repo rename: portfolio_ui_test_v2 → portfolio_20260215
- .claude/ 설정 (Skills, Hooks, Permissions)

**2026-02-12**
- W1~W14 로드맵 확정 (6개 Phase 구성)

**2026-02-10**
- Work 항목 3개 확정 (S4/S5 삭제)
- All 탭: Work는 OpenAI 스타일 가로 카드 3개
- 상세 진입: URL 해시(#work=<key>) + popstate 동기화
