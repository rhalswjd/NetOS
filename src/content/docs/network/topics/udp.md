---
title: UDP
description: '데이터그램 단위의 전송과 애플리케이션이 담당해야 하는 신뢰성'
type: concept
domain: network
topicId: network.udp
primaryCategory: l4
relatedTopicIds: [network.ip]
tags: [UDP, Transport, Datagram]
createdAt: 2026-10-23
---

## 개요

UDP(User Datagram Protocol)는 IP 위에서 데이터그램을 전송하는 전송 계층 프로토콜이다. 포트 번호로 애플리케이션 엔드포인트를 구분한다.

## 왜 필요한가?

전송 전에 연결 설정을 요구하지 않고 메시지 경계를 유지한다. 애플리케이션은 필요한 신뢰성이나 혼잡 제어를 직접 설계하거나 다른 프로토콜을 사용할 수 있다.

## 핵심 원리

UDP는 전달, 순서, 중복 방지 또는 재전송을 보장하지 않는다. 체크섬은 손상 감지에 쓰이지만 신뢰성 보장은 아니다. IPv4와 IPv6에서 체크섬 사용 규칙은 다르다.

## 동작 과정

송신 애플리케이션이 보낸 메시지에 UDP 헤더와 IP 헤더가 붙는다. 수신 측은 목적지 포트 등을 이용해 데이터그램을 적절한 소켓으로 전달한다.

## 예제 또는 시각화

```text
Source port | Destination port | Length | Checksum | Payload
```

## 헷갈리기 쉬운 개념

UDP가 무조건 빠르거나 실시간 통신을 보장하는 것은 아니다. 지연과 처리량은 네트워크, 메시지 크기, 애플리케이션 설계에 달려 있다. DHCP는 UDP를 사용하지만 주소 할당 의미 자체는 애플리케이션 계층에서 정의한다.

## 관련 개념

IP, DHCP, TCP, 애플리케이션 재전송.

## 더 읽기

[RFC 768 — User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768.html)
