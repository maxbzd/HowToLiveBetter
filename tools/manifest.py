"""Пересчитывает docs/translation-manifest.csv: статус каждой из 630 записей оригинала.
Запуск: python3 tools/manifest.py   (после каждой пачки)"""
import csv,glob,json,os,sys,collections
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(ROOT,'tools'))
from show import SRC
T=json.load(open(os.path.join(ROOT,'tools','triage.json'),encoding='utf-8'))
done=dict((k,v) for k,v in T['old_entries_map'].items())
for f in sorted(glob.glob(os.path.join(ROOT,'src','in','*.json'))):
    for it in json.load(open(f,encoding='utf-8')): done[it['k']]=it['id']
def title(k): return SRC[k].split('\n')[0].strip()[:90]
def st(k):
    ch=k.split('.')[0]
    if k in done: return "готово"
    if k in T['not_transferred_selfharm_methods']: return "не переносим: описывает способы самоповреждения"
    if k in T['china_only_remove']: return "убрать: только Китай (нет российского аналога)"
    if k in T['deferred']: return "отложено: суть в китайских законах или слабые данные"
    return "искать российский аналог: "+T['russia_topic_by_chapter'].get(ch,ch)
def keys(): return sorted(SRC,key=lambda k:tuple(int(x) for x in k.split('.')))
out=os.path.join(ROOT,'docs','translation-manifest.csv')
w=csv.writer(open(out,'w',encoding='utf-8-sig',newline=''))
w.writerow(["ключ","статус","id на сайте","заголовок оригинала (китайский)"])
c=collections.Counter(); topics=collections.Counter()
for k in keys():
    s=st(k); c[s.split(':')[0]]+=1
    if s.startswith('искать'): topics[s.split(': ',1)[1]]+=1
    w.writerow([k,s,done.get(k,''),title(k)])
print("Всего в оригинале:",len(SRC)); print(dict(c)); print("--- осталось найти российский аналог, по темам ---")
for t,n in topics.most_common(): print(f"{n:3} {t}")
