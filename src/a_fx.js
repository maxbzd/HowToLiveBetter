/* =====================================================================
   ЭФФЕКТЫ: полёты «Сделал» и «Сохранить», созвездие, финал
   ===================================================================== */
var skyOn=false;

/* ---------- слой эффектов поверх всего, в том числе поверх панели деталей ---------- */
var FX=(function(){
  var host=$("fx"),cv=$("fxc"),ctx=cv.getContext("2d"),W=0,H=0,dpr=1,fl=[],pt=[],rg=[],raf=0,last=0;
  var pop=!!(host&&host.showPopover);
  function size(){
    dpr=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function open(){
    host.classList.add("on");
    if(pop){try{if(!host.matches(":popover-open")){host.showPopover();}}catch(e){}}
    size();
  }
  function close(){
    host.classList.remove("on");
    if(pop){try{if(host.matches(":popover-open")){host.hidePopover();}}catch(e){}}
  }
  function eio(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function bez(t,a,b,c,d){var u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;}
  function starPath(c,r){
    c.beginPath();c.moveTo(0,-r);c.quadraticCurveTo(0,0,r,0);c.quadraticCurveTo(0,0,0,r);c.quadraticCurveTo(0,0,-r,0);c.quadraticCurveTo(0,0,0,-r);c.closePath();
  }
  function markPath(c,r){
    var w=r*.62,h=r;c.beginPath();c.moveTo(-w,-h);c.lineTo(w,-h);c.lineTo(w,h);c.lineTo(0,h*.5);c.lineTo(-w,h);c.closePath();
  }
  function spark(x,y,n,speed,rgb,life){
    for(var i=0;i<n;i++){
      var a=Math.random()*6.283,s=speed*(.35+Math.random()*.9);
      pt.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:(life||.7)*(.6+Math.random()*.7),size:1+Math.random()*2.4,c:rgb});
    }
  }
  function ring(x,y,r0,r1,dur,rgb){rg.push({x:x,y:y,r0:r0,r1:r1,t0:performance.now(),dur:dur,c:rgb});}
  function fly(o){
    open();
    var p0=o.from,p3=o.to,dx=p3.x-p0.x,dy=p3.y-p0.y,dist=Math.hypot(dx,dy)||1,nx=-dy/dist,ny=dx/dist;
    if(ny>0){nx=-nx;ny=-ny;}
    var h=Math.min(240,dist*.34);
    fl.push({
      p0:p0,p3:p3,
      p1:{x:p0.x+dx*.2+nx*h*1.3,y:p0.y+dy*.2+ny*h*1.3},
      p2:{x:p3.x-dx*.3+nx*h*.5,y:p3.y-dy*.3+ny*h*.5},
      t0:performance.now(),dur:o.kind==="done"?1150:1000,kind:o.kind,onLand:o.onLand,x:p0.x,y:p0.y,s:.3,rot:0,landed:false,popDone:false
    });
    if(!raf){last=performance.now();raf=requestAnimationFrame(loop);}
  }
  function loop(ts){
    var dt=Math.min(.05,(ts-last)/1000);last=ts;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation="lighter";
    var TEAL="102,184,203",PALE="205,225,255";
    /* кольца */
    for(var i=rg.length-1;i>=0;i--){
      var g=rg[i],p=(ts-g.t0)/g.dur;
      if(p>=1){rg.splice(i,1);continue;}
      var e=1-Math.pow(1-p,3);
      ctx.strokeStyle="rgba("+g.c+","+(.85*(1-p))+")";ctx.lineWidth=2.2*(1-p)+.4;
      ctx.beginPath();ctx.arc(g.x,g.y,g.r0+(g.r1-g.r0)*e,0,6.283);ctx.stroke();
    }
    /* полёты */
    for(var k=fl.length-1;k>=0;k--){
      var f=fl[k],t=ts-f.t0,POP=190,rgb=f.kind==="done"?TEAL:PALE;
      if(t<POP){
        var q=eio(t/POP);f.x=f.p0.x;f.y=f.p0.y-14*q;f.s=.3+1.0*q;f.rot=q*.6;
        if(!f.popDone){f.popDone=true;ring(f.p0.x,f.p0.y,6,34,520,rgb);spark(f.p0.x,f.p0.y,10,90,rgb,.55);}
      }else{
        var u=Math.min(1,(t-POP)/(f.dur-POP)),e2=eio(u);
        f.x=bez(e2,f.p0.x,f.p1.x,f.p2.x,f.p3.x);f.y=bez(e2,f.p0.y-14,f.p1.y,f.p2.y,f.p3.y);
        f.s=1.3-.78*u;f.rot=.6+u*5.2;
        for(var n=0;n<3;n++){
          pt.push({x:f.x+(Math.random()-.5)*6,y:f.y+(Math.random()-.5)*6,vx:(Math.random()-.5)*46,vy:(Math.random()-.5)*46,age:0,life:.5+Math.random()*.45,size:1+Math.random()*2.6,c:Math.random()<.35?"255,255,255":rgb});
        }
        if(u>=1&&!f.landed){
          f.landed=true;
          spark(f.p3.x,f.p3.y,22,170,rgb,.8);ring(f.p3.x,f.p3.y,6,58,720,rgb);ring(f.p3.x,f.p3.y,4,34,520,"255,255,255");
          if(f.onLand){try{f.onLand();}catch(x){}}
          fl.splice(k,1);continue;
        }
      }
      /* сама звезда или закладка */
      var R=16*f.s;
      var gr=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,R*3.2);
      gr.addColorStop(0,"rgba("+rgb+",.55)");gr.addColorStop(1,"rgba("+rgb+",0)");
      ctx.fillStyle=gr;ctx.beginPath();ctx.arc(f.x,f.y,R*3.2,0,6.283);ctx.fill();
      ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.kind==="done"?f.rot:0);
      ctx.shadowColor="rgba("+rgb+",1)";ctx.shadowBlur=16;ctx.fillStyle="#fff";
      if(f.kind==="done"){starPath(ctx,R*1.15);}else{markPath(ctx,R*.9);}
      ctx.fill();ctx.restore();
    }
    /* частицы */
    for(var j=pt.length-1;j>=0;j--){
      var a=pt[j];a.age+=dt;
      if(a.age>=a.life){pt.splice(j,1);continue;}
      a.x+=a.vx*dt;a.y+=a.vy*dt;a.vx*=.965;a.vy*=.965;
      var al=1-a.age/a.life,sz=a.size*(.4+.6*al);
      ctx.fillStyle="rgba("+a.c+","+(.85*al*al)+")";
      ctx.beginPath();ctx.arc(a.x,a.y,sz,0,6.283);ctx.fill();
    }
    ctx.globalCompositeOperation="source-over";
    if(!fl.length&&!pt.length&&!rg.length){raf=0;ctx.clearRect(0,0,W,H);close();return;}
    raf=requestAnimationFrame(loop);
  }
  window.addEventListener("resize",function(){if(raf){size();}});
  return {fly:fly};
})();

