import re,sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from show import SRC
def rd(keys,lim=(100,260,650,300)):
    for k in keys:
        e=SRC[k]; L=e.strip().split('\n'); tg=re.search(r'成本标签:(.*?)-->',e,re.S).group(1).strip().replace('\n',' ')
        tg=tg.replace('钱=','$').replace('时间=','t').replace('毅力=','w').replace('收益=','g').replace('口径=','k')
        print(f"[{k}] {L[0].strip()} | {tg}")
        for l in L[2:]:
            l=l.strip()
            if l.startswith('- 成本'): print("  C:",l[4:4+lim[0]])
            elif l.startswith('- 说人话'): print("  S:",l[5:5+lim[1]])
            elif l.startswith('- 收益'): print("  G:",l[4:4+lim[2]])
            elif l.startswith('- 证据'): print("  E:",l[6:])
            elif l.startswith('- 备注'): print("  N:",l[4:4+lim[3]])
        print()
if __name__=='__main__': rd(sys.argv[1].split(','))
