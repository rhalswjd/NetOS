---
title: 'DHCP는 왜 초기 Discover에 브로드캐스트를 사용할까?'
description: '초기 DHCP 서버 탐색에 브로드캐스트가 필요한 이유 분석'
type: research
domain: network
primaryCategory: l7
relatedTopicIds: [network.dhcp]
tags: [DHCP, Broadcast, Network Design]
createdAt: 2026-10-23
---

## 궁금증

DHCP Discover는 왜 유니캐스트가 아니라
브로드캐스트를 사용하는가?

## 배경지식

새로 연결된 클라이언트는 DHCP 서버의 주소를
사전에 알지 못할 수 있다.

## 가설 또는 가능한 설계

1. 서버 주소를 미리 설정해 유니캐스트한다.
2. 로컬 네트워크에 브로드캐스트한다.
3. 별도의 서버 탐색 장치를 이용한다.

## 근거·반례

초기 Discover의 브로드캐스트는
사전 서버 설정 없이 서버를 탐색할 수 있게 한다.

그러나 DHCP Relay를 이용하면
다른 서브넷의 DHCP 서버와도 통신할 수 있다.

또한 모든 DHCP 단계가 항상
브로드캐스트인 것은 아니다.

## 대안 비교

서버 주소를 사전에 지정하는 방식은
탐색 트래픽을 줄일 수 있지만 설정 부담이 있다.

브로드캐스트는 자동 구성을 단순화하지만
로컬 브로드캐스트 트래픽을 발생시킨다.

## 최종 판단

초기 Discover 브로드캐스트는
사전 설정이 없는 호스트의 서버 탐색을 돕는 설계다.

## 남은 질문

- DHCP Relay는 패킷을 어떻게 전달할까?
- 기존 주소를 갱신할 때는 왜 유니캐스트가 가능할까?

## 참고 자료

[RFC 2131, §3.1 및 §4.4](https://www.rfc-editor.org/rfc/rfc2131.html)에서 초기 임대 획득과 갱신 상태를 구분한다.
