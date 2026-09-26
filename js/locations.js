// Match stable mesh names from the current UE5 dungeon export. Update these
// entries when the final GLB replaces the TEST export.
export const locations = {
  dungeon: [
    { id: 'entrance', label: '입구', mesh: 'MCP_TEST_Interior_EntranceFloor',
      summary: '내부 진입 지점. 이후 하강 동선으로 이어지는 공간의 시작을 확인할 수 있습니다.' },
    { id: 'descent', label: '하강 계단', mesh: 'MCP_TEST_Interior_DescentStep_02',
      summary: '입구에서 아래 공간으로 이어지는 높이 변화와 시야 전환을 살펴보는 구간입니다.' },
    { id: 'middle', label: '중간 전투 공간', mesh: 'MCP_TEST_Interior_MidBossFloor',
      summary: '바닥과 벽, 출구 기둥으로 구획된 중간 전투 공간입니다.' },
    { id: 'transition', label: '상층 연결로', mesh: 'MCP_TEST_Interior_TransitionHighPath',
      summary: '높이가 다른 통로가 연결되는 지점입니다. 상층과 하층의 관계를 확인할 수 있습니다.' },
    { id: 'end', label: '종착 지점', mesh: 'MCP_TEST_Interior_END_Pad',
      summary: '현재 GLB에서 확인되는 던전의 마지막 지점입니다.' }
  ]
};
