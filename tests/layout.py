"""Проверка отступов и вылезания текста за рамки на разных ширинах экрана. python tests/layout.py"""
import pathlib,sys
from playwright.sync_api import sync_playwright
url=pathlib.Path('dist/index.html').resolve().as_uri()
WIDTHS=[320,360,390,430,520,600,720,820,1024,1280,1600]
JS="""()=>{
 const bad=[];
 const vw=document.documentElement.clientWidth;
 document.querySelectorAll('.seg').forEach(seg=>{
   const sr=seg.getBoundingClientRect(); if(!sr.width) return;
   seg.querySelectorAll('label').forEach(l=>{
     const r=l.getBoundingClientRect();
     const range=document.createRange(); range.selectNodeContents(l); const tr=range.getBoundingClientRect();
     if(tr.right>r.right+0.5||tr.left<r.left-0.5) bad.push('текст вылезает из ячейки: '+l.textContent.trim()+' ('+Math.round(tr.width)+'px в ячейке '+Math.round(r.width)+'px)');
     if(r.right>sr.right+0.5||r.bottom>sr.bottom+0.5) bad.push('ячейка вылезает из рамки: '+l.textContent.trim());
     const pad=Math.min(tr.left-r.left,r.right-tr.right);
     if(pad<6&&l.textContent.trim().length>0) bad.push('нет отступа (<3px) у: '+l.textContent.trim());
   });
 });
 if(document.documentElement.scrollWidth>vw+1) bad.push('горизонтальная прокрутка страницы: '+document.documentElement.scrollWidth+' > '+vw);
 return bad;}"""
tot=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in WIDTHS:
        ctx=b.new_context(viewport={'width':w,'height':900},is_mobile=w<500,has_touch=w<500)
        pg=ctx.new_page(); pg.goto(url); pg.wait_for_timeout(2200)
        bad=pg.evaluate(JS)
        tot+=len(bad)
        print(w,'OK' if not bad else '')
        for x in sorted(set(bad)): print('   -',x)
        ctx.close()
    b.close()
print('ПРОБЛЕМ:',tot)
sys.exit(1 if tot else 0)
