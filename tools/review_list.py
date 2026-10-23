"""Собирает docs/review-checklist.md: какие записи смотрит врач и какие юрист (из src/in/*.json)."""
import json,glob,os,re
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MED_CH={'2','13','16','20','27','28','29','34'}
MED_CAT={'urgent','health','food','mind'}
MED_KEYS={'8.14','8.15','19.13','25.1','33.3','30.12','8.43','24.1'}
LAW_CH={'8','9','10','11','12','14','15','17','18','19','21','22','24','25','26','31','32','33'}
RU_DOM=('consultant.ru','garant.ru','cbr.ru','pravo.gov.ru','gosuslugi.ru','mchs.gov.ru','minzdrav','rospotrebnadzor','roszdravnadzor')
def has_ru(e):
    urls=[u for _,u in e.get('src',[])]+[u for _,u in (e.get('lr') or {}).get('src',[])]
    return any(any(d in u for d in RU_DOM) for u in urls)
ents=[]
for f in sorted(glob.glob(os.path.join(ROOT,'src','in','*.json'))):
    ents+=json.load(open(f,encoding='utf-8'))
def kk(e):
    a,b=e['k'].split('.'); return (int(a),int(b))
ents.sort(key=kk)
med=[e for e in ents if e['k'].split('.')[0] in MED_CH or e['cat'] in MED_CAT or e['k'] in MED_KEYS]
law=[e for e in ents if e['k'] not in {m['k'] for m in med} and (has_ru(e) or e['k'].split('.')[0] in LAW_CH)]
def row(e):
    chk=(e.get('lr') or {}).get('checked','')
    t=e['t'].replace('|','/')
    return f"| {e['k']} | `{e['id']}` | {t} | {'да' if has_ru(e) else 'нет'} | {chk} |"
out=["# Список для проверки перед публикацией","",
"Автоматически собран `tools/review_list.py` из `src/in/*.json`. Ссылка на запись на сайте: `index.html#<id>`.","",
"В список не входят 26 «старых» записей из `src/data.js` (у них нет поля `ch`): их тоже нужно просмотреть.","","Колонка «Рос. источник» значит, что в записи указан документ с consultant.ru, garant.ru, cbr.ru или сайта ведомства. «Проверено» это дата, которую поставили в поле «В России».","",
f"## 1. Врачу ({len(med)} записей)","",
"Что смотреть: нет ли ошибок в показаниях и противопоказаниях, не слишком ли безопасно звучит совет, нет ли нужды добавить «обратитесь к врачу». В записях намеренно нет доз.","",
"| Ключ | id | Заголовок | Рос. источник | Проверено |","|---|---|---|---|---|"]
out+=[row(e) for e in med]
out+=["",f"## 2. Юристу или владельцу сайта ({len(law)} записей)","",
"Что смотреть: актуальность статей и сумм на дату публикации, формулировки «наказывается» и «вправе», оговорки в поле «Что важно учесть».","",
"| Ключ | id | Заголовок | Рос. источник | Проверено |","|---|---|---|---|---|"]
out+=[row(e) for e in law]
rest=[e for e in ents if e['k'] not in {m['k'] for m in med} and e['k'] not in {l['k'] for l in law}]
out+=["",f"## 3. Остальные записи ({len(rest)})","","Общие советы без норм и без медицины, достаточно беглого чтения: "+", ".join(e['k'] for e in rest)+"."]
open(os.path.join(ROOT,'docs','review-checklist.md'),'w',encoding='utf-8').write("\n".join(out)+"\n")
print(len(med),len(law),len(rest))