/* ---------- цели полёта ---------- */
function centerOf(el){var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,l:r.left,rt:r.right};}
function ringTarget(){
  var ring=document.querySelector(".pcard .ring");
  if(ring){var c=centerOf(ring);if(c.w>0&&c.rt>0&&c.l<window.innerWidth){return {pt:c,hit:function(){var pc=document.querySelector(".pcard");pc.classList.remove("hit");void pc.offsetWidth;pc.classList.add("hit");}};}}
  var m=$("menu");if(m){var mc=centerOf(m);if(mc.w>0){return {pt:mc,hit:function(){}};}}
  return null;
}
function savedTarget(){
  var n=$("ns")&&$("ns").firstChild;
  if(n){var c=centerOf(n);if(c.w>0&&c.rt>0&&c.l<window.innerWidth){return {pt:c,hit:function(){var b=$("navSaved");b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");}};}}
  var m=$("menu");if(m){var mc=centerOf(m);if(mc.w>0){return {pt:mc,hit:function(){}};}}
  return null;
}
/* до обработчика ядра: запоминаем, что действие включается, и придерживаем счётчик до приземления */
document.addEventListener("click",function(ev){
  if(reduce){return;}
  var b=ev.target&&ev.target.closest?ev.target.closest(".act[data-act='done'],.act[data-act='save']"):null;
  if(!b){return;}
  var act=b.getAttribute("data-act"),id=b.getAttribute("data-id");
  if(!id||!C.byId[id]){return;}
  if(act==="done"?C.S.done[id]:C.S.saved[id]){return;}
  var kind=act==="done"?"done":"save",key=act==="done"?"done":"saved";
  var tg=kind==="done"?ringTarget():savedTarget();
  if(!tg){return;}
  var from=centerOf(b);
  C.hold[key]++;C.quiet=true;setTimeout(function(){C.quiet=false;},60);
  FX.fly({from:from,to:tg.pt,kind:kind,onLand:function(){C.hold[key]--;C.recount();tg.hit();}});
},true);

/* =====================================================================
   СОЗВЕЗДИЕ
   ===================================================================== */
var SKY=(function(){
  var stage=$("skStage"),cv=$("skCanvas"),ctx=cv.getContext("2d"),btns=$("skBtns"),tip=$("skTip");
  var W=0,H=0,dpr=1,U=1,SS=1,stars=[],edges=[],labels=[],auras=[],dust=[],H2=window.HLB;
  var lit={},force=false,visible=false,running=false,raf=0,last=0,hoverId=null;
  var sparks=[],waves=[],shoot=null,nextShoot=0,introT=0,finT=0,finState=0,finPreview=false,finTimer=0,headState="";
  var mx=.5,my=.5,pmx=.5,pmy=.5;
  var seed=7;function rn(){seed=(seed*9301+49297)%233280;return seed/233280;}
  for(var i=0;i<170;i++){dust.push({x:rn(),y:rn(),r:.4+rn()*1.1,a:.15+rn()*.5,ph:rn()*6.28,d:.2+rn()});}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function isOn(id){return force||!!(lit[id]&&lit[id].on);}
  function starPath(c,r){c.beginPath();c.moveTo(0,-r);c.quadraticCurveTo(0,0,r,0);c.quadraticCurveTo(0,0,0,r);c.quadraticCurveTo(0,0,-r,0);c.quadraticCurveTo(0,0,0,-r);c.closePath();}

  function layout(){
    var r=stage.getBoundingClientRect();if(r.width<60){return;}
    W=Math.round(r.width);H=Math.round(r.height);dpr=lowQ?1:Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    var port=W/H<.85;U=port?Math.min(W/430,H/720):Math.min(W/1000,H/640);
    stars=[];edges=[];labels=[];auras=[];btns.innerHTML="";
    var by={};C.TIPS.forEach(function(e){(by[e.cat]=by[e.cat]||[]).push(e);});
    var order=[];H2.CAT_ORDER.forEach(function(k){if(by[k]){order.push(k);}});
    Object.keys(by).forEach(function(k){if(order.indexOf(k)<0){order.push(k);}});
    var k=order.length,cols=port?(W<420?1:2):Math.max(1,Math.ceil(Math.sqrt(k*W/H))),rows=Math.ceil(k/cols);
    var cw=W/cols,ch=H/rows,nmax=1;
    order.forEach(function(c){nmax=Math.max(nmax,by[c].length);});
    var ss=clamp(Math.min(cw,ch)/300,.62,1.05);
    order.forEach(function(cat,ci){
      var list=by[cat];list.sort(function(a,b){return a.rank-b.rank;});
      var n=list.length,row=Math.floor(ci/cols),col=ci%cols,inRow=Math.min(cols,k-row*cols);
      var off=(cols-inRow)*cw/2;
      var cx=off+col*cw+cw/2+(row%2?cw*.06:-cw*.06),cy=row*ch+ch/2-10*ss;
      var Rmax=Math.min(cw,ch)*.5-46*ss,Rn=Math.min(Rmax,Math.max(22+13*Math.sqrt(n)*ss,Rmax*(.42+.58*Math.sqrt(n/nmax))));
      var rot=ci*1.7,base=stars.length,minY=1e9,maxY=-1e9,minX=1e9,maxX=-1e9,pts=[];
      list.forEach(function(e,i){
        var rr=Rn*Math.sqrt((i+.6)/n),th=i*2.39996+rot;
        var s={id:e.id,cat:cat,e:e,x:cx+Math.cos(th)*rr*1.22,y:cy+Math.sin(th)*rr*.86,r:(2.3+e.tier*1.05)*ss,ph:rn()*6.28,idx:stars.length};
        stars.push(s);pts.push(s);minX=Math.min(minX,s.x);maxX=Math.max(maxX,s.x);minY=Math.min(minY,s.y);maxY=Math.max(maxY,s.y);
      });
      /* линии: минимальное остовное дерево плюс несколько коротких связей, как у настоящих созвездий */
      var inT={},dist=function(a,b){return Math.hypot(a.x-b.x,a.y-b.y);},sum=0,cnt=0,have={};
      if(n>1){
        inT[0]=true;
        for(var it=1;it<n;it++){
          var best=null,bd=1e9;
          for(var a=0;a<n;a++){if(!inT[a]){continue;}for(var b=0;b<n;b++){if(inT[b]){continue;}var d=dist(pts[a],pts[b]);if(d<bd){bd=d;best=[a,b];}}}
          inT[best[1]]=true;edges.push({a:base+best[0],b:base+best[1],p:0});have[best[0]+"-"+best[1]]=have[best[1]+"-"+best[0]]=1;sum+=bd;cnt++;
        }
        var avg=sum/cnt;
        for(var a2=0;a2<n;a2++){
          var nb=-1,nd=1e9;
          for(var b2=0;b2<n;b2++){if(b2===a2||have[a2+"-"+b2]){continue;}var d2=dist(pts[a2],pts[b2]);if(d2<nd){nd=d2;nb=b2;}}
          if(nb>=0&&nd<avg*1.35&&a2%2===0){edges.push({a:base+a2,b:base+nb,p:0});have[a2+"-"+nb]=have[nb+"-"+a2]=1;}
        }
      }
      labels.push({t:CATS[cat],x:(minX+maxX)/2,y:maxY+30*ss+8});
      auras.push({x:cx,y:cy,r:Rn*1.7,ids:list.map(function(e){return e.id;})});
    });
    stars.forEach(function(s){
      var b=document.createElement("button");b.type="button";b.className="sk-star";b.setAttribute("data-id",s.id);
      b.style.left=s.x+"px";b.style.top=s.y+"px";b.setAttribute("aria-label",s.e.title+(C.S.done[s.id]?". Сделано":". Ещё не сделано"));
      btns.appendChild(b);
    });
    SS=ss;
    if(!running){draw(performance.now(),.016);}
  }

  function ignite(s,now){
    waves.push({x:s.x,y:s.y,t0:now,dur:1000,r0:s.r,r1:s.r*11});
    for(var i=0;i<16;i++){
      var a=rn()*6.283,v=50+rn()*110;
      sparks.push({x:s.x,y:s.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,age:0,life:.7+rn()*.7,size:1+rn()*2.2,c:rn()<.3?"255,255,255":"140,215,230"});
    }
  }
  function sync(instant,base){
    var now=performance.now(),i=0,cnt=0;
    C.TIPS.forEach(function(e){if(C.S.done[e.id]){cnt++;}});
    var gap=Math.min(120,2400/Math.max(1,cnt));
    C.TIPS.forEach(function(e){
      var st=lit[e.id]||(lit[e.id]={on:false,v:0,pend:-1,t:-1}),want=!!C.S.done[e.id];
      if(want&&!st.on&&st.pend<0){
        if(instant||reduce){st.on=true;st.v=1;}else{st.pend=now+(base||0)+i*gap;i++;}
      }else if(!want&&(st.on||st.pend>=0)){st.on=false;st.pend=-1;}
    });
    qsa(".sk-star",btns).forEach(function(b){
      var e=C.byId[b.getAttribute("data-id")];if(e){b.setAttribute("aria-label",e.title+(C.S.done[e.id]?". Сделано":". Ещё не сделано"));}
    });
    if(!running){draw(performance.now(),.016);}
  }

  function draw(now,dt){
    ctx.clearRect(0,0,W,H);
    var introP=reduce?1:clamp((now-introT)/1800,0,1);
    pmx+=(mx-pmx)*.06;pmy+=(my-pmy)*.06;
    /* пыль */
    dust.forEach(function(d,di){
      if(lowQ&&di%2){return;}
      var tw=.55+.45*Math.sin(now/1100+d.ph),ox=(pmx-.5)*16*d.d,oy=(pmy-.5)*10*d.d;
      ctx.fillStyle="rgba(210,232,240,"+(d.a*tw*clamp(introP*2,0,1))+")";
      ctx.beginPath();ctx.arc(d.x*W+ox,d.y*H+oy,d.r,0,6.283);ctx.fill();
    });
    /* редкая падающая звезда */
    if(!reduce&&visible){
      if(!shoot&&now>nextShoot&&introP>=1){
        shoot={x:rn()*W*.6+W*.1,y:rn()*H*.35,vx:420+rn()*160,vy:150+rn()*90,t0:now};nextShoot=now+9000+rn()*9000;
      }
      if(shoot){
        var p=(now-shoot.t0)/1000;
        if(p>1){shoot=null;}else{
          var x=shoot.x+shoot.vx*p,y=shoot.y+shoot.vy*p,a=Math.sin(p*3.14159);
          var g=ctx.createLinearGradient(x,y,x-shoot.vx*.16,y-shoot.vy*.16);
          g.addColorStop(0,"rgba(255,255,255,"+.9*a+")");g.addColorStop(1,"rgba(255,255,255,0)");
          ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-shoot.vx*.16,y-shoot.vy*.16);ctx.stroke();
        }
      }
    }
    /* дыхание разделов: чем больше зажжено, тем ярче */
    auras.forEach(function(a){
      var n=0;a.ids.forEach(function(id){if(isOn(id)){n++;}});
      var f=n/a.ids.length;if(f<=0){return;}
      var ox=(pmx-.5)*10,oy=(pmy-.5)*6;
      var g=ctx.createRadialGradient(a.x+ox,a.y+oy,0,a.x+ox,a.y+oy,a.r);
      g.addColorStop(0,"rgba(102,184,203,"+(.16*f)+")");g.addColorStop(1,"rgba(102,184,203,0)");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(a.x+ox,a.y+oy,a.r,0,6.283);ctx.fill();
    });
    /* обновляем свечение звёзд */
    stars.forEach(function(s){
      var st=lit[s.id]||(lit[s.id]={on:false,v:0,pend:-1,t:-1});
      if(st.pend>=0&&now>=st.pend){st.on=true;st.pend=-1;st.t=now;ignite(s,now);}
      var target=(st.on||force)?1:0;
      st.v+=(target-st.v)*Math.min(1,dt*(target?6:3));
      if(Math.abs(target-st.v)<.002){st.v=target;}
    });
    /* линии */
    var elapsed=finState?now-finT:0;
    edges.forEach(function(ed,idx){
      var A=stars[ed.a],B=stars[ed.b];
      var NS=stars.length||1,ap=clamp(introP*1.8-(A.idx/NS)*.9,0,1)*clamp(introP*1.8-(B.idx/NS)*.9,0,1);
      var both=isOn(A.id)&&isOn(B.id);
      var tp=both?1:0;ed.p+=(tp-ed.p)*Math.min(1,dt*(both?2.6:4));
      ctx.setLineDash([3,7]);ctx.strokeStyle="rgba(180,215,225,"+(.2*ap)+")";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();ctx.setLineDash([]);
      if(ed.p>.01){
        var ex=A.x+(B.x-A.x)*ed.p,ey=A.y+(B.y-A.y)*ed.p;
        var g=ctx.createLinearGradient(A.x,A.y,B.x,B.y);
        g.addColorStop(0,"rgba(150,225,240,"+(.85*ed.p)+")");g.addColorStop(1,"rgba(102,184,203,"+(.85*ed.p)+")");
        ctx.save();
        ctx.strokeStyle="rgba(102,184,203,"+(.16*ed.p)+")";ctx.lineWidth=5;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(ex,ey);ctx.stroke();
        ctx.strokeStyle=g;ctx.lineWidth=1.6;
        ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.restore();
      }
      if(finState&&elapsed>500){
        var u=(elapsed-500-idx*90)/1100;
        if(u>0&&u<1){
          var px=A.x+(B.x-A.x)*u,py=A.y+(B.y-A.y)*u;
          var gg=ctx.createRadialGradient(px,py,0,px,py,16);gg.addColorStop(0,"rgba(255,255,255,.95)");gg.addColorStop(1,"rgba(150,225,240,0)");
          ctx.fillStyle=gg;ctx.beginPath();ctx.arc(px,py,16,0,6.283);ctx.fill();
        }
      }
    });
    /* звёзды */
    stars.forEach(function(s){
      var st=lit[s.id],v=st?st.v:0,ap=clamp(introP*1.8-(s.idx/(stars.length||1))*.9,0,1);
      if(ap<=0){return;}
      var tw=.5+.5*Math.sin(now/900+s.ph),sc=.6+.4*ap;
      var since=st&&st.t>0?(now-st.t)/1000:9,ig=since<.9?Math.sin(clamp(since/.9,0,1)*3.14159):0;
      var fb=finState?clamp(1-elapsed/1400,0,1)*clamp(elapsed/120,0,1):0;
      ctx.save();ctx.translate(s.x,s.y);ctx.scale(sc,sc);
      var dimA=(.42+.3*tw)*(1-v)*ap;
      ctx.strokeStyle="rgba(205,228,236,"+dimA+")";ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,s.r,0,6.283);ctx.stroke();
      ctx.fillStyle="rgba(205,228,236,"+(dimA*.9)+")";ctx.beginPath();ctx.arc(0,0,s.r*.3,0,6.283);ctx.fill();
      if(v>.01){
        var pulse=1+.07*Math.sin(now/700+s.ph),R=s.r*(5.6+3*ig+2.4*fb)*pulse;
        var g=ctx.createRadialGradient(0,0,0,0,0,R);
        g.addColorStop(0,"rgba(190,240,250,"+(.6*v)+")");g.addColorStop(.35,"rgba(102,184,203,"+(.24*v)+")");g.addColorStop(1,"rgba(102,184,203,0)");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R,0,6.283);ctx.fill();
        ctx.globalCompositeOperation="lighter";
        ctx.fillStyle="rgba(235,250,255,"+(.95*v)+")";
        starPath(ctx,s.r*(2.5+1.8*ig+1.4*fb)*v*pulse);ctx.fill();
        ctx.beginPath();ctx.arc(0,0,s.r*.62,0,6.283);ctx.fill();
        ctx.globalCompositeOperation="source-over";
      }
      if(hoverId===s.id){
        ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,s.r+9+Math.sin(now/300)*1.2,0,6.283);ctx.stroke();
      }
      ctx.restore();
    });
    /* подписи разделов */
    ctx.textAlign="center";ctx.font="italic 500 "+Math.round(17*Math.max(.85,U))+"px 'Cormorant Garamond',Georgia,serif";
    labels.forEach(function(l,i){
      var a=clamp(introP*2-.4-i*.05,0,1);
      ctx.fillStyle="rgba(225,240,244,"+(.55*a)+")";ctx.fillText(l.t,l.x,l.y);
    });
    /* волны и искры */
    ctx.globalCompositeOperation="lighter";
    for(var i=waves.length-1;i>=0;i--){
      var w=waves[i],p=(now-w.t0)/w.dur;
      if(p<0){continue;}
      if(p>=1){waves.splice(i,1);continue;}
      var e=1-Math.pow(1-p,3);
      ctx.strokeStyle="rgba(150,225,240,"+(.7*(1-p))+")";ctx.lineWidth=2*(1-p)+.5;
      ctx.beginPath();ctx.arc(w.x,w.y,w.r0+(w.r1-w.r0)*e,0,6.283);ctx.stroke();
    }
    for(var j=sparks.length-1;j>=0;j--){
      var q=sparks[j];q.age+=dt;
      if(q.age<0){continue;}
      if(q.age>=q.life){sparks.splice(j,1);continue;}
      q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.972;q.vy*=.972;
      var al=1-q.age/q.life;
      ctx.fillStyle="rgba("+q.c+","+(.9*al*al)+")";ctx.beginPath();ctx.arc(q.x,q.y,q.size*(.4+.6*al),0,6.283);ctx.fill();
    }
    ctx.globalCompositeOperation="source-over";
  }
  var slowN=0,lowQ=false;
  function loop(ts){
    raf=0;
    if(!visible||document.hidden){running=false;return;}
    var dt=Math.min(.05,(ts-last)/1000);last=ts;
    if(!lowQ&&!finState){
      if(dt>.036){slowN++;}else{slowN=Math.max(0,slowN-2);}
      if(slowN>50){lowQ=true;if(dpr>1){layout();}}
    }
    draw(ts,dt);
    raf=requestAnimationFrame(loop);
  }
  function start(){
    if(reduce){draw(performance.now(),.016);return;}
    if(running){return;}
    running=true;last=performance.now();raf=requestAnimationFrame(loop);
  }
  function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0;}}

  /* подсказка над звездой */
  function showTip(s){
    var e=s.e,done=!!C.S.done[e.id];
    tip.innerHTML="<small>"+CATS[s.cat]+"</small><b>"+e.title+"</b><span class='tn'>"+e.big+"</span><i>"+(done?"Сделано":"Ещё не сделано")+"</i>";
    var w=tip.offsetWidth,h=tip.offsetHeight,x=clamp(s.x-w/2,10,W-w-10),y=s.y-h-22;
    if(y<10){y=s.y+26;}
    tip.style.left=x+"px";tip.style.top=y+"px";tip.classList.add("on");
  }
  function hideTip(){tip.classList.remove("on");}
  function starById(id){for(var i=0;i<stars.length;i++){if(stars[i].id===id){return stars[i];}}return null;}
  btns.addEventListener("mouseover",function(ev){var b=ev.target.closest&&ev.target.closest(".sk-star");if(b){hoverId=b.getAttribute("data-id");var s=starById(hoverId);if(s){showTip(s);}if(!running){draw(performance.now(),.016);}}});
  btns.addEventListener("mouseout",function(ev){var b=ev.target.closest&&ev.target.closest(".sk-star");if(b){hoverId=null;hideTip();if(!running){draw(performance.now(),.016);}}});
  btns.addEventListener("focusin",function(ev){var b=ev.target.closest&&ev.target.closest(".sk-star");if(b){hoverId=b.getAttribute("data-id");var s=starById(hoverId);if(s){showTip(s);}}});
  btns.addEventListener("focusout",function(){hoverId=null;hideTip();});
  btns.addEventListener("click",function(ev){var b=ev.target.closest&&ev.target.closest(".sk-star");if(b){C.nav(b.getAttribute("data-id"));}});
  stage.addEventListener("pointermove",function(ev){var r=stage.getBoundingClientRect();mx=(ev.clientX-r.left)/r.width;my=(ev.clientY-r.top)/r.height;},{passive:true});

  /* заголовок экрана: сообщение о финале живёт здесь, сцена остаётся видна целиком */
  function setHead(state,st,force2){
    if(headState===state&&!force2){return;}
    headState=state;
    var h=$("skh"),s=$("skSub");
    if(state==="def"){h.textContent="Ваше созвездие";s.textContent="Каждая звезда это один совет. Отметьте «Сделал», и она загорится.";}
    else if(state==="done"){h.textContent="Созвездие собрано";s.textContent="Вы отметили все "+st.total+" советов. Ни одна звезда не осталась тёмной.";}
    else{h.textContent="Созвездие собрано";s.textContent="Так это будет выглядеть, когда вы отметите все "+st.total+" советов.";}
    h.classList.toggle("fin",state!=="def");
    if(!reduce){[h,s].forEach(function(el){el.classList.remove("swap");void el.offsetWidth;el.classList.add("swap");});}
  }
  function isComplete(){var st=C.stats();return st.total>0&&st.done===st.total;}
  function flash(){var fl=$("skFlash");fl.classList.remove("go");void fl.offsetWidth;fl.classList.add("go");}
  function finale(preview){
    if(finState||!stars.length){return;}
    finState=1;finPreview=!!preview;force=true;finT=performance.now();
    var now=finT,cx=W/2,cy=H/2;
    for(var k=0;k<3;k++){waves.push({x:cx,y:cy,t0:now+k*260,dur:2200,r0:10,r1:Math.hypot(W,H)*.62});}
    var per=Math.max(4,Math.min(30,Math.floor(520/Math.max(1,stars.length))));
    stars.forEach(function(s,i){
      for(var n=0;n<per;n++){
        var a=rn()*6.283,v=60+rn()*230;
        sparks.push({x:s.x,y:s.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,age:-i*.03,life:1.2+rn()*1.3,size:1+rn()*2.6,c:rn()<.35?"255,255,255":(rn()<.5?"140,215,230":"255,226,170")});
      }
      if(stars.length<=30||i%3===0){waves.push({x:s.x,y:s.y,t0:now+(i%20)*45,dur:1300,r0:s.r,r1:s.r*15});}
    });
    setHead(preview?"preview":"done",C.stats());
    if(!reduce){flash();}
    $("skFin").hidden=true;
    start();
    clearTimeout(finTimer);finTimer=setTimeout(closeFinale,preview?8000:6500);
  }
  function closeFinale(){
    if(!finState){return;}
    clearTimeout(finTimer);
    finState=0;
    if(finPreview){force=false;}
    finPreview=false;
    $("skFin").hidden=false;
    setHead(isComplete()?"done":"def",C.stats());
    refreshBtn();
    if(!running){draw(performance.now(),.016);}
  }
  function refreshBtn(){$("skFin").textContent=isComplete()?"Показать финал ещё раз":"Предпросмотр финала";}

  function show(){
    visible=true;
    var now=performance.now();
    Object.keys(lit).forEach(function(k){lit[k].on=false;lit[k].v=0;lit[k].pend=-1;lit[k].t=-1;});
    sparks.length=0;waves.length=0;
    layout();introT=now;nextShoot=now+7000;
    headState="";setHead(isComplete()?"done":"def",C.stats());
    sync(false,900);
    refreshBtn();
    start();
  }
  function hide(){visible=false;stop();hideTip();clearTimeout(finTimer);finState=0;force=false;finPreview=false;$("skFin").hidden=false;}
  if(window.ResizeObserver){new ResizeObserver(function(){if(visible){layout();}}).observe(stage);}else{window.addEventListener("resize",function(){if(visible){layout();}});}
  document.addEventListener("visibilitychange",function(){if(!document.hidden&&visible){start();}});
  $("skFin").addEventListener("click",function(){finale(!isComplete());});
  stage.addEventListener("click",function(ev){if(finState&&finPreview&&!(ev.target.closest&&ev.target.closest(".sk-star"))){closeFinale();}});
  return {show:show,hide:hide,sync:sync,finale:finale,closeFinale:closeFinale,isFinale:function(){return !!finState;},refreshBtn:refreshBtn,syncHead:function(){if(!finState){setHead(isComplete()?"done":"def",C.stats());}}};
})();

