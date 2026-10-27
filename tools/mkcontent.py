"""Собирает src/gen.js из русских пачек in/*.json и метаданных оригинала.
Русский текст пишу я, теги/надёжность/затраты/источники берутся из оригинала."""
import re,json,glob,sys,os
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
    for idx,e in enumerate(re.split(r'^### \d+\.',v,flags=re.M)[1:],1):
        SRC[f"{ch}.{idx}"]=e
KM={'死亡率':'life','金钱':'money','自由':'freedom','时间':'time'}
TM={'大':3,'中':2,'小':1}
CM={'0':0,'少':1,'多':2}; TIM={'少':0,'中':1,'多':2}; WM={'否':0,'些':1,'是':2}
ABBR={'OR':"<abbr title='отношение шансов'>OR</abbr>",'RR':"<abbr title='относительный риск'>RR</abbr>",'HR':"<abbr title='отношение рисков'>HR</abbr>",'CI':"<abbr title='доверительный интервал'>ДИ</abbr>"}
def abbr(t):
    for k,v in ABBR.items(): t=t.replace('{'+k+'}',v)
    return t
def meta(key):
    e=SRC[key]
    tg=dict(re.findall(r'(\S+?)=(\S+)',re.search(r'成本标签:(.*?)-->',e,re.S).group(1)))
    ev=re.search(r'证据等级：\s*([ABC])',e).group(1)
    m=re.search(r'- 来源：(.*?)(?:\n- |\Z)',e,re.S); srcraw=m.group(1).strip() if m else ''
    pieces=[p.strip() for p in re.split(r'\s*[;；]\s*(?=[A-Za-zА-Яа-я\u4e00-\u9fff0-9「（(])',srcraw) if p.strip()]
    src=[]
    for p in pieces:
        u=re.search(r'<(https?://[^>\s]+)>',p)
        url=u.group(1) if u else ''
        label=re.sub(r'<https?://[^>]+>','',p).strip()
        label=re.split(r'[：:]\s*「',label)[0]
        label=re.sub(r'（[^）]*[\u4e00-\u9fff][^）]*）','',label)
        label=re.sub(r'，\s*第\s*([\d–、\-]+)\s*页',lambda m:', p. '+m.group(1),label)
        label=re.sub(r'，\s*第\s*([\d\.、,\-–\s]+)\s*条',lambda m:', п. '+m.group(1).replace('、',', ').strip(),label)
        label=label.replace(' 等 ',' et al. ').replace('等 (',' et al. (')
        label=label.strip().rstrip('.。 ，,')
        src.append([label,url])
    return dict(ev=ev,gets=KM[tg['口径']],tier=TM[tg['收益']],cost=[CM[tg['钱']],TIM[tg['时间']],WM[tg['毅力']]],src=src)
def nums_of(t):
    t=re.sub(r'<[^>]+>','',t).replace('\u2212','-').replace('−','-')
    t=re.sub(r'(?<=\d)[\s\u00a0](?=\d{3}\b)','',t)
    return {m.replace(',','.') for m in re.findall(r'\d+(?:[.,]\d+)?',t)}
def srcnums(t):
    t=t.replace('\u2212','-')
    out=set(); t2=re.sub(r'(?<=\d),(?=\d{3}\b)','',t)
    for m in re.findall(r'\d+(?:\.\d+)?',t2): out.add(m)
    for m in re.findall(r'\d+(?:,\d+)?',t): out.add(m.replace(',','.'))
    for m in re.findall(r'(\d+(?:\.\d+)?)\s*万',t):
        v=float(m)*10000; out|={str(int(v)),str(int(v/1000)),m,str(round(v/1e6,2)).rstrip('0').rstrip('.')}
    return out
def build():
    ents=[];warn=[];seen=set()
    for f in sorted(glob.glob(os.path.join(ROOT,'src','in','*.json'))):
        for it in json.load(open(f,encoding='utf-8')):
            key=it['k']
            if key not in SRC: warn.append((key,'NO SOURCE'));continue
            if it['id'] in seen: warn.append((key,'DUP ID '+it['id']));continue
            seen.add(it['id'])
            m=meta(key)
            e={'id':it['id']}
            if it.get('urgent'): e['kind']='urgent'
            e.update({'cat':it['cat'],'gets':m['gets'],'tier':m['tier'],'ev':m['ev']})
            if it.get('dispute'): e['dispute']=True
            e['cost']=it.get('cost',m['cost'])
            e['title']=it['t']
            e['pay']={'money':it['p'][0],'time':it['p'][1],'will':it['p'][2]}
            e['big']=it['b'];e['bigLabel']=it['bl'];e['gain']=it['bl']
            e['doit']=abbr(it['d'])
            if it.get('st'): e['steps']=[abbr(x) for x in it['st']]
            if it.get('stt'): e['stepsTitle']=it['stt']
            e['nums']=[abbr(x) for x in it['n']]
            if it.get('o'): e['ours']=abbr(it['o'])
            if it.get('c'): e['care']=abbr(it['c'])
            if it.get('lr'): e['localRu']=it['lr']
            if it.get('lk'): e['localKey']=it['lk']
            e['src']=it['src'] if 'src' in it else m['src']
            e['ch']=key
            fixed=[]
            for lab,u in e['src']:
                if re.search(r'[\u4e00-\u9fff]',lab):
                    dom=re.sub(r'^https?://(www\.)?','',u).split('/')[0] if u else ''
                    lab='Источник на китайском языке'+(': '+dom if dom else '')
                fixed.append([lab,u])
            e['src']=fixed
            # сверка цифр
            mine=set()
            for x in [it['b'],it['bl']]+it['n']+(it.get('st') or []): mine|=nums_of(x)
            S=srcnums(SRC[key])
            miss=sorted(n for n in mine if n not in S and str(int(float(n)*1000)) not in S and not (float(n)<=3 and len(n)==1))
            if miss: warn.append((key,'numbers not found in source: '+','.join(miss)))
            ents.append(e)
    js="/* СГЕНЕРИРОВАНО mkcontent.py: не править руками */\nE.push.apply(E,"+json.dumps(ents,ensure_ascii=False,separators=(',',':'))+");\n"
    open(os.path.join(ROOT,'src','gen.js'),'w',encoding='utf-8').write(js)
    return ents,warn
if __name__=='__main__':
    ents,warn=build()
    print("entries generated:",len(ents))
    for k,w in warn: print("  WARN",k,w)
