---
title: 'DHCP Discover 브로드캐스트 관찰'
description: 'Wireshark를 이용한 DHCP Discover 패킷 관찰 실험'
type: lab
domain: network
primaryCategory: l7
relatedTopicIds: [network.dhcp]
tags: [DHCP, Wireshark, Broadcast]
createdAt: 2026-10-23
---

## 배경

DHCP 클라이언트는 초기 주소 할당 시
아직 정상적인 IP 설정이 없을 수 있다.

## 실험 목적

DHCP Discover 패킷의 출발지·목적지 IP와
UDP 포트를 관찰한다.

## 예상 결과

초기 Discover에서 출발지 IP는 0.0.0.0,
목적지 IP는 255.255.255.255일 것으로 예상한다.

## 실험 환경

- Wireshark
- DHCP가 사용되는 테스트 네트워크
- 운영체제 및 인터페이스: 실험 시 기록

## 수행 과정

1. Wireshark에서 대상 네트워크 인터페이스를 선택한다.
2. 허가된 테스트 환경에서 DHCP 주소 획득을 수행한다.
3. `udp.port == 67 || udp.port == 68` 필터로 패킷을 확인한다.
4. Discover 패킷의 헤더와 옵션을 분석한다.

## 관찰 결과

**상태: 실험 미수행.** 아래 항목은 기록 양식이며 실제 측정값이 아니다. 캡처 파일과 화면 이미지는 아직 첨부하지 않았다.

| 관찰 항목           | 예상값          | 실제 관찰 |
| ------------------- | --------------- | --------- |
| 출발지 IP           | 0.0.0.0         | 미기록    |
| 목적지 IP           | 255.255.255.255 | 미기록    |
| UDP 출발지 / 목적지 | 68 / 67         | 미기록    |
| DHCP Message Type   | Discover        | 미기록    |

Wireshark 표시 필터:

```text
udp.port == 67 || udp.port == 68
```

스크린샷과 정제한 PCAP를 첨부하는 방법은 저장소의 README와 `templates/lab.md`를 참고한다.

## 해석

관찰 결과가 예상과 일치하는지 검토한다.

## 결론

실험 완료 후 작성한다.

## 관련 개념

DHCP, UDP, IP Broadcast
