from pathlib import Path
import sys,re,hashlib,json,gzip
root=Path(__file__).resolve().parents[1]
import tinycss2
def compact(text):
 rules=tinycss2.parse_stylesheet(text,skip_comments=True,skip_whitespace=True)
 def walk(rules):
  seen=set();out=[]
  for r in reversed(rules):
   if r.type=='qualified-rule':
    key=tinycss2.serialize([r])
    if key in seen:continue
    seen.add(key)
   if r.type=='at-rule' and r.content and r.lower_at_keyword in ['media','supports','layer']:
    r.content=tinycss2.parse_component_value_list(walk(tinycss2.parse_rule_list(r.content,skip_comments=True,skip_whitespace=True)))
   out.append(r)
  return tinycss2.serialize(reversed(out))
 return '\n'.join(line.rstrip() for line in walk(rules).splitlines())
sources=['styles.css','portfolio-details.css','contact-composer.css','interface-refinements.css']
full='\n'.join((root/'assets/css'/p).read_text(encoding='utf-8') for p in sources)
bundle=compact(full)
fingerprint=hashlib.sha256(bundle.encode()).hexdigest()[:12]
file='site.'+fingerprint+'.css'
(root/'assets/css'/file).write_text(bundle,encoding='utf-8')
critical=compact((root/'assets/css/critical-source.css').read_text(encoding='utf-8')).replace('../fonts/','/assets/fonts/')
html=(root/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<style id="hp-critical-css">[\s\S]*?</style>','',html)
html=re.sub(r'<link rel="stylesheet" href="assets/css/(?:(?:styles|portfolio-details|contact-composer)\.css|site\.[\da-f]+\.css)[^>]*>','',html)
html=html.replace('<noscript></noscript>','')
html=html.replace('</head>','<style id="hp-critical-css">'+critical+'</style><link rel="stylesheet" href="assets/css/'+file+'" media="print" onload="this.media=\'all\'"><noscript><link rel="stylesheet" href="assets/css/'+file+'"></noscript></head>')
(root/'index.html').write_text(html,encoding='utf-8')
stats={'before_bytes':len(full.encode()),'bundle_bytes':len(bundle.encode()),'bundle_gzip':len(gzip.compress(bundle.encode())),'critical_bytes':len(critical.encode()),'critical_gzip':len(gzip.compress(critical.encode())),'filename':file}
(root/'docs/performance-sizes.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print(json.dumps(stats))
