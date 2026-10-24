# 개발 가이드

[프로젝트 소개](../README.md) · [글 작성](templates/작성양식/README.md) · [테스트 안내](TESTING.md)

## 기술 구성

- Astro + Starlight와 strict TypeScript를 사용합니다.
- 출력은 정적 HTML·CSS·JavaScript이며 Pagefind가 빌드 결과에서 검색 인덱스를 생성합니다.
- Markdown/MDX는 하나의 콘텐츠 컬렉션과 메타데이터 레지스트리에서 관리합니다.
- Mermaid는 다이어그램이 있는 문서에서 동적으로 불러오며 `securityLevel: 'strict'`를 사용합니다.

| 책임                  | 기준 파일                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| 필드와 허용값         | [`src/lib/schema.ts`](../src/lib/schema.ts)                                                            |
| 도메인·분류·문서 종류 | [`src/lib/taxonomy.ts`](../src/lib/taxonomy.ts)                                                        |
| 참조 검증·양방향 관계 | [`src/lib/validate-content.ts`](../src/lib/validate-content.ts)                                        |
| Astro 콘텐츠 연결     | [`src/content.config.ts`](../src/content.config.ts), [`content-index.ts`](../src/lib/content-index.ts) |
| 공개 링크와 배포 경로 | [`routes.ts`](../src/lib/routes.ts), [`deployment.ts`](../src/lib/deployment.ts)                       |
| Markdown Mermaid 변환 | [`scripts/remark-mermaid.mjs`](../scripts/remark-mermaid.mjs)                                          |

## 문서 경로와 자동 연결

문서 URL은 `src/content/docs/` 안의 파일 경로에서 결정됩니다.

```text
src/content/docs/network/topics/dhcp.md → /network/topics/dhcp/
src/content/docs/labs/dhcp-discover.md   → /labs/dhcp-discover/
```

루트의 `index.md`나 별도 `slug` 재정의로 화면 경로와 충돌하지 않도록 합니다. 파일명 앞에 `_`가 있는 문서는 수집하지 않습니다.

Concept의 `topicId`는 제목을 수정해도 유지하는 안정적인 ID입니다. 다른 글의 `relatedTopicIds`가 이 ID를 참조합니다. 레지스트리는 다음을 자동 계산합니다.

- 개념과 연결된 Lab·Research·Problem의 양방향 관련 카드
- 개념 사이의 양방향 관계와 같은 개념을 공유하는 관련 글
- 주 분류 및 참조 개념의 분류에 해당하는 탐색 허브

아카이브 필터의 대표 분류는 `primaryCategory`입니다. 공개 글은 공개 Concept만 참조할 수 있으며, 초안에서도 없는 ID는 허용하지 않습니다. 세부 필드와 예시는 [작성 가이드](templates/작성양식/README.md)를 참고하세요.

분류를 추가할 때는 `taxonomy.ts`를 수정합니다. 일곱 OSI 계층은 유지하며, OS 분류 변경 시 아키텍처 지도와 테스트의 일관성도 확인합니다.

## 첨부파일과 문서 렌더링

실제 파일은 `public/artifacts/글-slug/`에 저장합니다. MDX에서는 작성 가이드의 `url as assetUrl` 예시로 GitHub Pages 하위 경로까지 포함한 링크를 만듭니다. `url` 이름을 그대로 import하면 Astro가 생성한 export와 충돌합니다.

- `.mdx` 파일 위치에 따라 helper의 상대 import 경로를 맞춥니다.
- 문제의 해설은 기본 양식의 `<details data-pagefind-ignore>` 안에 배치합니다.
- `public/` 첨부파일은 문서의 `draft` 여부와 무관하게 공개 빌드에 복사됩니다.
- 파일 링크를 바꾼 뒤에는 `npm run verify:dist`로 실제 출력 경로를 확인합니다.

## 배포 설정

[`deployment.ts`](../src/lib/deployment.ts)는 Astro 설정·브라우저 테스트·출력 검증에서 공통으로 사용합니다.

| 변수                | 역할                                                           |
| ------------------- | -------------------------------------------------------------- |
| `GITHUB_REPOSITORY` | Actions가 제공하는 `owner/repository`; 사이트·경로 추론에 사용 |
| `SITE_URL`          | 배포 사이트의 origin 재정의                                    |
| `BASE_PATH`         | `/` 또는 `/NetOS` 같은 저장소 하위 경로                        |
| `REPOSITORY_URL`    | Starlight 문서 편집 링크의 저장소 주소                         |

일반 저장소는 `https://owner.github.io/repository/`, `owner.github.io` 저장소는 루트 경로를 사용하도록 계산합니다. 필요하면 GitHub Actions의 repository **Variables**에서 값을 재정의합니다.

커스텀 도메인을 루트에서 서비스할 때는 `SITE_URL`에 실제 origin, `BASE_PATH`에 `/`를 설정합니다. DNS와 Pages의 도메인 설정 및 실제 `public/CNAME` 파일도 필요합니다.

로컬 설정은 셸에서 환경변수를 전달하세요. [`.env.example`](../.env.example)은 참고 파일이며 Astro 설정이 자동으로 읽는다는 의미는 아닙니다. 예를 들어 저장소 하위 경로 빌드는 다음과 같습니다.

```sh
BASE_PATH=/NetOS npm run build
BASE_PATH=/NetOS npm run verify:dist
```

검사가 끝나면 `npm run build`로 기본 경로 출력을 복원할 수 있습니다. 프로필 연락처는 배포 저장소 설정과 별개로 [`contact.ts`](../src/config/contact.ts)에서 관리합니다.

## 디자인과 검증

참고 이미지는 `docs/assets/references/`에 보관합니다. Apple 디자인 스킬은 로컬의 `.agent/skills/apple-design/`에 있을 때만 참고하며 Git 추적에서 제외합니다. 사용자 정의 화면과 Starlight 문서의 스타일을 일관되게 유지하며 키보드·터치·모바일·reduced-motion 동작을 함께 확인합니다.

테스트·캡처 명령은 [테스트 안내](TESTING.md), 실제 수행 결과와 제한은 [검증 기록](QA.md)에 정리합니다.
