# NetOS 글 작성·게시 가이드

이 폴더의 `01-개념.md` ~ `04-문제.md`는 **원본 양식**입니다. 이 폴더에만 저장해도 사이트에 게시되지는 않습니다. 작성할 때 복사본을 사용하세요.

| 양식         | 게시 위치                                                             |
| ------------ | --------------------------------------------------------------------- |
| `01-개념.md` | `src/content/docs/network/topics/` 또는 `src/content/docs/os/topics/` |
| `02-실험.md` | `src/content/docs/labs/`                                              |
| `03-연구.md` | `src/content/docs/research/`                                          |
| `04-문제.md` | `src/content/docs/problems/`                                          |

## GitHub에서 게시하는 순서

1. 해당 양식을 **복사**해서 게시 위치에 `영문-소문자-하이픈.md` 이름으로 새 파일을 만듭니다. 예: `tcp-handshake.md`.
2. 제목·설명·본문·분류·태그·작성일을 실제 내용으로 교체합니다.
3. `domain: network`면 `primaryCategory`는 `l1`~`l7`, `domain: os`면 `src/lib/taxonomy.ts`에 정의된 OS 분류를 사용합니다.
4. **Concept만** `topicId`를 고유하게 정의합니다. 한 번 만든 ID는 제목을 바꿔도 유지합니다.
5. Lab·Research·Problem의 `relatedTopicIds`에는 **실제로 존재하는 Concept의 `topicId`**를 넣습니다. 관련 개념이 없으면 먼저 또는 같은 커밋에 개념 글을 작성하세요. 공개 글이 참조하는 개념도 `draft: false`여야 합니다. 초안끼리의 참조는 가능하지만, 초안에서도 존재하지 않는 ID는 허용하지 않습니다. Network와 OS 개념을 함께 참조할 수 있습니다.
6. 문제는 `difficulty`와 `problemKind`를 설정하고, 외부 문제라면 실제 `source`와 `sourceUrl`을 입력합니다. 직접 만든 문제는 `source: '직접 작성'`으로 표시하세요. 출처 링크가 없으면 `sourceUrl` 줄을 주석 상태로 둡니다.
7. 내용과 링크를 확인한 뒤 `draft: false`로 변경합니다. `draft: true` 문서는 프로덕션 빌드의 본문 페이지·목록·관련 카드·사이드바·검색에서 제외됩니다. 개발 서버에서는 초안 페이지를 미리 볼 수 있습니다. **초안도 메타데이터와 참조 검사를 통과해야 합니다.**
8. `main`에 커밋하거나 PR을 `main`에 병합합니다. GitHub Actions의 검사·빌드·배포 결과를 확인합니다. 실패하면 Actions의 오류 로그에서 문서 경로와 필드명을 확인하세요.

**주의:** `relatedTopicIds: [network.dhcp]`는 기존 DHCP 예제를 참조합니다. 이 ID가 없으면 빌드 검사가 실패합니다. 새 글에 맞는 유효한 ID로 바꿔야 합니다. `network.my-unique-topic`도 그대로 사용하지 마세요.

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

분류 기준은 [`src/lib/taxonomy.ts`](../../../src/lib/taxonomy.ts)입니다. OS 분류는 해당 파일의 `osAreas`에 있는 `id`를 사용합니다. 정확한 필드 허용값은 [`src/lib/schema.ts`](../../../src/lib/schema.ts), 도메인별 분류·필수 연결 조건은 [`src/lib/validate-content.ts`](../../../src/lib/validate-content.ts)에서 검사합니다.

`sourceUrl`은 실제 `https://` 또는 `http://` 원문 주소만 허용합니다. 빈 문자열이나 `여기에 URL` 같은 안내문을 값으로 입력하면 검증이 실패합니다. Concept의 `topicId`는 도메인 접두사와 영문 소문자·숫자·점·하이픈으로 작성합니다.

## 이미지·PCAP·첨부파일

1. 관련 자료를 `public/artifacts/글-slug/`에 업로드합니다. `public/`의 파일은 글의 `draft` 여부와 무관하게 빌드에 복사되므로 공개 가능한 파일만 올리세요.
2. 이미지는 설명적인 `alt`를 포함합니다.
3. PCAP/PCAPNG에는 IP·MAC·쿠키·토큰·개인정보가 들어갈 수 있으므로 공개 업로드 전 안전하게 비식별화하고 확인합니다.
4. 기본 Markdown 상대 링크가 프로젝트 Pages의 하위 경로에서 깨질 수 있으므로 이 프로젝트의 `url()` 헬퍼 사용을 권장합니다.
5. 파일이 `src/content/docs/labs/example.mdx` 위치라면 아래처럼 작성합니다. 다른 위치의 `.mdx` 문서는 import 상대 경로를 조정하세요.

