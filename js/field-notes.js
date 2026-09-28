/* Selected excerpts from the final field level design PDF (pp. 7–14, 23). */
export const fieldNotes = [
    {number:1,x:161,z:1,floorY:16.88,title:'공통 진입부와 두 갈래 길',body:'진행 중 순례자의 계단과 토벌 진입로가 함께 보여, 두 경로의 진입부를 확인할 수 있습니다\n한 화면에서 두 진입부를 확인합니다\n진행 방향을 정하기 전에 선택지를 제시했습니다\n진행 방향을 플레이어가 직접 선택하도록 했습니다',highlights:['한 화면에서 두 진입부를 확인','플레이어가 직접 선택']},
    {number:2,x:158.5,z:-17.5,floorY:21.6,title:'순례자의 계단',body:'긴 이동의 지루함을 줄이도록 단서와 정보 보상을 배치했습니다\n긴 이동 중 새로운 단서가 이어지도록 배치했습니다\n관찰로 내부 장치를 미리 확인하도록 했습니다',highlights:['단서와 정보 보상','새로운 단서','내부 장치를 미리 확인']},
    {number:2,x:166,z:11,floorY:19,title:'바닥 타일',body:'바닥 타일을 발견하면 최종 목적지까지 도착할 수 있도록 설계했습니다\n물가를 따라 바닥 타일로 이어집니다\n천막 탐색 후 바닥 타일이 다시 보입니다\n바닥 타일이 던전 입구까지 이어집니다',highlights:['최종 목적지까지 도착','바닥 타일이 다시 보입니다','던전 입구까지 이어집니다']},
    {number:3,x:175,z:7,floorY:23.7,title:'호수',body:'성당을 미리 알리고 물가를 따라 바닥 타일로 이동하도록 호수를 배치했습니다\n수면에 성당 실루엣이 비치도록 배치했습니다\n호수 끝에서 바로 오르는 길을 막고 물가를 따라 바닥 타일로 연결했습니다\n성당 반사에 대한 반응이 관찰되지 않아 수면 표현을 보강했습니다',highlights:['바닥 타일로 이동','성당 실루엣','수면 표현을 보강']},
    {number:4,x:184,z:20,floorY:25.2,title:'천막',body:'천막을 탐색한 뒤 바닥 타일로 돌아오도록 보조 동선을 구성했습니다\n타일을 따르던 참가자가 천막으로 이탈했습니다\n천막이 별도의 목표 지점처럼 보였을 수 있다고 판단했습니다\n천막과 중간 오브젝트를 타일에 붙여 하나의 구성으로 보이도록 했습니다',highlights:['바닥 타일로 돌아오도록','천막으로 이탈','별도의 목표 지점처럼','타일에 붙여 하나의 구성으로']},
    {number:5,x:215,z:0,floorY:38.4,title:'던전 전환의 설계 의도',body:'어느 경로를 선택해도 정면 입구를 통해 같은 던전 시작점으로 이어집니다\n두 경로 모두 같은 정면 입구로 진입합니다\n정면 입구를 통과하면 던전 시작 화면으로 전환됩니다',highlights:['같은 정면 입구','던전 시작 화면으로']}
  ];

export function appendNoteParagraph(container,line,highlights=[]){
  const paragraph=document.createElement('p');
  const matches=highlights.map(phrase=>({phrase,index:line.indexOf(phrase)})).filter(match=>match.index>=0).sort((a,b)=>a.index-b.index);
  let offset=0;
  for(const match of matches){
    if(match.index<offset)continue;
    paragraph.append(document.createTextNode(line.slice(offset,match.index)));
    const mark=document.createElement('mark');
    mark.textContent=match.phrase;
    paragraph.append(mark);
    offset=match.index+match.phrase.length;
  }
  paragraph.append(document.createTextNode(line.slice(offset)));
  container.append(paragraph);
}
