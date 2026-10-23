import sys,re,html,subprocess,json,os
# usage: ca.py <doc_id> "Статья 159." [maxchars]
doc=sys.argv[1]; title=sys.argv[2]; mx=int(sys.argv[3]) if len(sys.argv)>3 else 3500
cache=f'toc_{doc}.json'
def curl(u):
    return subprocess.run(['curl','-s','-m','60','-L','-A','Mozilla/5.0',u],capture_output=True).stdout.decode('utf-8','ignore')
if os.path.exists(cache): toc=json.load(open(cache,encoding='utf-8'))
else:
    h=curl(f'https://www.consultant.ru/document/cons_doc_LAW_{doc}/')
    toc={}
    for m in re.finditer(r'<a[^>]+href="(/document/cons_doc_LAW_%s/[0-9a-f]{40}/?[^"]*)"[^>]*>(.*?)</a>'%doc,h,flags=re.S):
        t=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',m.group(2)))).strip()
        toc.setdefault(t,m.group(1))
    json.dump(toc,open(cache,'w',encoding='utf-8'),ensure_ascii=False)
hits=[(t,u) for t,u in toc.items() if t.startswith(title)]
if not hits: print('NOT FOUND; sample:',list(toc)[:5]); sys.exit()
t,u=hits[0]; print('>>',t,u)
x=curl('https://www.consultant.ru'+u)
x=re.sub(r'<script.*?</script>|<style.*?</style>','',x,flags=re.S)
x=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',x)))
i=x.find(title); print(x[i:i+mx])
