export const siteData = {
  profile: {
    name: "YOUR NAME",
    brandName: "LEVEL DESIGNER",
    eyebrow: "LOST ARK MOBILE · LEVEL DESIGN PORTFOLIO",
    title: "Playable Space.\nVisible Decisions.",
    summary: "고정 쿼터뷰 환경에서 공간 판단 → UE5 구현 → 플레이 검증 → 수정 과정을 실제 결과물과 근거 중심으로 정리하는 레벨디자인 포트폴리오.",
    focus: "UE5 · FIELD · DUNGEON · REVERSE DESIGN",
    about: "레벨을 보기 좋게 만드는 것보다, 왜 그렇게 설계했는지 설명하고 실제 플레이로 검증할 수 있는 결과물을 만드는 데 집중합니다.",
    links: [
      // 예시:
      // { label: "EMAIL", href: "mailto:you@example.com" },
      // { label: "RESUME PDF", href: "./assets/docs/resume.pdf" },
      // { label: "GITHUB", href: "https://github.com/USERNAME" }
    ],
    heroActions: [
      { label: "VIEW PORTFOLIO", href: "#portfolio", primary: true },
      { label: "OPEN 3D VIEWER", href: "#viewer", primary: false }
    ]
  },

  viewerModels: [
    {
      id: "dungeon",
      label: "DUNGEON",
      title: "Dungeon Graybox",
      path: "./assets/models/dungeon.glb",
      enabled: true
    },

    // Field GLB가 준비되면 아래 항목을 enabled: true로 바꾸고
    // assets/models/field.glb 파일을 추가하면 됨.
    {
      id: "field",
      label: "FIELD",
      title: "Field Graybox",
      path: "./assets/models/field.glb",
      enabled: false
    }
  ],

  projects: [
    {
      index: "01",
      title: "UE5 Field Level Design",
      status: "IN PROGRESS",
      role: "직무 요구사항 기반 자체 제작 과제로 설계하는 고정 쿼터뷰 MMORPG Field.",
      tags: ["LANDMARK", "CHOICE", "OBJECT", "TRANSITION"],
      links: [
        // 완료 후 연결:
        // { label: "PDF", href: "./assets/docs/field.pdf", primary: true },
        // { label: "VIDEO", href: "https://..." }
      ]
    },
    {
      index: "02",
      title: "UE5 Dungeon Level Design",
      status: "3D VIEW AVAILABLE",
      role: "START → END까지 플레이 가능한 UE5 쿼터뷰 Dungeon의 공간·기믹·시야·검증 작업.",
      tags: ["PLAYABLE LEVEL", "UE5", "PLAYTEST", "DATA"],
      links: [
        { label: "3D VIEW", href: "#viewer", primary: true }
        // PDF / Video가 준비되면 추가:
        // { label: "PDF", href: "./assets/docs/dungeon.pdf" },
        // { label: "VIDEO", href: "https://..." }
      ]
    },
    {
      index: "03",
      title: "LOST ARK Argos Reverse Level Design",
      status: "PORTFOLIO",
      role: "기존 LOST ARK Level을 공간 구조와 Player Behavior의 관계로 분석한 역기획.",
      tags: ["REVERSE DESIGN", "SPATIAL ANALYSIS", "PLAYER BEHAVIOR"],
      links: [
        // PDF 연결 예시:
        // { label: "PDF", href: "./assets/docs/argos.pdf", primary: true }
      ]
    }
  ]
};
