(function(){
"use strict";
var H=window.HLB,E=H.E,CATS=H.CATS,EVNOTE=H.EVNOTE,COUNTRY=H.COUNTRY;
var C=window.Core={cfg:{defaultTheme:null,budgetSentence:false},hooks:{}};
var S=C.S={b:[2,2,2],cat:"all",gets:"all",q:"",onlyA:false,onlySaved:false,country:"all",done:{},saved:{},current:null,pushed:false,shown:[]};
var byId={};E.forEach(function(e){byId[e.id]=e;e.hay=(e.title+" "+e.doit+" "+e.ours+" "+e.nums.join(" ")+" "+(e.steps||[]).join(" ")).replace(/<[^>]+>/g,"").toLowerCase();});
var TIPS=E.filter(function(e){return e.kind!=="urgent";}),URG=E.filter(function(e){return e.kind==="urgent";});
C.byId=byId;C.E=E;C.TIPS=TIPS;C.URG=URG;

/* ---------- хранилище ---------- */
var LS=(function(){try{var k="__t";window.localStorage.setItem(k,"1");window.localStorage.removeItem(k);return window.localStorage;}catch(e){return null;}})();
function lsGet(k,d){try{if(!LS)return d;var v=LS.getItem("hlb:"+k);return v===null?d:JSON.parse(v);}catch(e){return d;}}
function lsSet(k,v){try{if(LS)LS.setItem("hlb:"+k,JSON.stringify(v));}catch(e){}}
function $(id){return document.getElementById(id);}
function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

/* ---------- иконки ---------- */
var P={
 money:"<circle cx='12' cy='12' r='9'/><path d='M12 7v10M9.5 9.5h4a1.7 1.7 0 010 3.4h-4'/>",
 time:"<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>",
 will:"<path d='M13 3L5 14h6l-1 7 8-11h-6z'/>",
 check:"<path d='M5 12.5l4.5 4.5L19 7.5'/>",
 save:"<path d='M7 4h10v16l-5-4-5 4z'/>",
 share:"<path d='M12 15V4M8 8l4-4 4 4M5 13v6h14v-6'/>",
 close:"<path d='M6 6l12 12M18 6L6 18'/>",
 search:"<circle cx='11' cy='11' r='6.5'/><path d='M16 16l4 4'/>",
 sun:"<circle cx='12' cy='12' r='4'/><path d='M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4'/>",
 moon:"<path d='M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z'/>",
 back:"<path d='M15 5l-7 7 7 7'/>",
 next:"<path d='M9 5l7 7-7 7'/>",
 down:"<path d='M6 9l6 6 6-6'/>",
 plus:"<path d='M12 5v14M5 12h14'/>",
 filter:"<path d='M4 6h16M7 12h10M10 18h4'/>",
 list:"<path d='M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01'/>",
 up:"<path d='M6 15l6-6 6 6'/>",
 shield:"<path d='M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z'/>",
 heart:"<path d='M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z'/>",
 leaf:"<path d='M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7'/>",
 grid:"<rect x='4' y='4' width='6.5' height='6.5' rx='1.5'/><rect x='13.5' y='4' width='6.5' height='6.5' rx='1.5'/><rect x='4' y='13.5' width='6.5' height='6.5' rx='1.5'/><rect x='13.5' y='13.5' width='6.5' height='6.5' rx='1.5'/>",
 star:"<path d='M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'/>",
 alert:"<path d='M12 4l9 16H3z'/><path d='M12 10v4M12 17.2h.01'/>",
 users:"<circle cx='9' cy='8' r='3'/><path d='M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6'/><circle cx='17.5' cy='10.5' r='2.2'/><path d='M15.5 20c0-2.2 1.2-4 3-4.4'/>",
 cloud:"<path d='M7 18a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 18z'/>",
 slash:"<circle cx='12' cy='12' r='9'/><path d='M5.6 5.6l12.8 12.8'/>",
 link:"<path d='M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1'/><path d='M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1'/>",
 briefcase:"<rect x='3' y='7' width='18' height='13' rx='2'/><path d='M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18'/>"
};
C.icon=function(n,cls){return "<svg class='i"+(cls?" "+cls:"")+"' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>"+P[n]+"</svg>";};

/* ---------- элементы интерфейса ---------- */
var NUM={A:3,B:2,C:1};
function bars(n){
  var hs=[6,10,14],h="<svg class='bars' viewBox='0 0 22 18' aria-hidden='true'>";
  for(var i=0;i<3;i++){h+="<rect x='"+(i*8)+"' y='"+(16-hs[i])+"' width='5' height='"+hs[i]+"' rx='1' fill='currentColor' opacity='"+(i<n?1:0.22)+"'/>";}
  return h+"</svg>";
}
C.bars=bars;
C.ev=function(e){return "<span class='ev ev-"+e.ev+"' title='"+EVNOTE[e.ev]+"'>"+bars(NUM[e.ev])+"<span class='evt'>Надёжность "+e.ev+"</span></span>";};
C.tags=function(e){return C.ev(e)+(e.dispute?"<span class='tag tag-dispute'>Есть спор</span>":"")+"<span class='tag tag-cat'>"+CATS[e.cat]+"</span>";};
function dots(n){return "<span class='dots' aria-hidden='true'><i class='"+(n>=1?"on":"")+"'></i><i class='"+(n>=2?"on":"")+"'></i></span>";}
C.dots=dots;
var PK=[["money","Деньги"],["time","Время"],["will","Воля"]];
C.pay=function(e){
  var h="<ul class='pay'>";
  PK.forEach(function(p,i){
    h+="<li class='pi pi-"+p[0]+"' data-l='"+e.cost[i]+"'><span class='pk'>"+C.icon(p[0],"pki")+"<span class='pn'>"+p[1]+"</span></span><span class='pv'>"+dots(e.cost[i])+"<span class='pt'>"+e.pay[p[0]]+"</span></span></li>";
  });
  return h+"</ul>";
};
var LBL={done:["Сделал","Сделано"],save:["Сохранить","Сохранено"],share:["Поделиться","Поделиться"]};
C.btn=function(act,id){
  var on=act==="done"?S.done[id]:act==="save"?S.saved[id]:false;
  var isTog=act!=="share";
  return "<button type='button' class='act act-"+act+"' data-act='"+act+"' data-id='"+id+"'"+(isTog?" aria-pressed='"+(!!on)+"'":"")+" aria-label='"+LBL[act][0]+"'>"+C.icon(act==="done"?"check":act)+"<span class='lbl'>"+LBL[act][on?1:0]+"</span></button>";
};
C.actions=function(id){return "<div class='acts'>"+C.btn("done",id)+C.btn("save",id)+C.btn("share",id)+"</div>";};
C.details=function(e){
  var nums="",src="",h="<div class='dt'>";
  e.nums.forEach(function(t){nums+="<li>"+t+"</li>";});
  e.src.forEach(function(s){src+=s[1]?"<li><a href='"+s[1]+"' target='_blank' rel='noopener'>"+s[0]+"</a></li>":"<li>"+s[0]+"</li>";});
  if(!src){src="<li>Первоисточника нет: это общепринятая практика.</li>";}
  h+="<section class='dt-nums'><h5>Что показали исследования</h5><ul>"+nums+"</ul></section>";
  if(e.ours){h+="<section class='dt-ours'><h5>От нас <small>наше пояснение, не из исследований</small></h5><p>"+e.ours+"</p></section>";}
  if(e.care){h+="<section class='dt-care'><h5>Что важно учесть</h5><p>"+e.care+"</p></section>";}
  if(e.localRu||e.localKey){h+="<section class='dt-local' data-local='"+e.id+"'>"+localHtml(e)+"</section>";}
  h+="<section class='dt-src'><h5>Источники</h5><ul>"+src+"</ul></section></div>";
  return h;
};
function localHtml(e){
  var X=null;
  if(e.localRu){X=e.localRu;}
  else if(e.localKey&&H.LOCAL&&H.LOCAL[e.localKey]){X=H.LOCAL[e.localKey].ru;}
  if(!X){return "";}
  var src="";
  X.src.forEach(function(s,i){src+="<a href='"+s[1]+"' target='_blank' rel='noopener'>"+s[0]+"</a>"+(i<X.src.length-1?", ":"");});
  return "<h5>В России</h5><p>"+X.text+"</p><p class='muted'>Проверено: "+X.checked+". Источники: "+src+".</p>";
}
function updateLocal(){qsa("[data-local]").forEach(function(el){var e=byId[el.getAttribute("data-local")];if(e){el.innerHTML=localHtml(e);}});}
C.updateLocal=updateLocal;
C.legendHTML=function(){var h="<ul class='legend'>";H.LEGEND.forEach(function(l){h+="<li>"+bars(NUM[l[0]])+"<div><b>"+l[0]+"</b> <span>"+l[1]+"</span></div></li>";});return h+"</ul>";};
C.glossHTML=function(){var h="<dl class='gloss'>";H.GLOSS.forEach(function(g){h+="<div><dt>"+g[0]+"</dt><dd>"+g[1]+"</dd></div>";});return h+"</dl>";};
C.scenHTML=function(){var h="<ul class='scen'>";H.SCEN.forEach(function(s){h+="<li><span>"+s+"</span><small>Готовится</small></li>";});return h+"</ul>";};

/* ---------- сборка фильтров ---------- */
var SEG={money:["Ничего","Немного","Любые"],time:["Минуты","Часы","Много"],will:["Без усилий","Немного","Любая"]};
var NAMES={money:"Деньги",time:"Время",will:"Сила воли"};
var KEYS=["money","time","will"];
function sel(i){
  var k=KEYS[i],h="<select class='bsel' data-k='"+i+"' aria-label='"+NAMES[k]+"'>";
  SEG[k].forEach(function(l,j){h+="<option value='"+j+"'"+(j===S.b[i]?" selected":"")+">"+l+"</option>";});
  return h+"</select>";
}
function buildBudget(){
  var m=$("m-budget");if(!m)return;
  if(C.cfg.budgetSentence){
    m.innerHTML="<p class='bsent'>Мой бюджет: на деньги — "+sel(0)+", на время — "+sel(1)+", на силу воли — "+sel(2)+".</p>";
    return;
  }
  var h="";
  KEYS.forEach(function(k,i){
    h+="<div class='bg' role='group' aria-labelledby='bl-"+k+"' data-k='"+k+"'><span class='bl' id='bl-"+k+"'><span class='ic'>"+C.icon(k)+"</span><span>"+NAMES[k]+"</span></span><div class='seg'>";
    SEG[k].forEach(function(l,j){
      h+="<span><input type='radio' name='b-"+k+"' id='b-"+k+"-"+j+"' value='"+j+"'"+(j===S.b[i]?" checked":"")+"><label for='b-"+k+"-"+j+"'>"+l+"</label></span>";
    });
    h+="</div></div>";
  });
  m.innerHTML=h;
}
function buildCats(){
  var m=$("m-cats");if(!m)return;
  var h="";
  ["all"].concat(H.CAT_ORDER).forEach(function(c){
    var n=c==="all"?TIPS.length:E.filter(function(e){return e.cat===c;}).length;
    h+="<span><input type='radio' name='cat' id='c-"+c+"' value='"+c+"'"+(c===S.cat?" checked":"")+"><label for='c-"+c+"'>"+(c==="all"?"Все":CATS[c])+"<em class='n'>"+n+"</em></label></span>";
  });
  m.innerHTML=h;
}
function buildGets(){
  var m=$("m-gets");if(!m)return;
  var h="<span><input type='radio' name='gets' id='g-all' value='all'"+(S.gets==="all"?" checked":"")+"><label for='g-all'>Любое</label></span>";
  H.GETS_ORDER.forEach(function(k){
    var n=TIPS.filter(function(e){return e.gets===k;}).length;
    if(!n){return;}
    h+="<span><input type='radio' name='gets' id='g-"+k+"' value='"+k+"'"+(S.gets===k?" checked":"")+"><label for='g-"+k+"'>"+H.GETS[k]+"<em class='n'>"+n+"</em></label></span>";
  });
  m.innerHTML=h;
}
function syncControls(){
  KEYS.forEach(function(k,i){var r=$("b-"+k+"-"+S.b[i]);if(r){r.checked=true;}});
  qsa(".bsel").forEach(function(s){s.value=String(S.b[+s.getAttribute("data-k")]);});
  var c=$("c-"+S.cat);if(c){c.checked=true;}
  var g=$("g-"+S.gets);if(g){g.checked=true;}
  var q=$("q");if(q){q.value=S.q;}
  var a=$("onlyA");if(a){a.checked=S.onlyA;}
  var v=$("onlySaved");if(v){v.checked=S.onlySaved;}
  var co=$("country");if(co){co.value=S.country;}
}

/* ---------- фильтрация ---------- */
function match(e){
  var urg=e.kind==="urgent";
  if(urg){if(!(S.cat==="urgent"||(S.cat==="all"&&S.q))){return false;}}
  else if(S.cat==="urgent"){return false;}
  if(!urg){
    var b=S.b;
    if(e.cost[0]>b[0]||e.cost[1]>b[1]||e.cost[2]>b[2]){return false;}
    if(S.gets!=="all"&&e.gets!==S.gets){return false;}
    if(S.cat!=="all"&&e.cat!==S.cat){return false;}
  }
  if(S.onlyA&&e.ev!=="A"){return false;}
  if(S.onlySaved&&!S.saved[e.id]){return false;}
  if(S.q&&e.hay.indexOf(S.q)===-1&&e.title.toLowerCase().indexOf(S.q)===-1){return false;}
  return true;
}
C.items=function(){
  var r=E.filter(match);
  if(S.q&&S.cat==="all"){r=r.filter(function(e){return e.kind==="urgent";}).concat(r.filter(function(e){return e.kind!=="urgent";}));}
  return r;
};
C.stats=function(){
  var done=0,saved=0;TIPS.forEach(function(e){if(S.done[e.id]){done++;}});E.forEach(function(e){if(S.saved[e.id]){saved++;}});
  return {shown:S.shown.length,total:TIPS.length,urgent:URG.length,done:done,saved:saved,
    strong:TIPS.filter(function(e){return e.ev==="A";}).length,
    free:TIPS.filter(function(e){return e.cost[0]===0;}).length};
};
function syncBtns(){
  qsa("[data-act='done']").forEach(function(b){var on=!!S.done[b.getAttribute("data-id")];b.setAttribute("aria-pressed",on);var l=b.querySelector(".lbl");if(l){l.textContent=LBL.done[on?1:0];}});
  qsa("[data-act='save']").forEach(function(b){var on=!!S.saved[b.getAttribute("data-id")];b.setAttribute("aria-pressed",on);var l=b.querySelector(".lbl");if(l){l.textContent=LBL.save[on?1:0];}});
  qsa("[data-card]").forEach(function(c){var id=c.getAttribute("data-card");c.classList.toggle("is-done",!!S.done[id]);c.classList.toggle("is-saved",!!S.saved[id]);});
}
C.sync=syncBtns;
C.recount=function(){counters();};
C.hold={done:0,saved:0};
function counters(){
  var st=C.stats(),inUrg=S.cat==="urgent",tot=inUrg?st.urgent:st.total+((S.cat==="all"&&S.q)?st.urgent:0);
  var dn=Math.max(0,st.done-C.hold.done),sv=Math.max(0,st.saved-C.hold.saved);
  qsa(".js-count").forEach(function(el){el.innerHTML=inUrg?("Инструкций: <b>"+st.shown+"</b>"):("Подходит <b>"+st.shown+"</b> из "+tot+" советов");});
  qsa(".js-progress").forEach(function(el){el.innerHTML="Сделано <b>"+dn+"</b> из "+st.total;});
  qsa(".js-done-n").forEach(function(el){el.textContent=dn;});
  qsa(".js-saved-n").forEach(function(el){el.textContent=sv;});
  qsa(".js-total").forEach(function(el){el.textContent=st.total;});
  qsa(".js-strong").forEach(function(el){el.textContent=st.strong;});
  qsa(".js-free").forEach(function(el){el.textContent=st.free;});
  qsa(".js-bar").forEach(function(el){el.style.setProperty("--p",(st.total?dn/st.total:0));});
  if(C.hooks.onStats){C.hooks.onStats(st);}
}
C.refresh=function(){
  S.shown=C.items();
  if(C.hooks.render){C.hooks.render(S.shown,S);}
  var em=$("empty");
  if(em){
    em.hidden=S.shown.length>0;
    var m=$("empty-msg");
    if(m){m.textContent=(S.onlySaved&&!Object.keys(S.saved).length)?"Пока ничего не сохранено. Нажмите на закладку у любого совета.":"Под эти условия ничего не нашлось. Увеличьте бюджет или уберите поиск.";}
  }
  syncBtns();updateLocal();counters();
};

/* ---------- уведомление ---------- */
var tt;
C.toast=function(msg){
  var t=$("toast");
  if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");t.setAttribute("aria-live","polite");document.body.appendChild(t);}
  t.textContent=msg;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show");},2200);
};

/* ---------- поделиться ---------- */
function copy(text){
  function fb(){
    try{var ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.cssText="position:fixed;top:0;left:0;opacity:0";document.body.appendChild(ta);ta.select();var ok=document.execCommand("copy");document.body.removeChild(ta);C.toast(ok?"Ссылка скопирована":"Не удалось скопировать: "+text);}catch(e){C.toast("Не удалось скопировать ссылку");}
  }
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){C.toast("Ссылка скопирована");},fb);return;}}catch(e){}
  fb();
}
C.share=function(id){
  var e=byId[id],url=location.href.split("#")[0]+"#"+id;
  if(navigator.share){
    try{navigator.share({title:e.title,text:e.title,url:url}).catch(function(err){if(err&&err.name==="AbortError"){return;}copy(url);});return;}catch(x){}
  }
  copy(url);
};

