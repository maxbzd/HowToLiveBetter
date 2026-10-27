"""Функциональная проверка сайта: подгрузка списка, фильтры, поиск, запись, список/плитки, сохранённое, тема, ссылка. python tests/func.py"""
import pathlib,re,sys
from playwright.sync_api import sync_playwright
url=pathlib.Path('dist/index.html').resolve().as_uri()
fails=[]
def check(name,ok,info=''):
    print(('OK   ' if ok else 'FAIL ')+name+(' '+str(info) if info else ''))
    if not ok: fails.append(name)
def count_text(pg): return pg.inner_text('.js-count')
def shown(pg):
    m=re.search(r'Подходит\s+(\d+)\s+из\s+(\d+)',count_text(pg)) or re.search(r'Инструкций:\s*(\d+)',count_text(pg))
    return int(m.group(1))
def scroll_all(pg,target):
    for _ in range(80):
        n=pg.locator('#list [data-card]').count()
        if n>=target: return n
        pg.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)"); pg.wait_for_timeout(120)
    return pg.locator('#list [data-card]').count()
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1280,'height':800}); pg=ctx.new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(url); pg.wait_for_timeout(1800)
    n0=shown(pg); first=pg.locator('#list [data-card]').count()
    check('первая порция меньше всего списка',0<first<n0,f'{first} из {n0}')
    got=scroll_all(pg,n0); check('подгрузка доходит до конца',got==n0,f'{got} из {n0}')
    ids=pg.eval_on_selector_all('#list [data-card]','els=>els.map(e=>e.dataset.card)')
    check('нет дублей карточек',len(ids)==len(set(ids)))
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(300)
    # категория
    pg.evaluate("document.querySelector('label[for=c-health]').click()"); pg.wait_for_timeout(900)
    nh=shown(pg); got=scroll_all(pg,nh)
    check('фильтр «Здоровье»',0<nh<n0 and got==nh,f'{got} из {nh}')
    pg.evaluate("document.querySelector('label[for=c-all]').click()"); pg.wait_for_timeout(700)
    check('сброс категории возвращает весь список',shown(pg)==n0)
    # поиск
    pg.fill('#q','парацетамол'); pg.wait_for_timeout(900)
    ns=shown(pg); titles=pg.eval_on_selector_all('#list [data-card] h3','els=>els.map(e=>e.textContent.toLowerCase())')
    check('поиск находит записи',ns>=1 and len(titles)==min(ns,24),f'{ns} найдено')
    check('в результатах есть парацетамол',any('парацетамол' in x for x in titles))
    pg.fill('#q',''); pg.wait_for_timeout(700)
    check('очистка поиска',shown(pg)==n0)
    # открытие записи и листание
    pg.locator('#list .t-open').nth(2).click(); pg.wait_for_timeout(900)
    t1=pg.inner_text('#dr-h'); check('запись открывается',bool(t1),t1[:40])
    pg.click('#dr-next'); pg.wait_for_timeout(500)
    t2=pg.inner_text('#dr-h'); check('кнопка «дальше» меняет запись',t2!=t1)
    pg.click('#dr-prev'); pg.wait_for_timeout(500)
    check('кнопка «назад» возвращает',pg.inner_text('#dr-h')==t1)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
    check('Esc закрывает запись',not pg.evaluate("document.getElementById('page').open"))
    # вид «список»
    pg.click('#v-list'); pg.wait_for_timeout(900)
    rows=pg.locator('#list .lrow').count(); check('режим «список»',rows>0 and pg.locator('#list .tile').count()==0,f'{rows} строк')
    got=scroll_all(pg,n0); check('подгрузка в режиме списка',got==n0,f'{got} из {n0}')
    pg.evaluate("window.scrollTo(0,0)"); pg.click('#v-grid'); pg.wait_for_timeout(700)
    check('возврат к плиткам',pg.locator('#list .tile').count()>0)
    # сохранить + только сохранённые
    pg.locator('#list [data-act=save]').first.click(); pg.wait_for_timeout(500)
    pg.evaluate("document.getElementById('onlySaved').click()"); pg.wait_for_timeout(800)
    check('«Только сохранённые» показывает 1',shown(pg)==1,shown(pg))
    pg.evaluate("document.getElementById('onlySaved').click()"); pg.wait_for_timeout(600)
    # тема
    th0=pg.evaluate("document.documentElement.getAttribute('data-theme')||'auto'")
    pg.locator('.js-theme').first.click(); pg.wait_for_timeout(1500)
    th1=pg.evaluate("document.documentElement.getAttribute('data-theme')||'auto'")
    check('тема переключается',th0!=th1,f'{th0}->{th1}')
    # ссылка на запись
    pg.goto(url+'#paracetamoldup'); pg.wait_for_timeout(1500)
    check('ссылка #paracetamoldup открывает запись','парацетамол' in pg.inner_text('#dr-h').lower(),pg.inner_text('#dr-h')[:50] if pg.evaluate("document.getElementById('page').open") else 'не открылась')
    check('нет ошибок JS',not errs,errs[:3])
    b.close()
print('\nПРОВАЛОВ:',len(fails)); sys.exit(1 if fails else 0)
