import{useEffect,useState}from"react";

export type CoreExperienceMode="simple"|"pro";

const KEY="qvanix.core.experience.v1";
type Persisted={mode?:CoreExperienceMode;onboardingSeen?:boolean};

function read():Required<Persisted>{
 try{
  const parsed=JSON.parse(localStorage.getItem(KEY)||"{}") as Persisted;
  return{
   mode:parsed.mode==="pro"?"pro":"simple",
   onboardingSeen:parsed.onboardingSeen===true,
  };
 }catch{
  return{mode:"simple",onboardingSeen:false};
 }
}

export function useCoreExperience(){
 const initial=read();
 const[mode,setMode]=useState<CoreExperienceMode>(initial.mode);
 const[onboardingSeen,setOnboardingSeen]=useState(initial.onboardingSeen);
 useEffect(()=>{
  try{localStorage.setItem(KEY,JSON.stringify({mode,onboardingSeen}))}catch{}
 },[mode,onboardingSeen]);
 return{
  mode,
  setMode,
  onboardingSeen,
  finishOnboarding:(nextMode:CoreExperienceMode=mode)=>{setMode(nextMode);setOnboardingSeen(true)},
  reopenOnboarding:()=>setOnboardingSeen(false),
 };
}
