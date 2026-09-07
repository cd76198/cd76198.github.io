# Level Design Portfolio — GitHub Pages Ready

이 폴더는 그대로 GitHub Pages에 올릴 수 있는 정적 Portfolio Site입니다.

현재 포함된 것:

- 첫 화면 Portfolio Hero
- Dungeon GLB 3D Spatial Viewer
- FREE / TOP / QUARTER / RESET
- Restored Colors / All Gray
- Grid / Axis
- Field / Dungeon 모델 확장 구조
- Portfolio 3개 카드
- About 영역
- PDF / Resume / GitHub / Video 링크 확장 구조
- Mobile 대응

---

# 1. 로컬에서 확인

이 폴더에서:

```bash
python -m http.server 8000
```

브라우저:

```text
http://localhost:8000
```

---

# 2. GitHub Pages 배포 — 가장 쉬운 방법

## 방법 A — 개인 홈페이지 형태

GitHub Repository를 다음 이름으로 생성:

```text
YOUR_GITHUB_ID.github.io
```

예:

```text
jslee.github.io
```

이 폴더의 **내용물 전체**를 Repository 최상위에 업로드합니다.

최종 구조가 이렇게 보여야 합니다.

```text
YOUR_GITHUB_ID.github.io/
├─ index.html
├─ css/
├─ js/
├─ assets/
├─ README.md
└─ .nojekyll
```

GitHub:

```text
Repository
→ Settings
→ Pages
→ Build and deployment
→ Deploy from a branch
→ Branch: main
→ /(root)
→ Save
```

잠시 뒤:

```text
https://YOUR_GITHUB_ID.github.io/
```

에서 접속할 수 있습니다.

---

## 방법 B — 기존 GitHub 계정 안의 Portfolio Repository

Repository 이름을 예:

```text
level-design-portfolio
```

로 만든 경우:

```text
https://YOUR_GITHUB_ID.github.io/level-design-portfolio/
```

형태로 배포할 수 있습니다.

이 사이트는 경로를 상대경로로 작성했기 때문에 Project Pages에서도 동작하도록 구성되어 있습니다.

---

# 3. 가장 먼저 수정할 파일

대부분의 콘텐츠는 아래 파일 하나에서 바꿀 수 있습니다.

```text
js/site-data.js
```

코드 구조를 직접 수정하지 않고도:

- 이름
- 소개문
- About
- Email
- Resume
- GitHub
- Portfolio 카드
- PDF
- Video
- Viewer Model

을 연결할 수 있습니다.

---

# 4. 이름 / 소개 수정

`js/site-data.js`

```js
profile: {
  name: "YOUR NAME",
  brandName: "LEVEL DESIGNER",
  ...
}
```

여기만 수정하면 됩니다.

---

# 5. Email / Resume / GitHub 추가

`profile.links`에 추가:

```js
links: [
  { label: "EMAIL", href: "mailto:you@example.com" },
  { label: "RESUME PDF", href: "./assets/docs/resume.pdf" },
  { label: "GITHUB", href: "https://github.com/USERNAME" }
]
```

Resume 파일:

```text
assets/docs/resume.pdf
```

---

# 6. Field GLB 추가

현재:

```text
assets/models/dungeon.glb
```

만 존재합니다.

추후 UE5 Field를 Export한 뒤:

```text
assets/models/field.glb
```

에 넣습니다.

그리고:

```text
js/site-data.js
```

에서:

```js
{
  id: "field",
  label: "FIELD",
  title: "Field Graybox",
  path: "./assets/models/field.glb",
  enabled: false
}
```

를:

```js
enabled: true
```

로 바꾸면 Viewer에 FIELD 버튼이 자동 활성화됩니다.

---

# 7. PDF 연결

예:

```text
assets/docs/
├─ field.pdf
├─ dungeon.pdf
└─ argos.pdf
```

그 다음 각 Project의 `links`를 수정합니다.

예:

```js
links: [
  {
    label: "PDF",
    href: "./assets/docs/dungeon.pdf",
    primary: true
  },
  {
    label: "VIDEO",
    href: "https://youtube.com/..."
  }
]
```

그러면 Portfolio 카드 하단에 버튼이 자동 생성됩니다.

---

# 8. 새로운 Portfolio 추가

`js/site-data.js`의 `projects` 배열에 하나 추가하면 됩니다.

```js
{
  index: "04",
  title: "New Project",
  status: "PORTFOLIO",
  role: "프로젝트 설명",
  tags: ["TAG 01", "TAG 02"],
  links: [
    {
      label: "PDF",
      href: "./assets/docs/new-project.pdf",
      primary: true
    }
  ]
}
```

HTML을 새로 만들 필요 없이 카드가 자동 생성됩니다.

---

# 9. 3D Viewer 모델 추가

`viewerModels` 배열에 추가하면 됩니다.

```js
{
  id: "new-level",
  label: "NEW LEVEL",
  title: "New Level",
  path: "./assets/models/new-level.glb",
  enabled: true
}
```

Viewer 상단에 모델 선택 버튼이 자동으로 추가됩니다.

---

# 10. 현재 Dungeon 색상 복구 방식

현재 GLB Export에서 일부 Unreal Material이 Magenta로 깨져 있었습니다.

Viewer는:

- 정상 Export Material → 유지
- Magenta Error Material → Neutral Gray
- `MI_Grid_Red_*` → Red
- `MI_Grid_Green_*` → Green
- `MI_Grid_Blue_*` → Blue

로 처리합니다.

`RESTORED COLORS` 버튼으로:

```text
복구 색상 / 전체 Gray
```

를 전환할 수 있습니다.

---

# 11. 폴더 구조

```text
level-design-portfolio-github/
│
├─ index.html
├─ .nojekyll
├─ README.md
│
├─ css/
│  └─ style.css
│
├─ js/
│  ├─ app.js
│  ├─ site-data.js
│  └─ viewer.js
│
└─ assets/
   ├─ models/
   │  └─ dungeon.glb
   │
   ├─ images/
   │
   └─ docs/
```

---

# 12. 앞으로 추천 확장 순서

현재는 웹 기술을 추가하는 것보다 Portfolio 내용 완성이 우선입니다.

추천 순서:

1. 현재 Dungeon Viewer 정상 동작
2. GitHub Pages 배포
3. Field 완성
4. Field GLB 추가
5. Field / Dungeon PDF 연결
6. Argos PDF 연결
7. Final Play Video 연결
8. About / Resume 정리
9. 필요할 때만 Player Path / Heatmap / Hotspot 추가

---

# 13. 하지 않는 것을 권장하는 확장

현재 Portfolio 목적상 다음은 우선순위가 낮습니다.

- 과도한 Three.js Animation
- Game처럼 직접 이동해야 하는 Viewer
- Heavy Post Processing
- Particle Effect
- 큰 Texture
- 과도한 Transition Animation
- 웹 기술 자체를 강조하는 연출

3D Viewer의 목적은:

> Level Design 공간을 더 빨리 이해시키는 것

입니다.

실제 Evidence는 계속:

- UE5 Screenshot
- Top View
- Quarter-view
- Playtest
- Before / After
- Final Video

를 우선합니다.

---

# 14. GLB 파일 크기

현재 `dungeon.glb`는 약 7MB 수준이므로 GitHub에 올리기에는 부담이 크지 않습니다.

향후 Field까지 추가했을 때 페이지 로딩이 느려지면 그때:

- Texture 제거 / 축소
- Mesh Simplification
- Draco / Meshopt 압축

등을 검토하면 됩니다.

처음부터 과도한 최적화를 할 필요는 없습니다.
