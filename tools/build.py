"""Собирает один самодостаточный HTML: dist/index.html (его можно выкладывать на GitHub Pages)."""
import re,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'src'); OUT=os.path.join(ROOT,'dist')
TITLE='Как жить лучше: советы по порядку выгоды'
DESC='Советы для жизни в порядке выгодности: сколько стоит, что даёт и насколько доказано. Источники: исследования и официальные документы.'
def read(p): return open(p,encoding='utf-8').read()
data=read(f'{SRC}/data.js'); core=read(f'{SRC}/core.js')
gen=read(f'{SRC}/gen.js') if os.path.exists(f'{SRC}/gen.js') else ''
data=data.replace('/*@@GEN@@*/',gen)
raw=read(f'{SRC}/a.txt')
parts=re.split(r'^=====(HEAD|CSS|HTML|JS)=====\n',raw,flags=re.M)
d={parts[i]:parts[i+1] for i in range(1,len(parts),2)}
html=f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{d['HEAD']}<style>
{d['CSS']}</style>
</head>
<body>
{d['HTML']}<script>
{data}
{core}
{d['JS']}</script>
</body>
</html>
'''
os.makedirs(OUT,exist_ok=True)
open(f'{OUT}/index.html','w',encoding='utf-8').write(html)
print('built dist/index.html',len(html)//1024,'KB')
