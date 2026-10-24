# NetOS 글 작성·게시 가이드

이 폴더의 `01-개념.md` ~ `04-문제.md`는 **원본 양식**입니다. 이 폴더에만 저장해도 사이트에 게시되지는 않습니다. 작성할 때 복사본을 사용하세요.

| 양식 | 게시 위치 |
|---|---|
| `01-개념.md` | `src/content/docs/network/topics/` 또는 `src/content/docs/os/topics/` |
| `02-실험.md` | `src/content/docs/labs/` |
| `03-연구.md` | `src/content/docs/research/` |
| `04-문제.md` | `src/content/docs/problems/` |

## GitHub에서 게시하는 순서

1. 해당 양식을 **복사**해서 게시 위치에 `영문-소문자-하이픈.md` 이름으로 새 파일을 만듭니다. 예: `tcp-handshake.md`.
2. 제목·설명·본문·분류·태그·작성일을 실제 내용으로 교체합니다.
3. `domain: network`면 `primaryCategory`는 `l1`~`l7`, `domain: os`면 `src/lib/taxonomy.ts`에 정의된 OS 분류를 사용합니다.
4. **Concept만** `topicId`를 고유하게 정의합니다. 한 번 만든 ID는 제목을 바꿔도 유지합니다.
5. Lab·Research·Problem의 `relatedTopicIds`에는 **실제로 존재하는 공개 대상 Concept의 `topicId`**를 넣습니다. 관련 개념이 없으면 먼저 또는 같은 커밋에 개념 글을 작성하세요.
6. 문제는 `difficulty`와 `problemKind`를 설정하고, 외부 문제라면 실제 `source`와 `sourceUrl`을 입력합니다. 출처 링크가 없으면 `sourceUrl` 줄을 주석 상태로 둡니다.
7. 내용과 링크를 확인한 뒤 `draft: false`로 변경합니다. `draft: true`면 일반적으로 배포 목록에서 제외되도록 설계되어 있습니다.
8. `main`에 커밋하거나 PR을 `main`에 병합합니다. GitHub Actions의 검사·빌드·배포 결과를 확인합니다. 실패하면 Actions의 오류 로그에서 문서 경로와 필드명을 확인하세요.

**주의:** 예제 `relatedTopicIds: [network.dhcp]`가 실제 프로젝트에 없으면 빌드 검사가 실패할 수 있습니다. 새 글에 맞는 유효한 ID로 바꿔야 합니다. `network.my-unique-topic`도 그대로 사용하지 마세요.

## Frontmatter 빠른 참고

- `title`, `description`: 화면과 검색에 표시되는 글 정보.
- `type`: `concept`, `lab`, `research`, `problem`.
- `domain`: `network` 또는 `os`.
- `primaryCategory`: `network`는 `l1`~`l7`; OS는 taxonomy 파일 확인.
- `tags`: 대괄호 목록. 쉼표나 콜론이 포함된 태그는 따옴표로 감쌉니다.
- `createdAt`, `updatedAt`: `YYYY-MM-DD`.
- `draft`: 게시 준비 전 `true`, 공개할 때 `false`.
- `topicId`: 개념의 안정적인 고유 ID (예: `network.dhcp`, `os.processes`).
- `relatedTopicIds`: 실제 개념 ID의 배열; 실험·연구·문제에는 하나 이상.
- `difficulty`: 문제 난도 `easy`, `medium`, `hard`.
- `problemKind`: `multiple-choice`, `short-answer`, `calculation`, `explanation`.
- `source`, `sourceUrl`: 문제 또는 연구의 출처·원문 주소. URL은 주석을 해제한 뒤 실제 주소 사용.

분류 기준: `src/lib/taxonomy.ts`. 메타데이터의 정확한 허용값은 프로젝트의 `src/content.config.ts` 및 검증 코드를 우선합니다.

## 이미지·PCAP·첨부파일

1. 관련 자료를 `public/artifacts/글-slug/`에 업로드합니다.
2. 이미지는 설명적인 `alt`를 포함합니다.
3. PCAP/PCAPNG에는 IP·MAC·쿠키·토큰·개인정보가 들어갈 수 있으므로 공개 업로드 전 안전하게 비식별화하고 확인합니다.
4. 기본 Markdown 상대 링크가 프로젝트 Pages의 하위 경로에서 깨질 수 있으므로 이 프로젝트의 `url()` 헬퍼 사용을 권장합니다.
5. 파일이 `src/content/docs/labs/example.mdx` 위치라면 아래처럼 작성합니다. 다른 위치의 `.mdx` 문서는 import 상대 경로를 조정하세요.

```mdx
import { url } from '../../../lib/routes';

<img src={url('/artifacts/example/capture.png')} alt="Wireshark에서 관찰한 패킷 헤더" />

<a href={url('/artifacts/example/sanitized.pcapng')} download>비식별화한 패킷 캡처 다운로드</a>
```

템플릿은 `.md`이며, 위의 JSX식 컴포넌트·`import`를 사용할 때는 `.mdx` 확장자를 사용합니다. 단순 코드 블록·표 등은 Markdown으로 충분합니다.

## 문제 정답 접기 주의

`04-문제.md`는 `<details data-pagefind-ignore>` 안에 정답·해설을 배치합니다. **실제 렌더링에서 Markdown 제목과 본문이 접힘 영역 안에 들어가는지 반드시 미리보기로 확인**하세요. Markdown 처리 방식에 따라 HTML 내부 Markdown이 문자 그대로 보일 수 있습니다. 이 경우 프로젝트에서 검증된 MDX/접기 컴포넌트로 바꿔야 합니다. 정답 검색 노출 차단도 검색 인덱스에서 확인해야 합니다.

## 최초 GitHub Pages 연결

최초 한 번: 원격 저장소로 프로젝트 전체를 푸시하고 저장소 **Settings → Pages → Build and deployment → Source → GitHub Actions**를 설정합니다. 저장소 이름에 맞는 Astro `site`/`base` 구성도 확인하세요.

이후 `main`에 게시 커밋 → Actions 검증·빌드 → Pages 배포로 자동 갱신됩니다. 로컬 파일은 자동 동기화되지 않으니 필요하면 `git pull`을 수행하세요.

기존 예제 글을 삭제하거나 바꾸기 전에 해당 `topicId`를 참조하는 글을 확인하세요. 연결이 깨지면 검증이 실패할 수 있습니다.