/* ---------- тема ---------- */
function curTheme(){
  var a=document.documentElement.getAttribute("data-theme");
  if(a==="dark"||a==="light"){return a;}
  return (window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";
}
function themeBtns(){
  var t=curTheme();
  qsa(".js-theme").forEach(function(b){
    b.innerHTML=C.icon(t==="dark"?"sun":"moon")+"<span class='lbl'>"+(t==="dark"?"Светлая тема":"Тёмная тема")+"</span>";
    b.setAttribute("aria-label",t==="dark"?"Включить светлую тему":"Включить тёмную тему");
  });
}
function applyTheme(t){document.documentElement.setAttribute("data-theme",t);themeBtns();if(C.hooks.onTheme){C.hooks.onTheme(t);}}

/* ---------- переходы по ссылке ---------- */
function parseHash(){var h=(location.hash||"").replace(/^#\/?/,"");return byId[h]?h:null;}
function openId(id){if(S.current===id){return;}S.current=id;if(C.hooks.open){C.hooks.open(id);}}
function closeId(){if(!S.current){return;}S.current=null;if(C.hooks.close){C.hooks.close();}}
C.nav=function(id){
  if(id){
    try{if(parseHash()!==id){location.hash=id;S.pushed=true;}}catch(e){}
    openId(id);
  }else{
    try{
      if(S.pushed&&parseHash()===S.current){S.pushed=false;history.back();}
      else{S.pushed=false;history.replaceState(null,"",location.pathname+location.search);}
    }catch(e){}
    closeId();
  }
};
C.sel=function(id){
  try{history.replaceState(null,"","#"+id);}catch(e){}
  openId(id);
};
window.addEventListener("hashchange",function(){var id=parseHash();if(id){openId(id);}else{closeId();}});

/* ---------- события ---------- */
function setBudget(a,b,c){S.b=[a,b,c];syncControls();C.refresh();}
document.addEventListener("change",function(ev){
  var t=ev.target;if(!t){return;}
  if(t.name&&t.name.indexOf("b-")===0){S.b[KEYS.indexOf(t.name.slice(2))]=+t.value;C.refresh();return;}
  if(t.classList&&t.classList.contains("bsel")){S.b[+t.getAttribute("data-k")]=+t.value;C.refresh();return;}
  if(t.name==="cat"){S.cat=t.value;C.refresh();return;}
  if(t.name==="gets"){S.gets=t.value;C.refresh();return;}
  if(t.id==="onlyA"){S.onlyA=t.checked;C.refresh();return;}
  if(t.id==="onlySaved"){S.onlySaved=t.checked;C.refresh();return;}
  if(t.id==="country"){S.country=t.value;lsSet("country",S.country);updateLocal();if(C.hooks.onCountry){C.hooks.onCountry(S.country);}return;}
});
document.addEventListener("input",function(ev){
  if(ev.target&&ev.target.id==="q"){S.q=ev.target.value.trim().toLowerCase();C.refresh();}
});
document.addEventListener("click",function(ev){
  var t=ev.target&&ev.target.closest?ev.target.closest("[data-act],[data-preset],.js-theme"):null;
  if(!t){return;}
  if(t.classList.contains("js-theme")){
    var n=curTheme()==="dark"?"light":"dark";
    var go=function(){applyTheme(n);lsSet("theme",n);};
    var rm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var br=t.getBoundingClientRect(),ox=ev.clientX,oy=ev.clientY;
    if(!ox&&!oy){ox=br.left+br.width/2;oy=br.top+br.height/2;}
    if(document.startViewTransition&&!rm){
      try{
        var vt=document.startViewTransition(go);
        vt.ready.then(function(){
          var r=Math.hypot(Math.max(ox,window.innerWidth-ox),Math.max(oy,window.innerHeight-oy));
          document.documentElement.animate({clipPath:["circle(0px at "+ox+"px "+oy+"px)","circle("+r+"px at "+ox+"px "+oy+"px)"]},{duration:750,easing:"cubic-bezier(.22,.8,.2,1)",pseudoElement:"::view-transition-new(root)"});
        }).catch(function(){});
      }catch(x){go();}
    }else{go();}
    return;
  }
  var p=t.getAttribute("data-preset");
  if(p){if(p==="easy"){setBudget(0,0,0);}else{setBudget(2,2,2);}return;}
  var act=t.getAttribute("data-act"),id=t.getAttribute("data-id");
  if(act==="done"){
    if(S.done[id]){delete S.done[id];}else{S.done[id]=1;if(!C.quiet){C.toast("Отмечено: сделано");}}
    lsSet("done",S.done);t.classList.add("just");setTimeout(function(){t.classList.remove("just");},800);syncBtns();counters();return;
  }
  if(act==="save"){
    if(S.saved[id]){delete S.saved[id];}else{S.saved[id]=1;if(!C.quiet){C.toast("Сохранено");}}
    lsSet("saved",S.saved);t.classList.add("just");setTimeout(function(){t.classList.remove("just");},800);
    if(S.onlySaved){C.refresh();}else{syncBtns();counters();}
    return;
  }
  if(act==="share"){C.share(id);return;}
  if(act==="open"){ev.preventDefault();if(C.hooks.openClick){C.hooks.openClick(id);}else{C.nav(id);}return;}
  if(act==="close"){C.nav(null);return;}
  if(act==="reset"){S.b=[2,2,2];S.cat="all";S.gets="all";S.q="";S.onlyA=false;S.onlySaved=false;syncControls();C.refresh();return;}
});

/* ---------- запуск ---------- */
C.start=function(hooks){
  C.hooks=hooks||{};
  var st=lsGet("theme",null),at=document.documentElement.getAttribute("data-theme");
  var th=st||at||C.cfg.defaultTheme;
  if(th){applyTheme(th);}else{themeBtns();}
  S.done=lsGet("done",{})||{};S.saved=lsGet("saved",{})||{};
  var c=lsGet("country","all");if(c==="all"||COUNTRY[c]){S.country=c;}
  buildBudget();buildCats();buildGets();syncControls();
  C.refresh();
  var id=parseHash();if(id){openId(id);}
};
})();
