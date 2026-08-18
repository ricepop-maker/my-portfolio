# My Portfolio

정적 HTML/CSS/JS로 만든 개인 포트폴리오와 미니 프로젝트 모음입니다. 빌드 도구 없이 `index.html`을 브라우저로 열면 바로 실행됩니다.

## 시작하기

`portfolio/index.html`을 브라우저로 열면 포트폴리오 메인 화면이 나타납니다.

## 포트폴리오 (`portfolio/`)

3개 프로젝트를 카드로 보여주는 메인 페이지입니다.

- 카드를 클릭하면 해당 프로젝트로 이동
- **라이트 / 다크 / 오션 / 포레스트 / 선셋** 5가지 테마 지원 (기본값: 라이트)
- 선택한 테마는 `localStorage`에 저장되어 포트폴리오와 3개 프로젝트 전체에 동일하게 적용됨

## 소개된 프로젝트

| 프로젝트 | 폴더 | 설명 |
|---|---|---|
| Todo App | [`todo/`](todo) | 할 일을 추가, 완료, 삭제할 수 있는 할 일 목록 앱 |
| 환율 변환기 | [`exchangerate/`](exchangerate) | 금액을 입력하면 원하는 통화로 환산해주는 변환기 |
| 스네이크 게임 | [`SnakeGame/`](SnakeGame) | 방향키로 조작하는 클래식 스네이크 게임 |

## 그 외 학습용 페이지

- [`hello world/`](hello%20world) — 애니메이션 배경, 가위바위보 게임 등 학습용 데모
- [`profile/`](profile) — 자기소개 카드 페이지
- [`calculator/`](calculator) — 계산기
- [`counter/`](counter) — 카운터 앱

## 구조

각 폴더는 독립적인 정적 사이트로, 자체 `index.html` / `style.css` / `main.js`만 사용하며 폴더 간 코드나 상태를 공유하지 않습니다 (단, 포트폴리오 테마는 `localStorage`를 통해 공유됩니다).
