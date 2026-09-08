const fs=require('fs');
const cp=require('child_process');

function harden(file){
  let s=fs.readFileSync(file,'utf8');
  const old="app.use(express.json());\napp.use(express.static(path.join(__dirname, 'public')));";
  const neu=`app.disable('x-powered-by');
app.use(express.json());
app.use((req,res,next)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  if(req.path==='/' || req.path.endsWith('.html')) res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {etag:true, maxAge:'1h'}));`;
  if(!s.includes("app.disable('x-powered-by')")){
    if(!s.includes(old)) throw new Error('static middleware anchor not found in '+file);
    s=s.replace(old,neu);
    fs.writeFileSync(file,s);
  }
}

harden('server.js');
if(fs.existsSync('public/server.js')) harden('public/server.js');

let h=cp.execFileSync('git',['show','cbe97c3e7dec46478e998c4afdfc3f06ebe1932e:public/index.html'],{encoding:'utf8'});
h=h.replace('/style.css?v=7.0','/style.css?v=7.4.1');
h=h.replace('PORTFOLIO GENOME · v7.0','PORTFOLIO GENOME · v7.2');
h=h.replace('<script src="/app.js?v=7.0"></script>','<script src="/app.js?v=7.0"></script><script src="/v71.js?v=7.1"></script><script src="/v71-data.js?v=7.2.1"></script><script src="/v72.js?v=7.2.1"></script><script src="/v73.js?v=7.3.0"></script><script src="/v731.js?v=7.3.1"></script><script src="/v74.js?v=7.4.0"></script>');
if(!h.includes('/v74.js?v=7.4.0')) throw new Error('v7.4 scripts not injected');
fs.writeFileSync('public/index.html',h);
fs.writeFileSync('public/robots.txt','User-agent: *\nDisallow: /\n');
console.log('Project Shield applied: self-contained index + response hardening');
