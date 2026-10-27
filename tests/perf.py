"""Замер производительности: загрузка, плавность в простое и при прокрутке (CPU замедлен). 
python tests/perf.py [--mobile] [--throttle N] [--url URL]
Ориентиры при замедлении 4x: загрузка до 1.5 с, элементов до 3000, простой не ниже 50 кадров/с, прокрутка не ниже 35."""
import sys,json,pathlib,time
from playwright.sync_api import sync_playwright
args=sys.argv[1:]
mobile='--mobile' in args
thr=float(args[args.index('--throttle')+1]) if '--throttle' in args else 4
url=args[args.index('--url')+1] if '--url' in args else pathlib.Path('dist/index.html').resolve().as_uri()
FPS="""(ms)=>new Promise(res=>{const ts=[];const t0=performance.now();function f(t){ts.push(t);if(t-t0<ms){requestAnimationFrame(f)}else{const d=[];for(let i=1;i<ts.length;i++)d.push(ts[i]-ts[i-1]);d.sort((a,b)=>a-b);const s=d.reduce((a,b)=>a+b,0);res({fps:Math.round(1000*d.length/s),p95_ms:Math.round(d[Math.floor(d.length*.95)]||0),max_ms:Math.round(d[d.length-1]||0)})}}requestAnimationFrame(f)})"""
START="""(ms)=>{window.__p=new Promise(res=>{const ts=[];const t0=performance.now();function f(t){ts.push(t);if(t-t0<ms){requestAnimationFrame(f)}else{const d=[];for(let i=1;i<ts.length;i++)d.push(ts[i]-ts[i-1]);d.sort((a,b)=>a-b);const s=d.reduce((a,b)=>a+b,0);res({fps:Math.round(1000*d.length/s),p95_ms:Math.round(d[Math.floor(d.length*.95)]||0),max_ms:Math.round(d[d.length-1]||0)})}}requestAnimationFrame(f)})}"""
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':800},device_scale_factor=2 if mobile else 1,is_mobile=mobile,has_touch=mobile)
    pg=ctx.new_page()
    ctx.new_cdp_session(pg).send('Emulation.setCPUThrottlingRate',{'rate':thr})
    pg.add_init_script("window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(Math.round(e.duration))}).observe({type:'longtask',buffered:true})}catch(e){}")
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(url,wait_until='load'); pg.wait_for_timeout(3500)
    m=pg.evaluate("""()=>{const n=performance.getEntriesByType('navigation')[0],pt=performance.getEntriesByType('paint');return {load_ms:Math.round(n.loadEventEnd),fcp_ms:Math.round((pt.find(x=>x.name==='first-contentful-paint')||{}).startTime||0),transfer_kb:Math.round(n.transferSize/1024),nodes:document.getElementsByTagName('*').length,longtasks:window.__lt.length,longtask_total_ms:window.__lt.reduce((a,b)=>a+b,0),longtask_max_ms:Math.max(0,...window.__lt)}}""")
    print('ЗАГРУЗКА',json.dumps(m,ensure_ascii=False))
    print('ПРОСТОЙ  ',pg.evaluate(FPS,2000))
    pg.mouse.move(300,400); pg.evaluate(START,3500)
    for _ in range(35): pg.mouse.wheel(0,300); pg.wait_for_timeout(90)
    print('ПРОКРУТКА',pg.evaluate("window.__p"))
    print('ОШИБКИ   ',errs or 'нет')
    b.close()
