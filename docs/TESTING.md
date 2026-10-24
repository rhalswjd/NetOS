# 테스트 안내

[프로젝트 소개](../README.md) · [검증 기록](QA.md)

## 테스트 분류

| 위치                       | 역할                                                    | 실행 명령                |
| -------------------------- | ------------------------------------------------------- | ------------------------ |
| `unit/`                    | 스키마·레지스트리·잘못된 참조·배포 경로·양식 호환성     | `npm test`               |
| `browser/`                 | 실제 페이지 이동·검색·필터·모바일·키보드·문서 동작      | `npm run test:e2e`       |
| `integration/discovery.ts` | 임시 Markdown/MDX 추가 후 허브·역방향 연결·Mermaid 빌드 | `npm run test:discovery` |
| `integration/templates.ts` | 양식 4종의 MD/MDX 공개본·초안, 정답·검색·첨부파일 검증  | `npm run test:templates` |
| `visual/`                  | 사람이 비교·확인할 화면 캡처                            | 아래 캡처 명령           |

모든 명령은 저장소 루트에서 실행합니다. 스키마·출력 검증과 Markdown 변환처럼 빌드에 사용하는 도구는 `scripts/`에 남겨 두었습니다.

## 일반 검증

Node 24 LTS와 의존성을 준비하고 Chromium을 설치합니다.

```sh
npm ci
npx playwright install chromium
npm run qa
```

`qa`는 타입 → 단위 → 프로덕션 빌드 → 내부 링크 → 브라우저 순서로 실행합니다. 브라우저 검사는 데스크톱과 iPhone 터치 환경을 Chromium으로 검사하고 전용 포트 4371에서 프로덕션 미리보기를 시작합니다.

브라우저 테스트만 실행하려면 먼저 빌드합니다.

```sh
npm run build
npm run test:e2e
```

브라우저 보고서는 `playwright-report/`, 실패 시 추적 자료는 `test-results/`에 생성되며 Git에서는 제외됩니다.

## 통합 검증

```sh
npm run test:discovery
npm run test:templates
```

두 검사는 임시 파일을 생성해 실제 빌드하고, 자신이 생성한 파일만 정리한 뒤 정상 빌드를 복원합니다. 양식 검사는 기존 문서의 해시도 비교합니다. PCAP 다운로드 검사용 파일에는 패킷이 없는 QA 전용 헤더만 들어갑니다.

**다른 빌드·통합 검사·콘텐츠 편집과 동시에 실행하지 마세요.** 원래 존재하던 파일은 덮어쓰지 않으며, 전용 임시 경로가 이미 있으면 검사를 중단합니다.

## GitHub Pages 하위 경로

```sh
BASE_PATH=/NetOS npm run build
BASE_PATH=/NetOS npm run verify:dist
BASE_PATH=/NetOS npm run test:e2e
BASE_PATH=/NetOS npm run test:templates
```

이전 기본 경로의 미리보기가 전용 포트 4371에서 실행 중이면 먼저 종료합니다. 확인이 끝나면 기본 출력으로 복원합니다.

```sh
npm run build
```

## 수동 화면 캡처

별도로 개발 서버 또는 프로덕션 미리보기를 실행한 다음, 터미널에 표시된 실제 URL을 전달합니다. 하위 경로로 실행했다면 URL에 하위 경로도 포함합니다.

```sh
npm run capture:preview -- http://127.0.0.1:4321/
npm run capture:reader -- http://127.0.0.1:4321/
```

- `capture:preview`: Home·Network·OS·문서·Archive를 데스크톱·태블릿·좁은 화면·모바일에서 캡처합니다. 출력은 `/tmp/netos-qa/`입니다.
- `capture:reader`: 문서 하단·현재 목차·필터·푸터를 데스크톱·모바일에서 확인합니다. 출력은 `/tmp/netos-refinements/`입니다.

캡처 도구는 수동 검토용이며 `qa`나 배포 워크플로에서 자동 실행하지 않습니다. `capture:reader`의 개발 도구 모음 검사에는 개발 서버를 사용하세요.

## README 미리보기 갱신

프로덕션 빌드를 미리보기 서버로 연 뒤 실제 Local URL을 전달합니다.

```sh
npm run build
npm run preview
# 별도 터미널에서, 위 서버가 출력한 주소 사용
npm run capture:readme -- http://127.0.0.1:4321/
```

Home·Network·OS 화면을 데스크톱의 밝은 테마로 캡처해 `docs/assets/previews/`에 저장합니다. README는 이 로컬 이미지를 사용하며 배포 URL이나 배포 성공 상태를 나타내지 않습니다. 기존 디자인 참고 이미지는 `docs/assets/references/`에 보관합니다.
