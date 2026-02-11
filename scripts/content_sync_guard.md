# Content SoT (Single Source of Truth) Guard

## Rules
1. MD 편집은 `src/content/*.md` 에서만 수행 (Obsidian Vault = 이 폴더)
2. 이미지 에셋은 `public/work/{project}/` 에만 배치
3. `src/content/` 하위에 서브폴더 생성 금지 (work.ts 엔트리 제외)
4. import 경로는 항상 `src/content/` 기준 상대경로 사용
5. 중복 content 폴더 발견 시 즉시 삭제

## Image Path Convention
- MD 내 이미지 표기: `**[배치: filename.ext]**` (파일명만 기재)
- 코드가 자동으로 `public/work/{project}/filename.ext` 로 매핑
- 폴더 매핑: empty-house → empty-house-cps, skin-diary → skin-diary-ai, pmcc → pmcc

## Verification
1. `src/content/EMPTY_HOUSE_CPS_DETAIL_KO.md` 상단에 `<!-- SYNC_TEST -->` 추가
2. `npm run dev` 상태에서 localhost에 즉시 반영 확인
3. 반영 확인 후 테스트 줄 제거
