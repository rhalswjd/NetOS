---
title: 'DHCP DORA 순서 문제'
description: 'DHCP 주소 할당 과정의 메시지 순서 이해'
type: problem
domain: network
primaryCategory: l7
relatedTopicIds: [network.dhcp]
tags: [DHCP, DORA]
difficulty: easy
problemKind: multiple-choice
source: '학습용 예제'
createdAt: 2026-10-23
---

## 문제

DHCP의 일반적인 초기 주소 할당 순서로
가장 적절한 것은?

A. Offer → Discover → ACK → Request

B. Discover → Offer → Request → ACK

C. Discover → Request → Offer → ACK

D. Request → Discover → ACK → Offer

## 내 풀이

이곳에 직접 작성한 풀이를 기록한다.

<details data-pagefind-ignore>
<summary>정답·해설 보기</summary>

## 정답·해설

정답: B

클라이언트는 Discover로 서버를 탐색하고,
서버는 Offer로 주소를 제안한다.

클라이언트는 Request로 제안을 요청하고,
서버는 ACK로 할당을 확인한다.

## 핵심 원리

DORA는 Discover, Offer, Request, ACK의 약자다.

</details>

## 틀린 이유

오답을 선택했다면 헷갈린 단계를 기록한다.

## 관련 개념

DHCP, UDP, Broadcast