/* ---------- вход в экран и выход ---------- */
function enterSky(push){
  if(skyOn){return;}
  skyOn=true;
  document.body.setAttribute("data-mode","sky");
  $("navSky").setAttribute("aria-pressed","true");
  $("crumb").textContent="Созвездие";
  $("skyview").hidden=false;
  window.scrollTo(0,0);
  SKY.show();
  if(push!==false){try{if(location.hash!=="#sky"){location.hash="sky";}}catch(e){}}
  side(false);
}
function leaveSky(){
  if(!skyOn){return;}
  skyOn=false;
  SKY.hide();
  $("skyview").hidden=true;
  document.body.setAttribute("data-mode",lastMode||"tips");
  $("navSky").setAttribute("aria-pressed","false");
  $("crumb").textContent=C.S.cat==="all"?"Все советы":CATS[C.S.cat];
  if(location.hash==="#sky"){try{history.replaceState(null,"",location.pathname+location.search);}catch(e){}}
  update();
}
$("navSky").addEventListener("click",function(){enterSky();});
$("m-cats").addEventListener("click",function(){if(skyOn){leaveSky();}});
document.addEventListener("change",function(e){if(e.target.name==="cat"&&skyOn){leaveSky();}});
$("q").addEventListener("input",function(){if(skyOn){leaveSky();}});
window.addEventListener("hashchange",function(){
  var h=location.hash;
  if(h==="#sky"&&!skyOn){enterSky(false);}
  else if(!h&&skyOn&&!dr.open){leaveSky();}
});
document.addEventListener("keydown",function(ev){
  if(ev.key==="Escape"&&SKY.isFinale()){ev.preventDefault();SKY.closeFinale();}
},true);

/* ---------- финал по завершению всех советов ---------- */
var prevDone=null,finaleSeen=false;
hooks.onStats=function(st){
  if(prevDone===null){prevDone=st.done;}
  $("skyBadge").textContent=Math.max(0,st.done-C.hold.done)+"/"+st.total;
  var complete=st.total>0&&st.done===st.total;
  if(complete&&prevDone<st.total){
    setTimeout(function(){
      var s2=C.stats();if(!(s2.total>0&&s2.done===s2.total)){return;}
      if(!finaleSeen){
        finaleSeen=true;
        var wait=0;if(dr.open){C.nav(null);wait=380;}
        setTimeout(function(){enterSky();setTimeout(function(){SKY.finale(false);},reduce?0:1500);},wait);
      }else{
        C.toast("Все советы отмечены");
        var nb=$("navSky");nb.classList.remove("hit");void nb.offsetWidth;nb.classList.add("hit");
      }
    },reduce?150:1300);
  }
  prevDone=st.done;
  if(skyOn){SKY.refreshBtn();SKY.syncHead();if(!dr.open){SKY.sync(false,0);}}
};
