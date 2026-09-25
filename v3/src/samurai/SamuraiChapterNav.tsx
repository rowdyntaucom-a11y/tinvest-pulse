export type SamuraiChapter={id:string;code:string;label:string;note?:string};

function go(id:string){
 const el=document.getElementById(id);
 if(!el)return;
 const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
 el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
}

export function SamuraiChapterNav({chapters,label="Карта раздела"}:{chapters:SamuraiChapter[];label?:string}){
 return <nav className="sam-chapter-nav" aria-label={label}>
  <header><span>章 / CHAPTER MAP</span><strong>{label}</strong></header>
  <div>{chapters.map((chapter,index)=><button key={chapter.id} type="button" onClick={()=>go(chapter.id)}><i>{chapter.code}</i><span><b>{chapter.label}</b>{chapter.note&&<small>{chapter.note}</small>}</span><em>{String(index+1).padStart(2,"0")}</em></button>)}</div>
 </nav>;
}

export function SamuraiNextCue({targetId,label}:{targetId:string;label:string}){
 return <button type="button" className="sam-chapter-next" onClick={()=>go(targetId)} aria-label={label}>
  <span>{label}</span><i aria-hidden="true">⌄</i>
 </button>;
}
