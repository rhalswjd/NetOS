---
title: Virtual Memory
description: '가상 주소와 물리 메모리 사이의 매핑, 페이지 테이블과 페이지 폴트'
type: concept
domain: os
topicId: os.virtual-memory
primaryCategory: virtual-memory
relatedTopicIds: [os.processes]
tags: [Memory, Paging, Page Fault, TLB]
createdAt: 2026-10-23
---

## 개요

가상 메모리는 프로그램이 사용하는 가상 주소를 실제 메모리와 연결하는 추상화다. 주소 변환은 CPU의 MMU와 운영체제가 협력해 수행한다.

## 왜 필요한가?

각 프로세스에 독립적인 주소 공간을 제공하고 접근 권한을 제어할 수 있다. 메모리의 물리적 배치를 애플리케이션의 주소와 분리해 공유, 지연 할당, 파일 매핑 등도 구현한다.

## 핵심 원리

페이지 테이블은 가상 페이지와 물리 페이지 프레임의 매핑 및 권한을 기록한다. TLB는 주소 변환 결과를 캐시한다. 구체적인 페이지 크기와 테이블 구조는 아키텍처에 따라 다르다.

## 동작 과정

1. 프로그램이 가상 주소를 사용한다.
2. CPU가 TLB 또는 페이지 테이블로 주소를 변환한다.
3. 매핑이 없거나 권한을 위반하면 예외가 발생한다.
4. 커널은 할당, 파일 읽기, 오류 전달 등 적절한 처리를 한다.

## 예제 또는 시각화

```text
Virtual address → TLB / page tables → Physical frame + offset
```

## 헷갈리기 쉬운 개념

페이지 폴트가 항상 디스크 접근을 의미하지는 않는다. 아직 할당되지 않은 페이지를 만들거나 copy-on-write를 처리하는 폴트도 있다. 가상 메모리 역시 스왑 공간과 같은 말이 아니다.

## 관련 개념

프로세스 격리, 메모리 관리, 페이지 교체.

## 더 읽기

[Linux kernel: memory management concepts](https://docs.kernel.org/admin-guide/mm/concepts.html)
