import type{V3Shell}from"./model";

export function V3WorkspaceLoading({shell,label,glyph}:{shell:V3Shell;label:string;glyph:string}){
 return <main className="v3-workspace-loading" data-shell={shell} aria-live="polite" role="status">
  <section className="v3-workspace-loading__panel">
   <i className="v3-workspace-loading__sigil" aria-hidden="true">{glyph}</i>
   <div><span>QVANIX // TRANSIT</span><strong>{label}</strong><small>Подготавливаем рабочее пространство</small></div>
   <b aria-hidden="true"><i/><i/><i/></b>
  </section>
 </main>
}