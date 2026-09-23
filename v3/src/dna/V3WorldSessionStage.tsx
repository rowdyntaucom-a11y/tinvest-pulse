import{useEffect,useMemo,useRef,useState}from"react";
import{createEmptyWorldChronicle,mergeWorldChronicleEntries,type WorldChronicleDocument}from"../../../v2/src/features/dna/worldChronicle";
import type{WorldState}from"../../../v2/src/features/dna/worldState";
import{buildFirstSunriseWorldEvent}from"../../../v2/src/features/world/worldLifecycleEvents";
import{mergeWorldSessionEvents}from"../../../v2/src/features/world/worldSessionEventPolicy";
import{WorldStage}from"./V3WorldStage";
import{clampWorldMarkerToViewport,projectWorldPointToScreen,resolveWorldCameraFrame}from"./worldCamera";
import{WORLD_EXPLORATION_LANDMARKS,resolveWorldLandmark,type WorldLandmarkId}from"./worldExploration";

const buttonStyle=(x:number,y:number)=>({position:"absolute" as const,left:x,top:y,zIndex:7,width:44,height:44,transform:"translate(-50%,-50%)",border:0,borderRadius:"999px",background:"transparent",padding:0,cursor:"pointer",display:"grid",placeItems:"center"});
const markerStyle=(active:boolean,edge:boolean)=>({display:"grid",placeItems:"center",width:active?30:24,height:active?30:24,border:`1px ${edge?"dashed":"solid"} ${active?'var(--dna-mark,#8aa2ff)':'rgba(255,255,255,.5)'}`,borderRadius:"999px",background:active?'var(--dna-mark,#8aa2ff)':'rgba(5,10,16,.72)',boxShadow:active?'0 0 0 5px rgba(255,255,255,.08),0 0 24px var(--dna-mark,#8aa2ff)':'0 4px 16px rgba(0,0,0,.35)',color:active?'#07100f':'#fff',fontSize:11,fontWeight:900,transition:"width .18s ease,height .18s ease,box-shadow .18s ease"});

export function V3WorldSessionStage({state}:{state:WorldState}){
  const[chronicle,setChronicle]=useState<WorldChronicleDocument>(()=>createEmptyWorldChronicle());
  const[landmark,setLandmark]=useState<WorldLandmarkId|null>(null);
  const[viewport,setViewport]=useState({width:1,height:1});
  const hostRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{if(state.timePhase!=="dawn")return;const observedAt=new Date().toISOString();setChronicle(current=>{const candidate=buildFirstSunriseWorldEvent(current,{timePhase:state.timePhase,observedAt});return candidate?mergeWorldChronicleEntries(current,[candidate],observedAt).document:current})},[state.timePhase]);
  useEffect(()=>{const host=hostRef.current;if(!host)return;const sync=()=>setViewport({width:Math.max(1,host.clientWidth),height:Math.max(1,host.clientHeight)});sync();const observer=new ResizeObserver(sync);observer.observe(host);return()=>observer.disconnect()},[]);

  const rendererState=useMemo<WorldState>(()=>({...state,events:mergeWorldSessionEvents(state.events,chronicle.entries)}),[state,chronicle]);
  const selected=resolveWorldLandmark(landmark);
  const focus=selected?{x:selected.x,y:selected.y}:null;
  const camera=useMemo(()=>resolveWorldCameraFrame(viewport.width,viewport.height,focus),[viewport.width,viewport.height,selected?.x,selected?.y]);

  return <div ref={hostRef} className="v3-world-session" data-world-exploration="v3" style={{position:"relative",width:"100%",height:"100%"}}>
    <div className="v3-world-entry" aria-hidden="true"><span/><b>QVANIX WORLD</b></div>
    <WorldStage state={rendererState} focus={focus}/>
    <nav aria-label="Исследовать точки живого мира" style={{position:"absolute",inset:0,zIndex:7,pointerEvents:"none"}}>
      {WORLD_EXPLORATION_LANDMARKS.map((item,index)=>{
        const projected=projectWorldPointToScreen(item,camera);
        const point=clampWorldMarkerToViewport(projected,viewport.width,viewport.height,24);
        const glyph=point.edgeX==="right"?"›":point.edgeX==="left"?"‹":point.edgeY==="top"?"⌃":point.edgeY==="bottom"?"⌄":String(index+1);
        return <button key={item.id} type="button" data-world-landmark={item.id} data-world-landmark-edge={point.edge?"true":"false"} aria-label={`Исследовать: ${item.label}`} aria-pressed={landmark===item.id} aria-expanded={landmark===item.id} aria-controls="v3-world-landmark-detail" onClick={()=>setLandmark(current=>current===item.id?null:item.id)} style={{...buttonStyle(point.x,point.y),pointerEvents:"auto"}}><span aria-hidden="true" style={markerStyle(landmark===item.id,point.edge)}>{glyph}</span></button>
      })}
    </nav>
    {selected&&<aside id="v3-world-landmark-detail" data-world-landmark-detail={selected.id} role="status" aria-live="polite" style={{position:"absolute",zIndex:8,left:12,right:12,bottom:68,maxWidth:360,margin:"0 auto",padding:"10px 56px 10px 12px",border:"1px solid color-mix(in srgb,var(--dna-mark,#8aa2ff) 28%,rgba(255,255,255,.12))",borderRadius:14,background:"rgba(5,10,16,.9)",boxShadow:"0 16px 44px rgba(0,0,0,.36)",color:"#fff",pointerEvents:"auto"}}><span style={{display:"block",fontSize:8,fontWeight:800,letterSpacing:".12em",color:"var(--dna-mark,#8aa2ff)"}}>{selected.eyebrow}</span><strong style={{display:"block",marginTop:3,fontSize:12}}>{selected.label}</strong><p style={{margin:"4px 0 0",fontSize:10,lineHeight:1.35,color:"rgba(255,255,255,.72)"}}>{selected.description}</p><button type="button" aria-label="Закрыть описание точки" onClick={()=>setLandmark(null)} style={{position:"absolute",right:4,top:4,width:44,height:44,border:0,borderRadius:12,background:"rgba(255,255,255,.08)",color:"#fff",fontSize:18}}>×</button></aside>}
  </div>
}
