import re,json,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORPUS=os.path.join(ROOT,'source','HowToLiveBetter.html')
s=open(CORPUS,encoding='utf-8').read()
raw=s[s.index('window.__CORPUS__=')+len('window.__CORPUS__='):]
raw=raw[:raw.index('</script>')].rstrip().rstrip(';')
D=json.loads(raw)
SRC={}
for k,v in D['parts'].items():
    if not k.startswith('book/'): continue
    ch=int(k.split('/')[1][:2])
    for idx,e in enumerate(re.split(r'^### \d+\.',v,flags=re.M)[1:],1): SRC[f"{ch}.{idx}"]=e
def show(key,full=False):
    e=SRC[key]; lines=e.strip().split('\n'); title=lines[0].strip()
    tg=re.search(r'成本标签:(.*?)-->',e,re.S).group(1).strip().replace('\n',' ')
    out=[f"[{key}] {title}",f"  tags: {tg}"]
    for l in lines[2:]:
        if l.startswith('- 来源：') and not full:
            urls=re.findall(r'<(https?://[^>\s]+)>',l); out.append("  来源: "+str(len(urls))+" url"); continue
        if l.startswith('- 证据等级'): out.append("  "+l.strip()); continue
        if l.strip(): out.append("  "+l.strip())
    return "\n".join(out)
if __name__=='__main__':
    for k in sys.argv[1:]: print(show(k)); print()
