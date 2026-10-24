---
title: IP & Routing
description: '네트워크 사이에서 패킷을 전달하는 논리 주소와 라우팅'
type: concept
domain: network
topicId: network.ip
primaryCategory: l3
relatedTopicIds: []
tags: [IP, Routing, IPv4, Broadcast]
createdAt: 2026-10-23
---

## 개요

IP는 여러 링크로 연결된 네트워크 사이에서 패킷을 전달하기 위한 주소 체계와 데이터그램 형식을 제공한다. IPv4와 IPv6는 서로 다른 주소 형식과 동작 규칙을 가진다.

## 왜 필요한가?

서로 다른 링크 기술을 사용하는 호스트도 공통된 논리 주소와 포워딩 규칙으로 통신할 수 있다.

## 핵심 원리

라우터는 목적지 주소를 라우팅 테이블과 비교해 다음 홉 또는 출력 인터페이스를 선택한다. IP 자체는 최선형 전달을 제공하며 손실이나 순서 변경이 일어날 수 있다.

## 동작 과정

호스트는 목적지가 같은 서브넷인지 판단하고, 필요한 경우 게이트웨이로 프레임을 보낸다. 라우터는 패킷을 다음 링크에 맞는 프레임에 담아 전달한다.

## 예제 또는 시각화

```text
Host → local link → router → another link → destination
```

## 헷갈리기 쉬운 개념

IPv4의 255.255.255.255는 제한 브로드캐스트 주소다. 일반 라우터가 이를 다른 서브넷으로 그대로 전달하지 않는다. DHCP Relay는 브로드캐스트를 단순히 라우팅하는 것과 구별된다. IPv6에는 IPv4와 같은 브로드캐스트가 없다.

## 관련 개념

UDP, 라우팅 테이블, 서브넷, DHCP Relay.

## 더 읽기

[RFC 791 — Internet Protocol](https://www.rfc-editor.org/rfc/rfc791.html)
