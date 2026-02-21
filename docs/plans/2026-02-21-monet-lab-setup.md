# monet-lab 실험 환경 구축 구현 플랜

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** monet-registry 컴포넌트를 자유롭게 실험할 수 있는 독립 플레이그라운드(`04_monet-lab`) 구축

**Architecture:** Vite + React + TypeScript 기반 새 프로젝트를 `C:\dev\01_projects\04_monet-lab`에 생성. Tailwind CSS 4 + shadcn/ui를 설정하여 monet-registry 컴포넌트를 바로 붙여넣거나 CLI로 설치할 수 있는 환경을 만든다. `src/experiments/` 폴더에 실험별 컴포넌트를 모으고 `App.tsx`에서 목록으로 전환할 수 있게 한다.

**Tech Stack:** Vite 7, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui 3, pnpm

---

### Task 1: Vite 프로젝트 초기화

**Files:**
- Create: `C:\dev\01_projects\04_monet-lab\` (새 프로젝트)

**Step 1: 프로젝트 생성**

```bash
cd C:/dev/01_projects
pnpm create vite@latest 04_monet-lab --template react-ts
```

**Step 2: 의존성 설치**

```bash
cd C:/dev/01_projects/04_monet-lab
pnpm install
```

**Step 3: 동작 확인**

```bash
pnpm dev
```

Expected: 브라우저에서 `http://localhost:5173` 열리고 Vite + React 기본 화면 표시

**Step 4: git 초기화 및 첫 커밋**

```bash
git init
echo "node_modules/\ndist/\n.env" > .gitignore
git add .
git commit -m "[monet-lab] 프로젝트 초기화"
```

---

### Task 2: Tailwind CSS 4 설정

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css`
- Create: (tailwind 관련 설정은 CSS 파일 내에서 처리, Tailwind 4 방식)

**Step 1: Tailwind CSS 4 + Vite 플러그인 설치**

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/vite
```

**Step 2: vite.config.ts 수정**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

**Step 3: src/index.css 교체**

```css
@import "tailwindcss";
```

**Step 4: App.tsx에서 Tailwind 클래스 테스트**

`src/App.tsx`를 아래로 교체:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-900">monet-lab</h1>
    </div>
  )
}

export default App
```

**Step 5: 동작 확인**

```bash
pnpm dev
```

Expected: 회색 배경에 굵은 "monet-lab" 텍스트 표시 (Tailwind 적용 확인)

**Step 6: 커밋**

```bash
git add .
git commit -m "[monet-lab] Tailwind CSS 4 설정"
```

---

### Task 3: shadcn/ui 설정

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/` (shadcn CLI가 생성)
- Modify: `vite.config.ts` (path alias 추가)
- Modify: `tsconfig.app.json` (path alias 추가)

**Step 1: path alias 설정 - tsconfig.app.json 수정**

`tsconfig.app.json`의 `compilerOptions`에 추가:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 2: vite.config.ts에 alias 추가**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 3: @types/node 설치**

```bash
pnpm add -D @types/node
```

**Step 4: shadcn init 실행**

```bash
pnpm dlx shadcn@latest init
```

프롬프트 응답:
- Style: `Default`
- Base color: `Slate`
- CSS variables: `Yes`

**Step 5: 설치 확인 - Button 컴포넌트 추가**

```bash
pnpm dlx shadcn@latest add button
```

Expected: `src/components/ui/button.tsx` 생성됨

**Step 6: App.tsx에서 Button 테스트**

```tsx
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">monet-lab</h1>
        <Button>shadcn 동작 확인</Button>
      </div>
    </div>
  )
}

export default App
```

**Step 7: 동작 확인**

```bash
pnpm dev
```

Expected: "shadcn 동작 확인" 버튼이 shadcn 스타일로 렌더링됨

**Step 8: 커밋**

```bash
git add .
git commit -m "[monet-lab] shadcn/ui 설정 완료"
```

