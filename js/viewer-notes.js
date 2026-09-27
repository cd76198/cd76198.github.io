import { fieldNotes, appendNoteParagraph } from './field-notes.js?v=3';
import { dungeonNotes } from './dungeon-notes.js';

export function createViewerNotes(){
  const dialog=document.getElementById('viewer-note-dialog');
  const links=document.getElementById('viewer-note-links');
  let modelId=null;
  let notes=[];

  function open(index){
    const note=notes[index];
    if(!note)return;
    document.getElementById('viewer-note-source').textContent=modelId==='field'?'안게모스의 순례길':'이름 없는 신의 성당';
    document.getElementById('viewer-note-title').textContent=`${index+1}. ${note.title}`;
    const content=document.getElementById('viewer-note-content');
    content.replaceChildren();
    for(const line of note.body.split('\n'))appendNoteParagraph(content,line,note.highlights);
    dialog.showModal();
  }

  function setModel(id){
    if(dialog.open)dialog.close();
    modelId=id;
    notes=id==='field'?fieldNotes:id==='dungeon'?dungeonNotes:[];
    links.replaceChildren();
    notes.forEach((note,index)=>{
      const button=document.createElement('button');
      button.type='button';button.textContent=`${index+1}. ${note.title}`;
      button.addEventListener('click',()=>open(index));
      links.append(button);
    });
  }

  function showFallback(){
    if(dialog.open)dialog.close();
    links.replaceChildren();
    for(const [id,title,items] of [['field','안게모스의 순례길',fieldNotes],['dungeon','이름 없는 신의 성당',dungeonNotes]]){
      const group=document.createElement('div');group.className='viewer-note-group';
      const heading=document.createElement('h4');heading.textContent=title;group.append(heading);
      items.forEach((note,index)=>{
        const button=document.createElement('button');button.type='button';button.textContent=`${index+1}. ${note.title}`;
        button.addEventListener('click',()=>{modelId=id;notes=items;open(index)});
        group.append(button);
      });
      links.append(group);
    }
  }

  document.getElementById('viewer-note-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  return {open,setModel,showFallback};
}
