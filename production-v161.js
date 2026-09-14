const fs=require('fs');
const path=require('path');
const Module=require('module');
const basePath=path.join(__dirname,'production-v160.js');
let src=fs.readFileSync(basePath,'utf8');

const marker="const mod=new Module(basePath,module);";
if(!src.includes(marker))throw new Error('v16.1: v16.0 compile marker changed');

const instrumentBadgesInjectedCode=String.raw`
const instrumentBadgesMarker="\napp.get('*', (req, res) => {";
if(!core.includes(instrumentBadgesMarker))throw new Error('QVANIX v2: instrument badge route marker changed');
const instrumentBadgesCode=[
 "const qvanixInstrumentBadgeCache={expiresAt:0,payload:null};",
 "function qvanixBadgeText(value){const text=typeof value==='string'?value.trim():'';return text||null;}",
 "function qvanixBadgeBrand(meta){const brand=meta?.brand&&typeof meta.brand==='object'?meta.brand:null;if(!brand)return null;const logoName=qvanixBadgeText(brand.logoName||brand.logo_name);if(!logoName)return null;return {logoName,logoBaseColor:qvanixBadgeText(brand.logoBaseColor||brand.logo_base_color),textColor:qvanixBadgeText(brand.textColor||brand.text_color)};}",
 "app.get('/api/instrument-badges',async(req,res)=>{",
 "  try{",
 "    const now=Date.now();",
 "    if(qvanixInstrumentBadgeCache.payload&&qvanixInstrumentBadgeCache.expiresAt>now)return res.json(qvanixInstrumentBadgeCache.payload);",
 "    const accountsResponse=await getAccounts();",
 "    const account=selectAccount(accountsResponse);",
 "    if(!account?.id)return res.status(404).json({version:'1.0',available:false,items:[],error:'No open account'});",
 "    const portfolio=await getPortfolio(account.id);",
 "    const positions=Array.isArray(portfolio?.positions)?portfolio.positions:[];",
 "    const items=[];let rejected=0;",
 "    for(let i=0;i<positions.length;i+=4){",
 "      const chunk=positions.slice(i,i+4);",
 "      const rows=await Promise.all(chunk.map(async position=>{",
 "        const figi=qvanixBadgeText(position?.figi);const instrumentUid=qvanixBadgeText(position?.instrumentUid);const instrumentType=qvanixBadgeText(position?.instrumentType)||'';",
 "        if(!figi)return null;",
 "        try{const meta=await getInstrumentMeta(figi,instrumentType);const brand=qvanixBadgeBrand(meta);if(!brand)return {figi,instrumentUid,ticker:qvanixBadgeText(meta?.ticker||position?.ticker),instrumentType,brand:null};return {figi,instrumentUid,ticker:qvanixBadgeText(meta?.ticker||position?.ticker),instrumentType,brand};}catch(error){return {figi,instrumentUid,ticker:qvanixBadgeText(position?.ticker),instrumentType,brand:null};}",
 "      }));",
 "      for(const row of rows){if(row)items.push(row);else rejected+=1;}",
 "    }",
 "    const branded=items.filter(item=>item.brand?.logoName).length;",
 "    const payload={version:'1.0',available:branded>0,items,positions:positions.length,branded,rejected,source:'T-Bank instrument brand metadata',logoCdn:'https://invest-brands.cdn-tinkoff.ru/',cacheSeconds:21600};",
 "    qvanixInstrumentBadgeCache.payload=payload;qvanixInstrumentBadgeCache.expiresAt=now+21600000;",
 "    res.setHeader('Cache-Control','private, max-age=3600');",
 "    return res.json(payload);",
 "  }catch(error){",
 "    console.warn('QVANIX instrument badges failed:',error?.message||error);",
 "    return res.status(502).json({version:'1.0',available:false,items:[],error:'instrument badges unavailable'});",
 "  }",
 "});",
 ""
].join('\n');
core=core.replace(instrumentBadgesMarker,'\n'+instrumentBadgesCode+instrumentBadgesMarker);
`;

const bridge=`const instrumentBadgesBridge=${JSON.stringify(instrumentBadgesInjectedCode)};\n`;
src=src.replace(marker,bridge+marker);
const oldCompile="mod._compile(src,basePath);";
const newCompile="src=src.replace('const mod=new Module(corePath,module);',instrumentBadgesBridge+'const mod=new Module(corePath,module);');\nmod._compile(src,basePath);";
if(!src.includes(oldCompile))throw new Error('v16.1: v16.0 final compile marker changed');
src=src.replace(oldCompile,newCompile);

const mod=new Module(basePath,module);
mod.filename=basePath;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(src,basePath);
