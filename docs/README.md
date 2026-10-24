# 문서 모음

[NetOS 소개](../README.md)

| 문서                                           | 내용                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| [글 작성 가이드](templates/작성양식/README.md) | 메타데이터·정답 접기·이미지/PCAP·출처·게시 순서       |
| [작성 양식](templates/README.md)               | Concepts·Labs·Research·Problems 기본 양식과 보관 자료 |
| [개발 가이드](DEVELOPMENT.md)                  | 구조·분류·라우팅·자동 연결·배포 설정                  |
| [테스트 안내](TESTING.md)                      | 단위·브라우저·통합 검사와 화면 캡처                   |
| [검증 기록](QA.md)                             | 실제 검사 결과와 검증 범위                            |

## 문서와 콘텐츠 구분

`docs/`는 저장소의 사용·개발 안내입니다. 실제 사이트에 게시할 글은 `src/content/docs/`에 작성합니다. 작성 양식을 `docs/templates/`에만 저장해도 사이트에 게시되지는 않습니다.

- `assets/previews/`: 로컬 프로덕션 빌드에서 직접 캡처한 README 이미지
- `assets/references/`: 기존 디자인 참고 이미지
- `templates/작성양식/`: 새 글에 사용하는 현재 양식
- `templates/archive/`: 비교용 원본과 초기 영문 양식

## 루트에 유지하는 설정

Astro·npm·Prettier·Playwright·TypeScript 설정과 `AGENTS.md`, `.github/workflows/`는 도구의 기본 탐색 위치에 둡니다. Apple 디자인 스킬은 로컬에 보존하며 Git 추적에서 제외합니다.
