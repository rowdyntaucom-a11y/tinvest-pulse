import{useEffect,useState}from"react";
export type CoreDensityMode="brief"|"compact"|"full";
const KEY="qvanix.core.density.v215";
function read():CoreDensityMode{try{const value=localStorage.getItem(KEY);return value==="brief"||value==="full"||value==="compact"?value:"compact"}catch{return"compact"}}
export function useCoreDensity(){const[mode,setMode]=useState<CoreDensityMode>(read);useEffect(()=>{try{localStorage.setItem(KEY,mode)}catch{}},[mode]);return{mode,setMode}}
