# NetOS

운영체제와 네트워크를 **시각화로 탐색하고, Markdown으로 기록하는 지식 아카이브**입니다.

Astro · Starlight · TypeScript · Markdown/MDX · Pagefind를 사용하며, 정적 사이트로 GitHub Pages에 배포합니다.

[글 작성 가이드](templates/작성양식/README.md) · [개발 가이드](docs/DEVELOPMENT.md) · [테스트 안내](tests/README.md) · [검증 기록](docs/QA.md)

## 주요 기능

| 영역      | 기능                                                            |
| --------- | --------------------------------------------------------------- |
| Home      | 떠 있는 Network / OS 카드와 Knowledge Archive                   |
| Network   | Sierra Blue 원통형 OSI 7계층과 계층별 개념 탐색                 |
| OS        | 커널 아키텍처 지도, 8개 하위 영역과 Topics 보기                 |
| Archive   | Concepts · Labs · Research · Problems의 검색·필터·정렬          |
| 문서      | 개념 ID에 따른 양방향 관련 콘텐츠, 목차, 코드 복사, Mermaid     |
| 읽기 환경 | 전체 본문 검색, 다크 모드, 모바일·키보드 탐색, 동작 줄이기 지원 |

## 빠른 시작

**Node.js 24 LTS**와 npm을 사용합니다. 버전 기준은 [`.nvmrc`](.nvmrc)에 있습니다.

```sh
npm ci
npm run dev
```

브라우저에서 터미널에 표시된 Local 주소를 엽니다.

전체 본문 검색은 프로덕션 빌드 시 생성됩니다. 검색까지 확인하려면 다음 명령을 사용하세요.

```sh
npm run build
npm run preview
```

## 글 작성과 게시

1. **[기본 작성양식](templates/작성양식/README.md)**에서 필요한 양식을 복사합니다.
2. 아래 위치에 새 `.md` 또는 `.mdx` 파일을 만들고 제목·본문·메타데이터를 작성합니다.
3. 게시 준비가 되면 `draft: false`로 바꾸고 검증합니다.
4. GitHub Pages 최초 설정 이후에는 `main`에 커밋할 때마다 검사·빌드·배포가 실행됩니다.

| 종류     | 저장 위치                                                             |
| -------- | --------------------------------------------------------------------- |
| Concepts | `src/content/docs/network/topics/` 또는 `src/content/docs/os/topics/` |
| Labs     | `src/content/docs/labs/`                                              |
| Research | `src/content/docs/research/`                                          |
| Problems | `src/content/docs/problems/`                                          |

개념은 고유한 `topicId`를 갖고, 실험·연구·문제는 `relatedTopicIds`로 개념을 연결합니다. 새 글을 추가할 때 화면 코드나 관련 글 목록을 수정할 필요가 없습니다.

- `draft: true`인 글은 프로덕션 페이지·목록·검색에서 제외됩니다. 초안도 메타데이터·참조 검사를 통과해야 합니다.
- 공개 글이 참조하는 개념도 공개 상태여야 합니다.
- 이미지·PCAP 연결, 문제 정답 접기, 출처 작성법은 작성 가이드에 정리되어 있습니다.
- 기존 샘플 글 9개는 유지합니다. DHCP 실험은 미수행 상태이며 실제 관찰값을 꾸며 넣지 않았습니다.

GitHub에서 편집한 내용은 배포 사이트에 반영됩니다. 로컬 작업 폴더에도 반영하려면 `git pull`이 필요합니다.

## 프로젝트 구조

```text
src/
├── pages/           # Home, Network, OS, Archive 페이지
├── content/docs/    # 게시할 Markdown / MDX
├── components/      # 공통 UI와 Starlight 문서 구성
├── lib/             # 스키마·분류·자동 연결·배포 경로
├── config/          # 연락처 설정
└── styles/          # 공통·문서 스타일
public/
├── artifacts/       # 실제 이미지·비식별화한 첨부파일
└── references/      # 디자인 참고 이미지
scripts/             # 빌드에 필요한 검증·Markdown 처리 도구
tests/
├── unit/            # 스키마·레지스트리·참조 검증
├── browser/         # 데스크톱·모바일 Playwright 테스트
├── integration/     # 실제 문서 추가·빌드·양식 검증
└── visual/          # 수동 화면 캡처 도구
templates/
├── 작성양식/        # 새 글에 사용하는 기본 양식
└── archive/         # 비교·보관용 이전 자료
docs/                # 개발 안내와 검증 기록
.github/workflows/   # GitHub Pages 검사·배포
```

기존 글에서 참조하는 `templates/*.md` 영문 기본 양식도 호환용으로 유지합니다. 새 글에는 `templates/작성양식/`을 사용하세요.

## 검증

최초 한 번 브라우저 테스트에 필요한 Chromium을 설치합니다.

```sh
npx playwright install chromium
```

일반 검증은 다음 명령으로 실행합니다.

```sh
npm run qa
```

타입 검사 → 단위 테스트 → 프로덕션 빌드 → 내부 링크 검사 → 브라우저 테스트 순서로 진행합니다.

| 명령                     | 용도                                                     |
| ------------------------ | -------------------------------------------------------- |
| `npm run validate`       | 메타데이터·분류·개념 ID와 참조 검증                      |
| `npm run check`          | Astro 및 TypeScript 타입 검사                            |
| `npm test`               | 단위 테스트                                              |
| `npm run test:e2e`       | 빌드된 사이트의 데스크톱·모바일 브라우저 테스트          |
| `npm run test:discovery` | 문서 자동 발견·교차 분류·MDX Mermaid 실제 빌드 검사      |
| `npm run test:templates` | 양식 4종의 MD/MDX·정답 접기·검색 제외·첨부파일·초안 검사 |

`test:e2e` 전에 `npm run build`가 필요합니다. 통합 테스트 두 개는 임시 문서와 `dist/`를 변경한 뒤 정리·복원하므로 다른 빌드와 동시에 실행하지 마세요. 하위 경로·화면 캡처 검사는 [테스트 안내](tests/README.md)를 참고하세요.

## GitHub Pages 배포

1. 프로젝트와 `package-lock.json`을 GitHub 저장소에 올립니다. 배포 기준 브랜치는 `main`입니다.
2. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
3. `main`에 커밋하거나 Actions에서 **Validate and deploy to GitHub Pages**를 수동 실행합니다.

[배포 워크플로](.github/workflows/deploy.yml)는 타입·내용·단위·빌드·링크·브라우저 검사가 모두 성공한 경우에 배포합니다. 저장소 이름에서 사이트 주소와 하위 경로를 계산하며, 사용자 사이트와 커스텀 도메인 설정은 [개발 가이드](docs/DEVELOPMENT.md#배포-설정)에 있습니다.

## 연락처와 추가 문서

- 푸터의 GitHub·Email은 [`src/config/contact.ts`](src/config/contact.ts)에서 설정합니다. 현재 빈 값은 링크 없는 라벨로 표시됩니다.
- [개발 가이드](docs/DEVELOPMENT.md): 메타데이터·라우팅·자동 연결·배포 설정
- [글 작성 가이드](templates/작성양식/README.md): 양식·이미지·PCAP·출처·게시 절차
- [테스트 안내](tests/README.md): 테스트 분류·실행 방법·화면 캡처
- [검증 기록](docs/QA.md): 실제 수행한 검사 결과와 검증 범위
