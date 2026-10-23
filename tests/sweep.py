"""Проверка сборки: нет ошибок JS, нет горизонтальной прокрутки, большие числа не вылезают.
Нужно: pip install playwright && playwright install chromium
Запуск: python3 tests/sweep.py [--quick]"""
import os,sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL="file://"+os.path.join(ROOT,'dist','index.html')
quick='--quick' in sys.argv
SIZES=[(1920,1080),(1440,900),(1024,768),(820,1100),(390,844),(320,640)] if not quick else [(1440,900),(390,844)]
HASHES=["","#sky"]
with sync_playwright() as p:
    b=p.chromium.launch(); bad=[]; errs=[]
    pg0=b.new_page(); pg0.goto(URL); pg0.wait_for_timeout(1200)
    ids=pg0.evaluate("window.Core?Object.keys(Core.byId).slice(0,3):[]"); pg0.close()
    HASHES+=["#"+i for i in ids]
    for scheme in (["dark","light"] if not quick else ["dark"]):
        for rm in (["no-preference","reduce"] if not quick else ["no-preference"]):
            for w,h in SIZES:
                for hv in HASHES:
                    ctx=b.new_context(viewport={"width":w,"height":h},color_scheme=scheme,reduced_motion=rm); pg=ctx.new_page()
                    pg.on("pageerror",lambda e,a=(scheme,rm,w,hv):errs.append((a,str(e))))
                    pg.goto(URL+hv); pg.wait_for_timeout(800)
                    if pg.evaluate("document.documentElement.scrollWidth")>w+1: bad.append((scheme,rm,w,hv))
                    ctx.close()
    ctx=b.new_context(viewport={"width":1440,"height":900}); pg=ctx.new_page(); pg.goto(URL)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(1400)
    cats=pg.evaluate("[...document.querySelectorAll('#m-cats input')].map(i=>i.id)")
    ov=[]
    for c in cats:
        pg.check("#"+c); pg.wait_for_timeout(200)
        ov+=pg.evaluate("[...document.querySelectorAll('.t-num')].filter(e=>e.scrollWidth>e.parentElement.clientWidth+2).map(e=>e.textContent)")
    print("разделов:",len(cats)-1,"| вылезающие числа:",ov)
    print("горизонтальная прокрутка:",bad or "нет"); print("ошибки JS:",errs or "нет")
    b.close(); sys.exit(1 if (bad or errs or ov) else 0)
