export const siteData = {
  profile: {
    name: "신진섭",
    brandName: "신진섭",
    eyebrow: "레벨기획 포트폴리오",
    title: "저는 공간을 정량화하고\n근거로 설계하는\n레벨기획자입니다",
    summary: "의도한 플레이 경험을 공간으로 설계합니다.\n수치와 플레이테스트를 근거로 조정합니다.",
    focus: "필드 · 던전 · 역기획",
    about: "의도한 플레이 경험을 공간으로 설계합니다. 수치와 플레이테스트를 근거로 조정합니다.",
    links: [],
    heroActions: [
      { label: "필드 플레이", href: "#play", primary: true },
      { label: "포트폴리오 보기", href: "#portfolio", primary: false }
    ]
  },
  viewerModels: [
    { id: "field", label: "필드", title: "필드 레벨기획서", path: "./assets/models/field.glb", enabled: true },
    { id: "dungeon", label: "던전", title: "던전 레벨기획서", path: "./assets/models/dungeon.glb", enabled: true }
  ],
  projects: [
    {
      index: "01", title: "필드 레벨기획서", status: "필드 플레이",
      role: "성당 외부에서 던전 입구까지 이어지는 고정 쿼터뷰 필드입니다",
      tags: ["시야 설계", "오브젝트 배치", "이동 유도", "플레이테스트"],
      links: [{ label: "필드 플레이", href: "#play", primary: true }, { label: "공간 살펴보기", href: "#viewer" }]
    },
    {
      index: "02", title: "던전 레벨기획서", status: "던전 플레이",
      role: "높이와 시야로 힌트를 공개하는 고정 쿼터뷰 던전입니다",
      tags: ["공간 설계", "장치", "플레이 검증"],
      links: [{ label: "던전 플레이", href: "#play", primary: true }, { label: "참고 영상", href: "https://youtu.be/d1TWflW1VhE" }]
    },
    {
      index: "03", title: "아르고스 2페이즈 역기획서", status: "역기획",
      role: "기존 레벨의 공간 구조와 플레이 흐름을 분석했습니다.",
      tags: ["공간 분석", "플레이 흐름"], links: []
    }
  ]
};