---

### Task 4: 실험 목록 UI (App.tsx) 구성

**Files:**
- Modify: `src/App.tsx`
- Create: `src/experiments/index.ts` (실험 목록 레지스트리)

**Step 1: 실험 레지스트리 파일 생성**

`src/experiments/index.ts`:

```typescript
export interface Experiment {
  id: string
  name: string
  description: string
  component: React.LazyExoticComponent<React.FC>
}

export const experiments: Experiment[] = [
  // 실험 추가 시 여기에 등록
]
```

**Step 2: App.tsx를 실험 목록 UI로 교체**

```tsx
import { Suspense, useState } from 'react'
import { experiments } from './experiments'
import { Button } from '@/components/ui/button'

function App() {
  const [active, setActive] = useState<string | null>(null)

  const current = experiments.find(e => e.id === active)
  const Component = current?.component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r p-4 flex flex-col gap-2">
        <h1 className="text-lg font-bold mb-4">monet-lab</h1>
        {experiments.length === 0 && (
          <p className="text-sm text-gray-400">실험 없음. experiments/에 추가하세요.</p>
        )}
        {experiments.map(exp => (
          <Button
            key={exp.id}
            variant={active === exp.id ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => setActive(exp.id)}
          >
            {exp.name}
          </Button>
        ))}
      </div>

      {/* 메인 영역 */}
      <div className="ml-64 p-8">
        {Component ? (
          <Suspense fallback={<div>로딩 중...</div>}>
            <Component />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-[80vh] text-gray-400">
            왼쪽에서 실험을 선택하세요
          </div>
        )}
      </div>
    </div>
  )
}

export default App
```

**Step 3: 동작 확인**

```bash
pnpm dev
```

Expected: 왼쪽 사이드바 + 오른쪽 "왼쪽에서 실험을 선택하세요" 메시지

**Step 4: 커밋**

```bash
git add .
git commit -m "[monet-lab] 실험 목록 UI 구성"
```

---

### Task 5: 첫 실험 컴포넌트 추가 (monet 검증)

**Files:**
- Create: `src/experiments/hero-01/index.tsx`
- Modify: `src/experiments/index.ts`

**Step 1: monet.design에서 Hero 컴포넌트 탐색**

브라우저에서 https://monet.design 접속 → Hero 카테고리에서 마음에 드는 컴포넌트 선택

**Step 2: 필요한 shadcn 컴포넌트 설치**

예시 (Hero가 Badge를 사용하는 경우):
```bash
pnpm dlx shadcn@latest add badge
```

**Step 3: 실험 폴더 생성 및 컴포넌트 작성**

`src/experiments/hero-01/index.tsx`:

```tsx
// monet-registry에서 가져온 Hero 컴포넌트
// 출처: https://monet.design/...

export default function HeroExperiment() {
  return (
    <div>
      {/* monet 컴포넌트 코드 붙여넣기 */}
    </div>
  )
}
```

**Step 4: 실험 레지스트리에 등록**

`src/experiments/index.ts`:

```typescript
import { lazy } from 'react'

export const experiments = [
  {
    id: 'hero-01',
    name: 'Hero 01',
    description: 'monet hero section 실험',
    component: lazy(() => import('./hero-01')),
  },
]
```

**Step 5: 동작 확인**

```bash
pnpm dev
```

Expected: 사이드바에 "Hero 01" 버튼 → 클릭 시 컴포넌트 렌더링

**Step 6: 커밋**

```bash
git add .
git commit -m "[monet-lab] 첫 실험 컴포넌트 (hero-01) 추가"
```

---

## 완료 기준

- [ ] `pnpm dev` 정상 실행
- [ ] Tailwind 클래스 적용 확인
- [ ] shadcn Button 렌더링 확인
- [ ] 실험 사이드바 UI 동작
- [ ] Hero 컴포넌트 1개 이상 동작
