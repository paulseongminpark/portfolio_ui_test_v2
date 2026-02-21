# AI Native System

**What만 정의하면, How는 에이전트가 결정합니다.**

## 오케스트레이션 구조

14개 전문 에이전트가 계층적으로 작동합니다.

- **분석**: Gemini CLI (1M 토큰 코드베이스 전체 분석)
- **구현**: code-reviewer, commit-writer (자동 감지)
- **배포**: pf-deployer → security-auditor (순차 검증)
- **문서**: orch-doc-writer, orch-skill-builder

## 자동화 워크플로우

brainstorm → plan → implement → review → deploy

각 단계가 에이전트로 분리되어 자동 연결됩니다.

## 사용 스택

Claude Code · Gemini CLI · n8n · 14 Agents · 17 Skills · Git Worktree
