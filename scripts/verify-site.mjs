import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const cssPath=path.join(root,'assets/css/styles.css');
const css=fs.readFileSync(cssPath,'utf8');
const errors=[],ids=new Set();
for(const [,id] of html.matchAll(/\bid="([^"]+)"/g)){if(ids.has(id))errors.push(`Duplicate id: ${id}`);ids.add(id);}
function check(ref,base){
  ref=ref.trim().replace(/^['"]|['"]$/g,'');
  if(/^(https?:|mailto:|tel:|data:|\/\/)/.test(ref))return;
  if(ref.startsWith('#')){if(ref.length>1&&!ids.has(ref.slice(1)))errors.push(`Missing section: ${ref}`);return;}
  const file=ref.split(/[?#]/)[0];if(!file)return;
  const resolved=path.resolve(base,file);
  if(!resolved.startsWith(root)||!fs.existsSync(resolved))errors.push(`Missing asset: ${ref}`);
}
for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g))check(ref,root);
for(const [,ref] of css.matchAll(/url\(([^)]+)\)/g))check(ref,path.dirname(cssPath));
const sprite=fs.readFileSync(path.join(root,'assets/brand-icons.svg'),'utf8');
const symbols=new Set([...sprite.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
for(const [,symbol] of html.matchAll(/brand-icons\.svg#([^"\s]+)/g))if(!symbols.has(symbol))errors.push(`Missing logo: ${symbol}`);
const seo=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if(!seo)errors.push('Missing structured data');else JSON.parse(seo[1]);
JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
for(const file of ['assets/js/app.js','assets/js/preferences.js'])execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'inherit'});
if(/C:\\Users|D:\\|file:\/\//.test(html+css))errors.push('Local computer path found');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS: assets, anchors, logos, structured data and JavaScript syntax.');
