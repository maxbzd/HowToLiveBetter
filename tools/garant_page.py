import sys,re,html,subprocess
url=sys.argv[1]; kws=sys.argv[2:]
b=subprocess.run(['curl','-s','-m','60','-L','-A','Mozilla/5.0',url],capture_output=True).stdout
for enc in ('utf-8','cp1251'):
    try: t=b.decode(enc); break
    except: t=b.decode('cp1251','ignore')
t=re.sub(r'<script.*?</script>|<style.*?</style>','',t,flags=re.S)
t=html.unescape(re.sub(r'<[^>]+>',' ',t)); t=re.sub(r'\s+',' ',t)
print('LEN',len(t)); print(t[:300])
for k in kws:
    for m in list(re.finditer(k,t,flags=re.I))[:3]:
        print('['+k+']',t[max(0,m.start()-250):m.start()+450]);print('--')
