from pathlib import Path
import re, subprocess, tempfile

p=Path('tdlearn.html')
s=p.read_text()

old='<div class="xpbar"><span id="xpfill"></span></div><div id="targeting" class="targeting">'
new='<div class="xpbar"><span id="xpfill"></span></div><div id="xpShop" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:7px 0"><button class="buyXp" data-xp="10" data-cost="100">+10 XP<br><span class="small">100 coins</span></button><button class="buyXp" data-xp="25" data-cost="220">+25 XP<br><span class="small">220 coins</span></button></div><div id="targeting" class="targeting">'
if old not in s:
    raise SystemExit('xpbar anchor not found')
s=s.replace(old,new,1)

old="$('ugrid').querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>buy(b.dataset.u))}"
new="$('ugrid').querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>buy(b.dataset.u));document.querySelectorAll('.buyXp').forEach(b=>b.onclick=()=>buyXp(+b.dataset.xp,+b.dataset.cost))}"
if old not in s:
    raise SystemExit('upgrades hook not found')
s=s.replace(old,new,1)

marker='function applyBuy(index,id,remote=false)'
if marker not in s:
    raise SystemExit('applyBuy marker not found')
helper="""function applyBuyXp(index,amount,cost,remote=false){let t=towers[index];if(!t)return;if(coins<cost){if(!remote)toast('Need '+cost+' coins');return}coins-=cost;t.xp+=amount;if(!remote){sfx('ok');toast('+'+amount+' XP for '+t.name)}hud();if(selTower===index)upgrades();mpBroadcast()}
function buyXp(amount,cost){if(selTower<0)return toast('Select a defender first');if(mpMode&&!mpHost){mpSend({type:'cmd',action:'buyxp',index:selTower,amount,cost});return}applyBuyXp(selTower,amount,cost)}
"""
s=s.replace(marker,helper+marker,1)

old="else if(m.action==='buy')applyBuy(+m.index,m.id,true);else if(m.action==='target')"
new="else if(m.action==='buy')applyBuy(+m.index,m.id,true);else if(m.action==='buyxp')applyBuyXp(+m.index,+m.amount,+m.cost,true);else if(m.action==='target')"
if old not in s:
    raise SystemExit('mp buy command anchor not found')
s=s.replace(old,new,1)

p.write_text(s)

scripts=re.findall(r'<script(?:[^>]*)>(.*?)</script>',s,re.S)
js='\n'.join(x for x in scripts if x.strip())
f=tempfile.NamedTemporaryFile('w',suffix='.js',delete=False)
f.write(js); f.close()
subprocess.run(['node','--check',f.name],check=True)
print('XP purchase patch applied')
