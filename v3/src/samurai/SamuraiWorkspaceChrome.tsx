import type{V3Shell}from"../app/model";

export function SamuraiWorkspaceChrome({shell,glyph,code,label}:{shell:V3Shell;glyph:string;code:string;label:string}){
 if(shell!=="samurai")return null;
 return <div className="sam-workspace-chrome" aria-hidden="true">
  <div className="sam-workspace-chrome__sigil"><b>{glyph}</b><i/></div>
  <div className="sam-workspace-chrome__code"><span>{code}</span><small>{label}</small></div>
  <div className="sam-workspace-chrome__rail"><i/><i/><i/></div>
 </div>
}