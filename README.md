# MeetingNotes

: whisper와 chatgpt-4 api를 활용하여 회의 내용을 중간중간 팔로업할 수 있도록 기능을 제공하는 서비스입니다.

## Getting started

### 패키지 설치

```
npm install
```

```
npm run dev
```

## 기능

- 녹화를 시작한 지점으로부터 chunks가 일정 크기만큼 쌓일때마다 주기적으로 백엔드로 audio 파일을 formdata에 담아 전송
- 받은 데이터를 화면에 뿌려줌