```mdx
import { url as assetUrl } from '../../../lib/routes';

<img
  src={assetUrl('/artifacts/example/capture.png')}
  alt="Wireshark에서 관찰한 패킷 헤더"
/>

<a href={assetUrl('/artifacts/example/sanitized.pcapng')} download>
  비식별화한 패킷 캡처 다운로드
</a>
```

템플릿은 `.md`이며, 위의 JSX식·`import`를 사용할 때는 `.mdx` 확장자를 사용합니다. **`url`은 Astro MDX가 자동 생성하는 이름이므로 반드시 `url as assetUrl`처럼 별칭으로 가져오세요.** `assetUrl()`은 GitHub Pages의 저장소 하위 경로도 포함합니다. `public/`은 링크 경로에 넣지 않습니다. 파일은 실제 업로드한 이름과 대소문자를 맞추세요.

위 import 경로는 `labs/`, `research/`, `problems/`의 문서에 해당합니다. `network/topics/` 또는 `os/topics/`의 MDX에서는 `../../../../lib/routes`를 사용합니다. MDX 본문에서 HTML 주석(`<!-- ... -->`)은 사용할 수 없으므로 필요한 주석은 `{/* ... */}` 형식으로 작성하세요. 양식의 중복 HTML 주석은 제거해 `.mdx`로 전환해도 빌드되도록 했습니다. 코드 블록·표·Mermaid는 `.md`에서도 지원합니다. 아직 수행하지 않은 실험의 캡처나 관찰값을 임의로 만들지 마세요.

## 문제 정답 접기 주의

`04-문제.md`의 `<details data-pagefind-ignore>`는 정답·해설과 핵심 원리를 기본적으로 접고, 내부 본문을 Pagefind 전체 검색에서 제외합니다. 현재 프로젝트의 Markdown 및 MDX에서 내부 제목·강조가 정상 렌더링되며, 클릭·터치·키보드 Enter로 펼칠 수 있습니다. `open` 속성을 추가하면 처음부터 열리므로 사용하지 마세요.

`<summary>…</summary>` 다음과 `</details>` 앞의 빈 줄을 유지하고, 공개되면 안 되는 해설은 접힘 영역 바깥에 쓰지 마세요. 목차에는 내부 제목이 표시될 수 있습니다. 이것은 정답 본문을 숨기는 읽기 편의 기능이며, HTML 소스에서도 정답을 감추는 접근 제어 기능은 아닙니다.

## 게시 전 로컬 검사

```sh
npm run check
npm test
npm run build
npm run verify:dist
npm run test:e2e
```

양식 자체의 동작까지 검사하려면 `npm run test:templates`를 실행하세요. 양식의 임시 공개본·초안을 만들어 실제 빌드와 브라우저에서 정답 접기·검색 제외·이미지·PCAP 다운로드·자동 연결을 확인한 뒤 임시 파일을 제거하고 정상 빌드를 복원합니다. `BASE_PATH=/NetOS npm run test:templates`로 Pages 하위 경로도 검사할 수 있습니다. 이 검사는 콘텐츠 파일과 `dist/`를 일시적으로 변경하므로 다른 빌드·콘텐츠 수정과 동시에 실행하지 마세요.

## 최초 GitHub Pages 연결

최초 한 번: 원격 저장소로 프로젝트 전체를 푸시하고 저장소 **Settings → Pages → Build and deployment → Source → GitHub Actions**를 설정합니다. 저장소 이름에 맞는 Astro `site`/`base` 구성도 확인하세요.

이후 `main`에 게시 커밋 → Actions 검증·빌드 → Pages 배포로 자동 갱신됩니다. 로컬 파일은 자동 동기화되지 않으니 필요하면 `git pull`을 수행하세요.

기존 샘플 글 9개와 관련 링크는 유지합니다. 새 글은 별도 파일로 추가하세요. 이후 기존 개념을 직접 정리할 때도 해당 `topicId`를 참조하는 글을 먼저 확인하세요. 연결이 깨지면 검증이 실패합니다.
