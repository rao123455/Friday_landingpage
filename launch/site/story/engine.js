/* Friday 3D chapter. Ported from the 'Friday Store Page' artifact (Oct 2026); runs as one chapter mid-page. */
window.FS=window.FS||{on:false,update:function(){},set:function(){}};
(function(){
  var doc=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window&&!reduce)doc.classList.add('reveal');

  /* no loading gate here: the chapter builds while the visitor reads the page above it */
  function step(){}

  /* compare slider */
  var desk=document.getElementById('desk'),range=document.getElementById('desk-range');
  if(desk&&range){var drag=false;
    var setPos=function(p,settle){p=Math.max(0,Math.min(100,p));desk.classList.toggle('settle',!!settle);desk.style.setProperty('--pos',p+'%');range.value=Math.round(p);};
    var fx=function(e){var r=desk.getBoundingClientRect();return (e.clientX-r.left)/r.width*100;};
    desk.addEventListener('pointerdown',function(e){drag=true;desk.setPointerCapture(e.pointerId);setPos(fx(e),true);});
    desk.addEventListener('pointermove',function(e){if(drag)setPos(fx(e),false);});
    desk.addEventListener('pointerup',function(){drag=false;});desk.addEventListener('pointercancel',function(){drag=false;});
    desk.addEventListener('click',function(){range.focus({preventScroll:true});});
    range.addEventListener('input',function(){setPos(+range.value,true);});}
  /* the overlay replays her real captured answers (tools/reel/answers.json) with overlay.py's state colours */
  (function(){var dot=document.getElementById('ov-dot'),you=document.getElementById('ov-you'),ans=document.getElementById('ov-ans');if(!dot||reduce||!desk)return;
    var C={listening:'#3cbe78',thinking:'#e6aa28',speaking:'#7cc0ff',idle:'#5a78c8'},turns=[["Open Chrome.","Opening it now."],["Is 97 a prime number?","Yes, 97 is prime."],["Take a screenshot.","I've taken a screenshot."]],i=0,go=false,seen=false;
    function stepTurn(){var t=turns[i++%turns.length],k=0,full='you:  '+t[0];dot.style.background=C.listening;ans.style.opacity=0;you.textContent='';
      (function type(){if(k<=full.length){you.textContent=full.slice(0,k++);setTimeout(type,45);}else{dot.style.background=C.thinking;setTimeout(function(){dot.style.background=C.speaking;ans.textContent=t[1];ans.style.opacity=1;setTimeout(function(){dot.style.background=C.idle;setTimeout(stepTurn,2600);},1400);},650);}})();}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){seen=es[0].isIntersecting;if(seen&&!go){go=true;setTimeout(stepTurn,900);}},{threshold:.3}).observe(desk);})();



  if(doc.classList.contains('reveal')){var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');decode(e.target.querySelector('h2'));rio.unobserve(e.target);}});},{rootMargin:'0px 0px -18% 0px'});
    [].forEach.call(document.querySelectorAll('.details .wrap'),function(w){rio.observe(w);});}

  /* ---------- pointer: a ring that follows, and the room leans toward it ---------- */
  var cur=document.querySelector('.cur'),pmx=0,pmy=0,tmx=0,tmy=0,cx=-100,cy=-100,ccx=-100,ccy=-100;
  document.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;tmx=e.clientX/window.innerWidth*2-1;tmy=e.clientY/window.innerHeight*2-1;cx=e.clientX;cy=e.clientY;
    if(cur){cur.classList.add('on');cur.classList.toggle('big',!!e.target.closest('a,button,input,label,[data-coord]')||document.body.style.cursor==='pointer');}},{passive:true});
  document.addEventListener('pointerleave',function(){if(cur)cur.classList.remove('on');});
  (function cloop(){ccx+=(cx-ccx)*.2;ccy+=(cy-ccy)*.2;if(cur)cur.style.transform='translate3d('+ccx.toFixed(1)+'px,'+ccy.toFixed(1)+'px,0)';requestAnimationFrame(cloop);})();
  window.addEventListener('scroll',function(){if(window.scrollY>40)doc.classList.add('moved');},{passive:true});

  /* ---------- the loop ---------- */
  (function(){var end=document.getElementById('loopEnd'),busy=false;if(!end||!('IntersectionObserver' in window))return;
    new IntersectionObserver(function(es){if(!es[0].isIntersecting||busy)return;busy=true;doc.classList.add('looping');
      setTimeout(function(){if(lenis)lenis.scrollTo(0,{immediate:true,force:true});window.scrollTo(0,0);if(window.__snap)window.__snap();
        setTimeout(function(){doc.classList.remove('looping');busy=false;},250);},800);},{threshold:1}).observe(end);})();

  /* ---------- details panel toggles the corners ---------- */
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){doc.classList.toggle('details-on',es[0].isIntersecting);},{rootMargin:'0px 0px -62% 0px'}).observe(document.getElementById('details'));
  }

  /* ---------- the coordination animation (click) ---------- */
  var coord=document.getElementById('coord'),csvg=document.getElementById('csvg'),cTimer=null,cT0=0,lastFocus=null;
  var qEl=document.getElementById('q'),qLbl=document.getElementById('qlbl'),rc=document.getElementById('rcpt'),pk=document.getElementById('pk');
  var stB=document.getElementById('st-b'),stS=document.getElementById('st-s'),stD=document.getElementById('st-d');
  var ms=[document.getElementById('m0s'),document.getElementById('m1s'),document.getElementById('m2s')];
  var NS='http://www.w3.org/2000/svg';
  var ORIG='compare these two offers for Anita Rao',MASK='compare these two offers for [[PERSON_1]]';
  var BEATS=[
    [0,  'You ask, out loud.','"Compare these two offers for Anita Rao."'],
    [2.2,'Names are stripped before anything leaves.','Anita Rao becomes [[PERSON_1]]. The real name stays on your PC.'],
    [4.4,'A hard question goes to every model you have.','Claude, ChatGPT and Gemini each get the masked question.'],
    [6.8,'Their answers come back.','Friday combines the best of them into one.'],
    [9.0,'Your names come back, on your PC.','[[PERSON_1]] turns back into Anita Rao locally.'],
    [11.0,'And a receipt says what happened.','Who answered, and what was hidden on the way out.']];
  var LEN=14;
  BEATS.forEach(function(){var i=document.createElement('i');stD.appendChild(i);});
  function scr(a,b,p){var n=Math.max(a.length,b.length),o='',G='abcdefghijklmnopqrstuvwxyz[]_0123456789';
    for(var i=0;i<n;i++){var s=i/n;o+=p>s+.12||p>=1?(b[i]||''):p>s?(b[i]===' '?' ':G[(Math.random()*G.length)|0]):(a[i]||'');}return o;}
  function packet(pathId,t,col){var path=document.getElementById(pathId),L=path.getTotalLength(),pt=path.getPointAtLength(Math.max(0,Math.min(1,t))*L);
    var c=document.createElementNS(NS,'circle');c.setAttribute('cx',pt.x);c.setAttribute('cy',pt.y);c.setAttribute('r',4);c.setAttribute('fill',col);pk.appendChild(c);}
  function cl(x){return Math.max(0,Math.min(1,x));}
  function drawCoord(t){
    pk.textContent='';var b=0;for(var i=0;i<BEATS.length;i++)if(t>=BEATS[i][0])b=i;
    if(b!==drawCoord.b){drawCoord.b=b;}
    stB.textContent=BEATS[b][1];stS.textContent=BEATS[b][2];
    [].forEach.call(stD.children,function(d,j){d.classList.toggle('on',j===b);});
    // question text
    if(t<2.2){qLbl.textContent='YOU SAID';qEl.textContent=ORIG.slice(0,Math.floor(cl(t/1.6)*ORIG.length));qEl.setAttribute('fill','#ecebe7');packet('w-you',cl((t-1.2)/1),'#ecebe7');}
    else if(t<9){qLbl.textContent='WHAT LEAVES';qEl.textContent=scr(ORIG,MASK,cl((t-2.4)/1.4));qEl.setAttribute('fill','#c9b99a');}
    else {qLbl.textContent='WHAT YOU SEE';qEl.textContent=scr(MASK,ORIG,cl((t-9.2)/1.2));qEl.setAttribute('fill','#a9c2b3');}
    // out and back
    for(var k=0;k<3;k++){
      var out=cl((t-4.5-k*.25)/1.1),back=cl((t-6.8-k*.3)/1.1);
      if(out>0&&out<1)packet('w'+k,out,'#c9b99a');
      if(back>0&&back<1)packet('w'+k,1-back,'#ecebe7');
      ms[k].textContent=t<4.5+k*.25?'idle':(back<=0?(out>=1?'thinking':'receiving'):(back<1?'answered':'answered'));
    }
    rc.textContent=t>=11?'council of 3 → synthesized by claude (cloud) · 1 identifier hidden (PERSON)':'';
  }
  function tickCoord(now){if(!coord.classList.contains('open'))return;var t=((now-cT0)/1000)%LEN;drawCoord(t);cTimer=requestAnimationFrame(tickCoord);}
  function openCoord(){lastFocus=document.activeElement;coord.classList.add('open');coord.setAttribute('aria-hidden','false');document.getElementById('coord-x').focus();
    if(reduce){drawCoord(11.5);return;}cT0=performance.now();cTimer=requestAnimationFrame(tickCoord);}
  function closeCoord(){drawCoord.b=-1;coord.classList.remove('open');coord.setAttribute('aria-hidden','true');if(cTimer)cancelAnimationFrame(cTimer);if(lastFocus)lastFocus.focus();}
  [].forEach.call(document.querySelectorAll('[data-coord]'),function(b){b.addEventListener('click',openCoord);});
  document.getElementById('coord-x').addEventListener('click',closeCoord);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&coord.classList.contains('open'))closeCoord();});
  window.__openCoord=openCoord;

  /* ---------- the scroll story ---------- */
  var giants=[].slice.call(document.querySelectorAll('.giant span'));
  var story=document.getElementById('story'),caps=[].slice.call(document.querySelectorAll('.cap'));
  var linkEls=[].slice.call(document.querySelectorAll('#links span'));
  var navs=[].slice.call(document.querySelectorAll('.nav a[data-go]'));
  var stTxt=document.getElementById('st-txt'),stDot=document.getElementById('st-dot'),prog=document.getElementById('prog');
  function storyP(){if(typeof AN==='undefined'||!AN||performance.now()-anT>2000){if(typeof anchors==='function')anchors();else{var total=story.offsetHeight-window.innerHeight;return Math.max(0,Math.min(1,(window.scrollY-story.offsetTop)/Math.max(1,total)));}}
    return Math.max(0,Math.min(1,(window.scrollY-AN.sTop)/Math.max(1,AN.sTot)));}
  /* weighted, inertial scrolling (Lenis, MIT): the page glides instead of stepping */
  var lenis=null;
  if(window.Lenis&&!reduce){lenis=new Lenis({lerp:.075,wheelMultiplier:.85,touchMultiplier:1.4,smoothWheel:true});window.__lenis=lenis;
    if(doc.classList.contains('gate'))lenis.stop();
    (function lraf(t){lenis.raf(t);requestAnimationFrame(lraf);})(performance.now());}
  function goTo(y){if(lenis)lenis.scrollTo(y,{duration:2.2});else window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});}
  navs.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var total=story.offsetHeight-window.innerHeight;
    goTo(story.offsetTop+parseFloat(a.dataset.go)*total+2);});});
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a||a.dataset.go!==undefined)return;var id=a.getAttribute('href').slice(1),el=id&&document.getElementById(id);
    if(!el&&id!=='top')return;e.preventDefault();goTo(id==='top'?0:el.getBoundingClientRect().top+window.scrollY-16);});
  function ss(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  /* where we are in the details, as one number: -1 at the end of the story, 0..4 centred on each panel, 5 at the footer */
  var detailsEl=document.getElementById('details'),dBlocks=[].slice.call(detailsEl.querySelectorAll('.block'));
  var AN=null,anT=0,vh=window.innerHeight;
  function anchors(){vh=window.innerHeight;var a=[story.offsetTop+story.offsetHeight-vh/2];
    dBlocks.forEach(function(b){a.push(detailsEl.offsetTop+b.offsetTop+b.offsetHeight/2);});
    AN={a:a,end:document.documentElement.scrollHeight-vh/2,sTop:story.offsetTop,sTot:story.offsetHeight-vh};anT=performance.now();}
  window.addEventListener('resize',function(){AN=null;});window.addEventListener('load',function(){AN=null;});
  function detailsD(){return -1;}
  var DCH=['Privacy','Invisible','Pricing','Questions','Changelog'];
  var CH=[[0,'Today','#8d93a1'],[.34,'Without Friday','#c9a0a0'],[.40,'Connect','#a9b6c9'],[.60,'Talk','#a9c2b3'],[.735,'Features','#a9b6c9']];
  function updateDom(p){
    caps.forEach(function(c){var a=+c.dataset.a,b=+c.dataset.b,o=ss(a,a+.018,p)*(1-ss(b-.018,b,p));if(a===0)o=1-ss(b-.02,b,p);
      c.style.opacity=o.toFixed(3);var y=(1-o)*18;
      c.style.transform=c.classList.contains('end')&&window.innerWidth>820?'translate3d(-50%,'+y+'px,0)':c.classList.contains('center')&&window.innerWidth>820?'translate3d(-50%,calc(-50% + '+y+'px),0)':(c.classList.contains('hero')||window.innerWidth<=820?'translate3d(0,'+y+'px,0)':'translate3d(0,calc(-50% + '+y+'px),0)');
      var was=c.classList.contains('on');c.classList.toggle('on',o>.05);if(!was&&o>.05)decode(c.querySelector('h1,h2,.big'));});
    linkEls.forEach(function(s,i){s.classList.toggle('lit',p>.435+i*.03);});
    var ch=CH[0];CH.forEach(function(c){if(p>=c[0])ch=c;});stTxt.textContent=ch[1];stDot.style.background=ch[2];
    navs.forEach(function(a,i){var g=+a.dataset.go,nx=navs[i+1]?+navs[i+1].dataset.go:1.01;a.setAttribute('aria-current',p>=g-.02&&p<nx-.02?'true':'false');});
    prog.style.transform='scaleX('+p.toFixed(4)+')';
    giants.forEach(function(g){var a=+g.dataset.a,b=+g.dataset.b,k=(p-a)/(b-a),o=ss(0,.12,k)*(1-ss(.88,1,k));
      g.style.opacity=o.toFixed(3);g.style.transform='translate3d('+(20-k*95).toFixed(2)+'vw,-50%,0)';});
  }

  /* headings resolve out of noise when they arrive, then sit still */
  var GL='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  function decode(el){if(!el||reduce||el.children.length)return;var txt=el.dataset.txt||(el.dataset.txt=el.textContent),n=txt.length,t0=performance.now(),D=700;
    el.setAttribute('aria-label',txt);if(el._dec)cancelAnimationFrame(el._dec);
    (function f(now){var k=Math.min(1,(now-t0)/D),o='';for(var i=0;i<n;i++){var ch=txt[i],at=i/n*.75;o+=(ch===' '||k>=at+.25)?ch:(k>=at?GL[(Math.random()*GL.length)|0]:'\u00a0');}
      el.textContent=o;if(k<1)el._dec=requestAnimationFrame(f);else{el.textContent=txt;el._dec=0;}})(t0);}
  window.__decode=decode;
  function staticStory(){doc.classList.add('static-story');linkEls.forEach(function(s){s.classList.add('lit');});step();}
  if(!window.THREE){doc.classList.add('nogl');staticStory();return;}
  var cv=document.getElementById('gl'),renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});}catch(err){doc.classList.add('nogl');staticStory();return;}
  var lite=!/[?&]hq/.test(location.search)&&(window.innerWidth<820||(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,/[?&]hq/.test(location.search)?1.6:lite?1:1.25));
  renderer.setClearColor(0x0a0a0c,1);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;

  var scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x07090b,.085);
  var camera=new THREE.PerspectiveCamera(38,1,.05,60);

  /* A warm practical light, cool monitor bounce and a broad photographic key. */
  scene.add(new THREE.HemisphereLight(0x8fa3b8,0x160f0b,.16));   /* barely any fill: the room lives in its practicals */
  var key=new THREE.SpotLight(0xffdfbe,2.5,12,.9,.9,1.5);key.position.set(2.2,3.4,2.2);key.target.position.set(0,.8,-.1);
  key.castShadow=true;key.shadow.mapSize.set(lite?512:1024,lite?512:1024);key.shadow.radius=4;key.shadow.bias=-.0005;scene.add(key);scene.add(key.target);
  var rim=new THREE.DirectionalLight(0x9cc0ff,1.5);rim.position.set(-2.2,2.7,-2.1);scene.add(rim);
  var screenLight=new THREE.PointLight(0x86b4ff,3.2,3.6,1.6);screenLight.position.set(0,1.3,.1);scene.add(screenLight);
  var practical=new THREE.PointLight(0xff9a4d,1.7,3.4,1.6);practical.position.set(1.45,1.7,-.65);scene.add(practical);

  function seeded(n){return function(){n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
  function texture(w,h,paint){var c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;}
  var wood=texture(1024,512,function(g,w,h){var r=seeded(241);
    g.fillStyle='#50372a';g.fillRect(0,0,w,h);
    for(var y=0;y<h;y++){var v=r(),a=.017+v*.08;g.fillStyle='rgba(230,176,119,'+a+')';g.fillRect(0,y,w,1);if(v>.88){g.fillStyle='rgba(18,12,11,.13)';g.fillRect(0,y+2,w,1);}}
    for(var i=0;i<130;i++){var yy=r()*h;g.strokeStyle='rgba(13,10,9,'+(.02+r()*.085)+')';g.lineWidth=.5+r()*2;g.beginPath();g.moveTo(-20,yy);g.bezierCurveTo(w*.3,yy+(r()-.5)*13,w*.7,yy+(r()-.5)*14,w+20,yy+(r()-.5)*10);g.stroke();}
    var shade=g.createLinearGradient(0,0,w,0);shade.addColorStop(0,'rgba(0,0,0,.18)');shade.addColorStop(.5,'rgba(255,215,165,.035)');shade.addColorStop(1,'rgba(0,0,0,.2)');g.fillStyle=shade;g.fillRect(0,0,w,h);
  });
  var fabric=texture(256,256,function(g,w,h){var r=seeded(922);g.fillStyle='#353a3d';g.fillRect(0,0,w,h);for(var i=0;i<16000;i++){var v=Math.floor(25+r()*80);g.fillStyle='rgba('+v+','+(v+5)+','+(v+6)+','+(.08+r()*.12)+')';g.fillRect(r()*w,r()*h,1,2);}});
  var mClay=new THREE.MeshPhysicalMaterial({color:0xb58c74,roughness:.58,clearcoat:.06,clearcoatRoughness:.6,sheen:new THREE.Color(0x3a2418)});
  var mShirt=new THREE.MeshPhysicalMaterial({color:0x43555a,map:fabric,roughness:.94,sheen:new THREE.Color(0x26343a)});
  var mHair=new THREE.MeshStandardMaterial({color:0x1d1717,roughness:.92});
  var mPants=new THREE.MeshStandardMaterial({color:0x272d34,roughness:.91});
  var mShoes=new THREE.MeshStandardMaterial({color:0x181b1c,roughness:.65});
  var wear=texture(1024,512,function(g,w,h){var r=seeded(733);g.fillStyle='#737373';g.fillRect(0,0,w,h);
    for(var i=0;i<60;i++){var x=r()*w,y=r()*h,rad=30+r()*120,gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(170,170,170,'+(.12+r()*.2)+')');gr.addColorStop(1,'rgba(170,170,170,0)');g.fillStyle=gr;g.fillRect(x-rad,y-rad,rad*2,rad*2);}
    for(var j=0;j<420;j++){var sx=r()*w,sy=r()*h,a=(r()-.5)*.6,len=10+r()*70;g.strokeStyle='rgba(210,210,210,'+(.12+r()*.3)+')';g.lineWidth=.5+r()*.8;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a)*len,sy+Math.sin(a)*len);g.stroke();}});
  wear.encoding=THREE.LinearEncoding;
  var mWood=new THREE.MeshPhysicalMaterial({color:0xffffff,map:wood,roughness:.62,roughnessMap:wear,metalness:.02,clearcoat:.35,clearcoatRoughness:.5,clearcoatRoughnessMap:wear});
  var mDark=new THREE.MeshStandardMaterial({color:0x202328,roughness:.62,metalness:.68});
  var mMid=new THREE.MeshStandardMaterial({color:0x34373d,roughness:.73,metalness:.18});
  var mKey=new THREE.MeshStandardMaterial({color:0x343840,roughness:.5,metalness:.16});
  var mBezel=new THREE.MeshStandardMaterial({color:0x0d1014,roughness:.34,metalness:.66});
  var fadingMats=[mClay,mShirt,mHair,mPants,mShoes,mWood,mDark,mMid,mKey,mBezel];

  /* floorboards: dark oiled oak, a little sheen, so the lamp catches it */
  var boards=texture(1024,1024,function(g,w,h){var r=seeded(311);g.fillStyle='#2a1f19';g.fillRect(0,0,w,h);
    for(var b=0;b<8;b++){var y0=b*h/8,tone=18+r()*14;g.fillStyle='rgba('+(40+tone)+','+(28+tone*.7)+','+(22+tone*.5)+',1)';g.fillRect(0,y0,w,h/8);
      for(var i=0;i<60;i++){var yy=y0+r()*h/8;g.strokeStyle='rgba(10,6,4,'+(.05+r()*.12)+')';g.lineWidth=.6+r()*1.6;g.beginPath();g.moveTo(0,yy);g.bezierCurveTo(w*.3,yy+(r()-.5)*6,w*.7,yy+(r()-.5)*6,w,yy+(r()-.5)*4);g.stroke();}
      g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,y0,w,2);var cut=r()*w;g.fillRect(cut,y0,2,h/8);}});
  boards.wrapS=boards.wrapT=THREE.RepeatWrapping;boards.repeat.set(9,9);
  var floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0x8a7d74,map:boards,roughness:.62,metalness:0}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  /* Layered room silhouettes give the scene scale without distracting from the desk. */
  /* painted plaster: soft blotches and a fine tooth, never a flat colour */
  var plaster=texture(1024,512,function(g,w,h){var r=seeded(905);g.fillStyle='#8e9398';g.fillRect(0,0,w,h);
    for(var i=0;i<260;i++){var x=r()*w,y=r()*h,rad=20+r()*120,v=r()>.5?255:0,gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba('+v+','+v+','+v+','+(.012+r()*.02)+')');gr.addColorStop(1,'rgba('+v+','+v+','+v+',0)');g.fillStyle=gr;g.fillRect(x-rad,y-rad,rad*2,rad*2);}
    for(var j=0;j<24000;j++){var q=r()>.5?255:0;g.fillStyle='rgba('+q+','+q+','+q+','+(.02+r()*.03)+')';g.fillRect(r()*w,r()*h,1,1);}});
  var wall=mesh(new THREE.PlaneGeometry(9,4.7),new THREE.MeshStandardMaterial({color:0x3a3f44,map:plaster,roughness:.96}),0,2,-1.6);
  wall.receiveShadow=true;
  var ledge=mesh(new THREE.BoxGeometry(8,.065,.11),mDark,0,.68,-1.52);ledge.castShadow=false;
  var windowGlow=texture(512,720,function(g,w,h){var r=seeded(520);var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#151e28');gr.addColorStop(.55,'#293443');gr.addColorStop(1,'#0e141a');g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(var i=0;i<90;i++){var x=r()*w,y=h*.32+r()*h*.6,s=1+r()*3;g.fillStyle=r()>.3?'rgba(246,185,108,.18)':'rgba(154,184,221,.13)';g.fillRect(x,y,s,s*1.6);}
    var haze=g.createRadialGradient(w*.5,h*.45,10,w*.5,h*.45,w*.65);haze.addColorStop(0,'rgba(203,152,105,.11)');haze.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=haze;g.fillRect(0,0,w,h);
  });
  var windowPlane=mesh(new THREE.PlaneGeometry(1.22,1.72),new THREE.MeshBasicMaterial({map:windowGlow}),1.9,1.75,-1.53);windowPlane.castShadow=false;
  [[1.27,1.9,.027,1.86],[2.53,1.9,.027,1.86],[1.9,2.81,1.29,.035],[1.9,.99,1.29,.035],[1.9,1.9,1.29,.018]].forEach(function(b){var f=mesh(new THREE.BoxGeometry(b[2],b[3],.045),mDark,b[0],b[1],-1.49);f.castShadow=false;});

  /* pieces: everything that breaks apart records its home and a random flight */
  var pieces=[];
  function piece(obj,scale){obj.userData.home={p:obj.position.clone(),r:obj.rotation.clone()};
    var d=new THREE.Vector3(Math.random()-.5,Math.random()*.9+.2,Math.random()-.5).normalize().multiplyScalar((.25+Math.random()*.5)*(scale||1));
    obj.userData.fly={d:d,r:new THREE.Vector3((Math.random()-.5)*4,(Math.random()-.5)*4,(Math.random()-.5)*4),lag:Math.random(),ph:Math.random()*6.28};pieces.push(obj);return obj;}
  function outCubic(x){return 1-Math.pow(1-x,3);}
  function outBack(x){var c1=1.35,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);}  /* a little overshoot: weight settling */
  function mesh(g,m,x,y,z,parent){var o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;(parent||scene).add(o);return o;}
  function capsule(r,len){var pts=[],n=8,i,a;for(i=0;i<=n;i++){a=-Math.PI/2+i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,Math.cos(a)*r),Math.sin(a)*r+r));}
    for(i=0;i<=n;i++){a=i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,Math.cos(a)*r),len-r+Math.sin(a)*r));}return new THREE.LatheGeometry(pts,20);}

  /* brushed metal: fine streaks in the roughness, so highlights stretch along the grain */
  var brushed=texture(512,512,function(g,w,h){var r=seeded(1717);g.fillStyle='#6a6a6a';g.fillRect(0,0,w,h);
    for(var i=0;i<2600;i++){var y=r()*h,v=Math.floor(80+r()*110);g.fillStyle='rgba('+v+','+v+','+v+','+(.15+r()*.35)+')';g.fillRect(0,y,w,.6+r()*1.2);}});
  brushed.encoding=THREE.LinearEncoding;brushed.wrapS=brushed.wrapT=THREE.RepeatWrapping;
  var smudge=texture(512,256,function(g,w,h){var r=seeded(88);g.fillStyle='#101010';g.fillRect(0,0,w,h);
    for(var i=0;i<34;i++){var x=r()*w,y=r()*h,rad=6+r()*22;for(var k=0;k<5;k++){g.strokeStyle='rgba(120,120,120,'+(.06+r()*.08)+')';g.lineWidth=1;g.beginPath();g.ellipse(x,y,Math.max(1,rad-k*2.2),Math.max(1,rad*.8-k*1.8),r()*3,0,6.28);g.stroke();}}
    for(var j=0;j<8;j++){var sx=r()*w,sy=r()*h,gr=g.createRadialGradient(sx,sy,0,sx,sy,60);gr.addColorStop(0,'rgba(90,90,90,.35)');gr.addColorStop(1,'rgba(90,90,90,0)');g.fillStyle=gr;g.fillRect(sx-60,sy-60,120,120);}});
  smudge.encoding=THREE.LinearEncoding;

  /* desk */
  var desk=new THREE.Group();scene.add(desk);
  piece(mesh(new THREE.BoxGeometry(1.86,.045,.86),mWood,0,.74,-.08,desk));
  piece(mesh(new THREE.BoxGeometry(1.87,.012,.87),mDark,0,.708,-.08,desk));
  [[-.86,-.44],[.86,-.44],[-.86,.28],[.86,.28]].forEach(function(c){piece(mesh(new THREE.BoxGeometry(.035,.72,.035),mDark,c[0],.37,c[1],desk));});
  /* monitor */
  piece(mesh(new THREE.BoxGeometry(1.46,.55,.035),mBezel,0,1.205,-.36,desk));
  piece(mesh(new THREE.BoxGeometry(1.4,.49,.004),new THREE.MeshPhysicalMaterial({clearcoatRoughnessMap:smudge,color:0x080c10,roughness:.12,metalness:.1,clearcoat:1,clearcoatRoughness:1,emissive:0x1b2b38,emissiveIntensity:.12}),0,1.205,-.335,desk));
  piece(mesh(new THREE.CylinderGeometry(.006,.006,.003,12),mMid,0,.938,-.33,desk));
  piece(mesh(new THREE.BoxGeometry(.06,.34,.035),mDark,0,.93,-.4,desk));
  piece(mesh(new THREE.BoxGeometry(.32,.012,.2),mDark,0,.763,-.38,desk));
  /* keyboard and mouse */
  var kb=piece(mesh(new THREE.BoxGeometry(.48,.018,.16),mBezel,-.06,.776,.12,desk));
  var keys=new THREE.InstancedMesh(new THREE.BoxGeometry(.024,.008,.024),mKey,60),km=new THREE.Matrix4(),kc=0;
  for(var ky=0;ky<4;ky++)for(var kx=0;kx<15;kx++){km.makeTranslation(-.2+kx*.029,.013,-.045+ky*.03);keys.setMatrixAt(kc++,km);}
  keys.castShadow=true;kb.add(keys);
  var mouse=piece(mesh(new THREE.SphereGeometry(.03,20,14),mMid,.31,.775,.15,desk));mouse.scale.set(1.1,.55,1.7);mouse.userData.home.p=mouse.position.clone();
  /* Small everyday objects and a practical lamp make the desk feel occupied. */
  var notebook=piece(mesh(new THREE.BoxGeometry(.20,.012,.29),new THREE.MeshStandardMaterial({color:0xb7ae99,roughness:.96}),-.63,.773,.09,desk));notebook.rotation.y=-.12;notebook.userData.home.r=notebook.rotation.clone();
  var pen=piece(mesh(new THREE.CylinderGeometry(.004,.004,.22,10),mBezel,-.58,.788,.09,desk));pen.rotation.z=Math.PI/2;pen.rotation.y=.17;pen.userData.home.r=pen.rotation.clone();
  var mug=piece(mesh(new THREE.CylinderGeometry(.055,.048,.105,24,1,true),new THREE.MeshStandardMaterial({color:0x82786c,side:THREE.DoubleSide,roughness:.36,metalness:.12}),.65,.825,.10,desk));
  piece(mesh(new THREE.CylinderGeometry(.045,.045,.003,24),mDark,.65,.783,.10,desk));
  var cupHandle=piece(mesh(new THREE.TorusGeometry(.035,.006,8,24,Math.PI*1.45),mMid,.71,.826,.10,desk));cupHandle.rotation.y=Math.PI/2;cupHandle.userData.home.r=cupHandle.rotation.clone();
  piece(mesh(new THREE.CylinderGeometry(.072,.082,.012,20),mBezel,.69,.775,-.39,desk));
  piece(mesh(new THREE.CylinderGeometry(.013,.013,.37,12),mDark,.69,.96,-.39,desk));
  /* a dome shade: lathed profile with a rolled lip; the inside glows warm, the outside is dark satin metal */
  var domeP=[];for(var di=0;di<=14;di++){var da=di/14*Math.PI*.5;domeP.push(new THREE.Vector2(.012+Math.sin(da)*.118,.07-(1-Math.cos(da))*.1));}
  domeP.push(new THREE.Vector2(.134,-.034),new THREE.Vector2(.136,-.028));
  var domeG=new THREE.LatheGeometry(domeP,40);
  var mShadeOut=new THREE.MeshStandardMaterial({color:0x1b1d20,roughness:.75,roughnessMap:brushed,metalness:.8,side:THREE.BackSide});
  var mShadeIn=new THREE.MeshStandardMaterial({color:0xf4dcc0,emissive:0xffc88a,emissiveIntensity:.9,roughness:.6,side:THREE.FrontSide});
  var shade=piece(mesh(domeG,mShadeOut,.69,1.17,-.39,desk));shade.rotation.z=.18;shade.userData.home.r=shade.rotation.clone();
  var shadeIn=new THREE.Mesh(domeG,mShadeIn);shadeIn.scale.setScalar(.985);shade.add(shadeIn);
  var bulb=piece(mesh(new THREE.SphereGeometry(.03,16,10),new THREE.MeshBasicMaterial({color:0xffe2bd}),.683,1.13,-.39,desk));

  /* a shelf of books on the back wall, out of focus behind the desk */
  var shelf=mesh(new THREE.BoxGeometry(1.1,.025,.2),mWood,-1.25,1.62,-1.49);shelf.castShadow=false;
  var bookCols=[0x5a3b2e,0x2f3a44,0x7b6a55,0x3d4a3a,0x8a5a3c,0x24282c,0x6b5f4f,0x49392f,0x9a8b72,0x39414a,0x5c4636,0x2d3431];
  for(var bi=0,bx=-1.76;bx<-.78;bi++){var bw=.022+((bi*37)%11)*.004,bh=.17+((bi*53)%7)*.017,bd=.13+((bi*29)%5)*.01;
    var bk=mesh(new THREE.BoxGeometry(bw,bh,bd),new THREE.MeshStandardMaterial({color:bookCols[bi%bookCols.length],roughness:.85}),bx+bw/2,1.633+bh/2,-1.49+(.2-bd)/2-.02);
    if(bi%9===5){bk.rotation.z=-.22;bk.position.x+=.03;bk.position.y-=.012;bx+=.03;}bk.castShadow=false;bx+=bw+.002;}
  /* the monitor's cable, dropping behind the desk */
  var cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.95,-.42),new THREE.Vector3(.02,.8,-.47),new THREE.Vector3(.1,.77,-.5),new THREE.Vector3(.25,.4,-.52),new THREE.Vector3(.3,.02,-.62)]),40,.0045,6,false),mDark);
  scene.add(cable);piece(cable,.4);

  /* chair */
  var chair=new THREE.Group();chair.position.set(0,0,.68);scene.add(chair);
  function cushion(w,h,r,depth,bevel){var sh=new THREE.Shape(),x=-w/2,y=-h/2;
    sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);
    var g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:5,curveSegments:10});g.center();return g;}
  /* leather: a pebbled grain as a normal map, a low sheen, a little wear at the edges */
  function heightToNormal(size,height,strength){var c=document.createElement('canvas');c.width=c.height=size;var g=c.getContext('2d'),img=g.createImageData(size,size),d=img.data;
    for(var y=0;y<size;y++)for(var x=0;x<size;x++){var h=function(xx,yy){return height[((yy+size)%size)*size+((xx+size)%size)];};
      var dx=(h(x+1,y)-h(x-1,y))*strength,dy=(h(x,y+1)-h(x,y-1))*strength,l=Math.sqrt(dx*dx+dy*dy+1),i=(y*size+x)*4;
      d[i]=(-dx/l*.5+.5)*255;d[i+1]=(-dy/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255;}
    g.putImageData(img,0,0);var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
  var LS=256,lh=new Float32Array(LS*LS),lr=seeded(4242);
  for(var li=0;li<700;li++){var cx0=lr()*LS,cy0=lr()*LS,rr=2+lr()*5;for(var yy=-8;yy<=8;yy++)for(var xx=-8;xx<=8;xx++){var q=Math.sqrt(xx*xx+yy*yy)/rr;if(q<1){var ix=((Math.floor(cx0)+xx)%LS+LS)%LS,iy=((Math.floor(cy0)+yy)%LS+LS)%LS;lh[iy*LS+ix]+=Math.cos(q*Math.PI/2)*.6;}}}
  var leatherN=heightToNormal(LS,lh,1.4);leatherN.repeat.set(5,5);
  var mSeat=new THREE.MeshPhysicalMaterial({color:0x141618,normalMap:leatherN,normalScale:new THREE.Vector2(.22,.22),roughness:.5,clearcoat:.22,clearcoatRoughness:.55,sheen:new THREE.Color(0x2a2c2f)});
  var mChrome=new THREE.MeshStandardMaterial({color:0x8d9299,roughness:.9,roughnessMap:brushed,metalness:1});
  var seat=piece(mesh(cushion(.46,.44,.09,.04,.022),mSeat,0,.475,0,chair));seat.rotation.x=-Math.PI/2;seat.userData.home.r=seat.rotation.clone();
  piece(mesh(new THREE.BoxGeometry(.3,.03,.28),mDark,0,.43,0,chair));
  var back=new THREE.Group();back.position.set(0,.5,.23);back.rotation.x=-.12;chair.add(back);
  piece(mesh(cushion(.42,.5,.1,.03,.02),mSeat,0,.33,0,back));
  piece(mesh(new THREE.BoxGeometry(.05,.3,.02),mDark,0,.05,.035,back));
  piece(mesh(new THREE.CylinderGeometry(.018,.018,.22,16),mChrome,0,.32,0,chair));
  piece(mesh(new THREE.CylinderGeometry(.03,.03,.14,16),mDark,0,.16,0,chair));
  for(var s=0;s<5;s++){var la5=s*1.2566,leg=mesh(new THREE.BoxGeometry(.034,.022,.27),mChrome,Math.sin(la5)*.135,.085,Math.cos(la5)*.135,chair);leg.rotation.set(-.12*Math.cos(0),la5,0);leg.rotation.order='YXZ';leg.rotation.x=.12;piece(leg,.6);
    piece(mesh(new THREE.CylinderGeometry(.02,.02,.02,12),mDark,Math.sin(la5)*.27,.045,Math.cos(la5)*.27,chair),.5);
    var cw=piece(mesh(new THREE.CylinderGeometry(.022,.022,.018,14),mDark,Math.sin(la5)*.27,.022,Math.cos(la5)*.27,chair),.5);cw.rotation.z=Math.PI/2;cw.userData.home.r=cw.rotation.clone();}

  /* Human silhouette: separate fabric, skin, hair and shoes catch different light. */
  var man=new THREE.Group();man.position.set(0,.53,.64);scene.add(man);
  function limb(parent,x,y,z,r,len,material){var j=new THREE.Group();j.position.set(x,y,z);parent.add(j);
    var m=mesh(capsule(r,len),material||mShirt,0,0,0,j);m.rotation.x=Math.PI;return j;}
  var pelvis=mesh(new THREE.SphereGeometry(.12,24,16),mPants,0,0,0,man);pelvis.scale.set(1.3,.72,.95);piece(pelvis,.7);
  var spine=new THREE.Group();spine.position.set(0,.04,0);man.add(spine);
  var torso=mesh(capsule(.13,.5),mShirt,0,0,0,spine);torso.scale.set(1.18,1,.78);piece(torso,.8);
  var neck=new THREE.Group();neck.position.set(0,.5,0);spine.add(neck);
  piece(mesh(capsule(.045,.12),mClay,0,-.02,0,neck),.6);
  var head=new THREE.Group();head.position.set(0,.13,0);neck.add(head);
  var skull=mesh(new THREE.SphereGeometry(.1,28,20),mClay,0,.085,0,head);skull.scale.set(.9,1.12,1);piece(skull,.9);
  var hair=piece(mesh(new THREE.SphereGeometry(.104,28,18,0,Math.PI*2,0,Math.PI*.56),mHair,0,.111,.006,head));hair.scale.set(.94,.99,1.04);
  [-1,1].forEach(function(sd){var ear=piece(mesh(new THREE.SphereGeometry(.017,12,10),mClay,sd*.091,.072,-.006,head));ear.scale.set(.56,1,.82);
    var eyebrow=piece(mesh(new THREE.BoxGeometry(.031,.004,.006),mHair,sd*.037,.105,-.088,head));eyebrow.rotation.z=-sd*.08;eyebrow.userData.home.r=eyebrow.rotation.clone();
    piece(mesh(new THREE.SphereGeometry(.004,8,8),mHair,sd*.036,.092,-.095,head));});
  piece(mesh(new THREE.SphereGeometry(.016,12,10),mClay,0,.067,-.098,head));
  var arm={},leg2={};
  [-1,1].forEach(function(sd){
    var sh=limb(spine,sd*.2,.43,0,.046,.28,mShirt);piece(sh.children[0],.7);
    var el=limb(sh,0,-.28,0,.04,.26,mShirt);piece(el.children[0],.7);
    var hand=mesh(new THREE.SphereGeometry(.042,16,12),mClay,0,-.28,0,el);hand.scale.set(.8,1,.55);piece(hand,.6);
    for(var fi=0;fi<4;fi++){var finger=piece(mesh(new THREE.SphereGeometry(.006,8,8),mClay,(fi-1.5)*.012,-.309,-.008,el));finger.scale.set(.8,2.6,1);finger.rotation.x=.3;finger.userData.home.r=finger.rotation.clone();}
    arm[sd]={sh:sh,el:el};
    var th=limb(man,sd*.1,0,0,.068,.44,mPants);piece(th.children[0],.7);
    var kn=limb(th,0,-.44,0,.054,.44,mPants);piece(kn.children[0],.7);
    var ft=mesh(new THREE.BoxGeometry(.09,.05,.2),mShoes,0,-.46,-.05,kn);piece(ft,.6);
    leg2[sd]={th:th,kn:kn};});

  /* ---------- a real person: Microsoft Rocketbox avatar (MIT licence), posed from its own skeleton ---------- */
  var real=null;
  (function(){
    if(!THREE.GLTFLoader)return;
    var ax={X:new THREE.Vector3(1,0,0),Y:new THREE.Vector3(0,1,0),Z:new THREE.Vector3(0,0,1)};
    var qa=new THREE.Quaternion(),pw=new THREE.Quaternion(),pwi=new THREE.Quaternion();
    /* rotate a bone about a WORLD axis through its own origin, whatever the rig's local axes are */
    function turn(b,axis,ang){if(!b||!ang)return;b.parent.getWorldQuaternion(pw);pwi.copy(pw).invert();
      qa.setFromAxisAngle(ax[axis],ang);var d=pwi.clone().multiply(qa).multiply(pw);b.quaternion.premultiply(d);b.updateMatrixWorld(true);}
    /* poses as ordered [bone, axis, degrees]; the figure faces -Z, its right hand is +X */
    var A=[["Spine", "X", -7], ["Spine1", "X", -5], ["Neck", "X", 6], ["Head", "X", 4], ["L Thigh", "X", 92], ["R Thigh", "X", 92], ["L Thigh", "Z", -4], ["R Thigh", "Z", 4], ["L Calf", "X", -94], ["R Calf", "X", -94], ["L UpperArm", "Z", 44], ["R UpperArm", "Z", -44], ["L UpperArm", "X", 28], ["R UpperArm", "X", 24], ["L UpperArm", "Y", -10], ["R UpperArm", "Y", 12], ["L Forearm", "X", 52], ["R Forearm", "X", 50], ["L Forearm", "Y", -18], ["R Forearm", "Y", 22], ["L Hand", "Z", -78], ["R Hand", "Z", 78], ["L Hand", "X", -8], ["R Hand", "X", -8]];
    var B=[["Spine", "X", 8], ["Spine1", "X", 5], ["Neck", "X", -2], ["Head", "X", -6], ["L Thigh", "X", 86], ["R Thigh", "X", 86], ["L Thigh", "Z", -6], ["R Thigh", "Z", 6], ["L Calf", "X", -78], ["R Calf", "X", -78], ["L UpperArm", "Z", 46], ["R UpperArm", "Z", -46], ["L UpperArm", "X", 12], ["R UpperArm", "X", 12], ["L UpperArm", "Y", -8], ["R UpperArm", "Y", 8], ["L Forearm", "X", 48], ["R Forearm", "X", 48], ["L Forearm", "Y", -26], ["R Forearm", "Y", 26], ["L Hand", "Z", -80], ["R Hand", "Z", 80], ["L Hand", "X", 4], ["R Hand", "X", 4]];
    function unpackImages(u8){
      var dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength),jl=dv.getUint32(12,true);
      var json=JSON.parse(new TextDecoder().decode(u8.subarray(20,20+jl))),rest=u8.subarray(20+jl);
      var binStart=20+jl+8,imgs=(json.images||[]).map(function(im){var bv=json.bufferViews[im.bufferView];
        return {bytes:u8.slice(binStart+(bv.byteOffset||0),binStart+(bv.byteOffset||0)+bv.byteLength),type:im.mimeType};});
      var tex=json.textures||[],byMat={};
      (json.materials||[]).forEach(function(m){var pb=m.pbrMetallicRoughness||{},e={};
        if(pb.baseColorTexture){e.map=tex[pb.baseColorTexture.index].source;delete pb.baseColorTexture;}
        if(m.normalTexture){e.normal=tex[m.normalTexture.index].source;delete m.normalTexture;}
        byMat[m.name]=e;});
      delete json.images;delete json.textures;delete json.samplers;
      var js=new TextEncoder().encode(JSON.stringify(json)),pad=(4-js.length%4)%4,jlen=js.length+pad;
      var out=new Uint8Array(12+8+jlen+rest.length),od=new DataView(out.buffer);
      od.setUint32(0,0x46546C67,true);od.setUint32(4,2,true);od.setUint32(8,out.length,true);
      od.setUint32(12,jlen,true);od.setUint32(16,0x4E4F534A,true);out.set(js,20);for(var q=0;q<pad;q++)out[20+js.length+q]=32;
      out.set(rest,20+jlen);return {glb:out.buffer,imgs:imgs,byMat:byMat};}
    function attachImages(g,split){if(!window.createImageBitmap)return;
      g.scene.traverse(function(o){if(!o.isMesh)return;var m=o.material,e=split.byMat[m.name];if(!e||!m.visible)return;
        [['map',e.map],['normalMap',e.normal]].forEach(function(pair){var src=split.imgs[pair[1]];if(!src)return;
          createImageBitmap(new Blob([src.bytes],{type:src.type})).then(function(bmp){
            var t=new THREE.Texture(bmp);t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;
            if(pair[0]==='map')t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.needsUpdate=true;
            m[pair[0]]=t;if(pair[0]==='map')m.color.setRGB(1,1,1);m.needsUpdate=true;});});});}
    /* the model ships next to the page as friday_person.glb; a single-file build can inline it as window.__PERSON */
    (function(go,fail){var gl=new THREE.GLTFLoader();
      if(window.__PERSON){var bin=atob(window.__PERSON),buf=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);
        /* inline build: the loader would decode embedded images through blob: URLs, which a strict
           content policy refuses (and then the whole model fails). So lift the images out of the GLB,
           decode them straight from bytes with createImageBitmap, and put them back on the materials. */
        var split=unpackImages(buf);gl.parse(split.glb,'',function(g){go(g);attachImages(g,split);},fail);}
      else gl.load('friday_person.glb',go,undefined,fail);
    })(function(g){
      var root=g.scene,bones={},rest=[],mats=[];
      root.traverse(function(o){
        if(o.isBone){var k=o.name.replace(/^Bip01[ _]?/,'').replace(/_/g,' ');bones[k]=o;rest.push([o,o.quaternion.clone()]);}
        if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;var m=o.material;
          /* the source rig is Phong; as PBR it came out 40% metallic, which reads as a plastic sheen */
          m.metalness=0;m.roughness=.74;m.envMapIntensity=.26;if(m.map)m.map.encoding=THREE.sRGBEncoding;
          /* the frizz shells break into hard shards without multisampling; the cropped hair painted on the head reads cleaner */
          if(/opacity/.test(m.name))m.visible=false;
          m.needsUpdate=true;mats.push(m);}});
      var holder=new THREE.Group();holder.add(root);scene.add(holder);
      root.updateMatrixWorld(true);
      /* face -Z: measure where the nose points and turn the whole figure to match */
      var h=new THREE.Vector3(),n=new THREE.Vector3();bones['Head'].getWorldPosition(h);(bones['MNose']||bones['Head']).getWorldPosition(n);
      var f=n.sub(h);f.y=0;if(f.lengthSq()>1e-8){f.normalize();root.rotation.y=Math.atan2(f.x,f.z)-Math.PI;}
      root.updateMatrixWorld(true);
      var lastK=-1;
      function apply(k,work,t){
        /* a still pose (or a hidden person) needs no work: only re-pose when something moves */
        if(!holder.visible||(work<=0&&k===lastK))return;lastK=work>0?-1:k;
        rest.forEach(function(r){r[0].quaternion.copy(r[1]);});root.updateMatrixWorld(true);
        var P={};A.forEach(function(e,i){var key=e[0]+e[1]+i;P[key]=[e[0],e[1],e[2]+(B[i][2]-e[2])*k];});
        Object.keys(P).forEach(function(key){var e=P[key];turn(bones[e[0]],e[1],e[2]*Math.PI/180);});
        if(work>0){var w=Math.sin(t*(2.5+work*5))*.5+.5,wk=work*(1-k);
          turn(bones['R UpperArm'],'Y',-.18*w*wk);turn(bones['R Forearm'],'X',.05*Math.sin(t*9)*wk);
          turn(bones['L Forearm'],'X',.04*Math.sin(t*11+1)*wk);turn(bones['Head'],'Y',Math.sin(t*(1.2+work*2.2))*.24*wk);}
      }
      apply(0,0,0);
      /* sit him in the chair: pelvis on the seat */
      var pv=new THREE.Vector3();bones['Pelvis'].getWorldPosition(pv);
      holder.position.set(-pv.x,.56-pv.y,.66-pv.z);
      /* he doesn't tumble with the furniture: he steps out of the frame while it breaks, and is back when it reforms */
      function fade(a){holder.visible=a>.01;mats.forEach(function(m){m.opacity=a;m.transparent=a<.999;m.depthWrite=a>.5;});}
      real={holder:holder,bones:bones,apply:apply,head:bones['Head'],fade:fade};
      man.visible=false;
    },function(){/* keep the drawn figure if the model can't load */});
  })();

  /* two poses: A leaning in to work, B leaning back and talking */
  var POSE={A:{spine:-.12,neck:.05,head:-.04,back:.05,
               sh:{'-1':[1.05,0,.12],'1':[.95,0,-.22]},el:{'-1':[.55,0,0],'1':[.6,0,0]},
               th:[1.52,0,.06],kn:[-1.55,0,0]},
            B:{spine:.34,neck:-.1,head:-.18,back:.38,
               sh:{'-1':[-.25,0,.16],'1':[-.25,0,-.16]},el:{'-1':[1.35,0,.12],'1':[1.35,0,-.12]},
               th:[1.3,0,.1],kn:[-.8,0,0]}};
  function pose(k,t,work){var A=POSE.A,B=POSE.B,L=function(a,b){return a+(b-a)*k;};
    spine.rotation.x=L(A.spine,B.spine);neck.rotation.x=L(A.neck,B.neck);head.rotation.x=L(A.head,B.head);back.rotation.x=L(A.back,B.back);
    [-1,1].forEach(function(sd){var s1=A.sh[sd],s2=B.sh[sd],e1=A.el[sd],e2=B.el[sd];
      arm[sd].sh.rotation.set(L(s1[0],s2[0]),0,L(s1[2],s2[2]));arm[sd].el.rotation.set(L(e1[0],e2[0]),0,L(e1[2],e2[2]));
      leg2[sd].th.rotation.set(L(A.th[0],B.th[0]),0,sd*L(A.th[2],B.th[2]));leg2[sd].kn.rotation.set(L(A.kn[0],B.kn[0]),0,0);});
    /* busy hands: the right hand shuttles between keyboard and mouse, faster as the pain builds */
    if(work>0){var w=Math.sin(t*(2.5+work*5))*.5+.5;arm[1].sh.rotation.z+=(-.22*w)*work*(1-k);arm[1].el.rotation.x+=.06*Math.sin(t*9)*work*(1-k);
      arm[-1].el.rotation.x+=.05*Math.sin(t*11+1)*work*(1-k);head.rotation.y=Math.sin(t*(1.2+work*2.2))*.28*work*(1-k);}
    else head.rotation.y=0;}

  /* ---------- the four windows: generic chat screens, drawn on canvases ---------- */
  var NAMES=['ChatGPT','Claude','Gemini','Grok'];
  function panelTex(name,seed){var c=document.createElement('canvas');c.width=512;c.height=640;var g=c.getContext('2d');
    g.fillStyle='#141519';g.fillRect(0,0,512,640);
    g.fillStyle='#1b1c21';g.fillRect(0,0,512,54);
    g.fillStyle='#3a3c43';[0,1,2].forEach(function(i){g.beginPath();g.arc(24+i*18,27,5,0,7);g.fill();});
    g.fillStyle='#d9dade';g.font='300 26px "Hanken Grotesk",Arial,sans-serif';g.textAlign='center';g.fillText(name,256,36);
    var y=92,r=seed;function rnd(){r=(r*9301+49297)%233280;return r/233280;}
    for(var i=0;i<5;i++){var me=i%2===0,w=150+rnd()*210,h=26+Math.floor(rnd()*3)*20;
      g.fillStyle=me?'#2a2c33':'#1f2026';var x=me?512-28-w:28;g.fillRect(x,y,w,h);
      g.fillStyle=me?'#4a4d56':'#3a3c44';for(var l=0;l<h/20;l++)g.fillRect(x+14,y+12+l*20,w*(.5+rnd()*.4),5);y+=h+22;}
    g.strokeStyle='#34363d';g.lineWidth=2;g.strokeRect(28,560,456,52);
    g.fillStyle='#6b6e77';g.font='300 28px Arial';g.textAlign='left';g.fillText('+',44,596);
    g.fillStyle='#4a4d56';g.fillRect(84,582,200,5);
    g.strokeStyle='#6b6e77';g.beginPath();g.arc(456,586,12,0,7);g.stroke();
    var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
  var PW=.33,PH=.41,SNX=7,SNY=8;
  var SH_V=['attribute vec3 aCtr;attribute vec4 aRnd;uniform float uBreak;varying vec2 vUv;varying float vB;',
    'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
    'void main(){vUv=uv;float b=uBreak*(0.55+0.45*aRnd.w);vB=b;vec3 p=position-aCtr;',
    'p.xy=rot((aRnd.x-0.5)*7.0*b)*p.xy;p.xz=rot((aRnd.y-0.5)*5.0*b)*p.xz;p*=1.0-0.4*b;',
    'vec3 dir=normalize(vec3(aCtr.x*4.0+(aRnd.x-0.5)*1.6,aCtr.y*3.0+(aRnd.z-0.3)*1.4,0.7+aRnd.y*1.3));',
    'vec3 c=aCtr+dir*b*(0.25+0.7*aRnd.z);',
    'gl_Position=projectionMatrix*modelViewMatrix*vec4(c+p,1.0);}'].join('\n');
  var SH_F=['uniform sampler2D map;uniform float uGlow;uniform float uAlpha;varying vec2 vUv;varying float vB;',
    'void main(){vec4 t=texture2D(map,vUv);vec3 c=t.rgb*(1.18+uGlow*1.1)+vec3(0.9,0.92,0.96)*vB*0.18;gl_FragColor=vec4(c,uAlpha);}'].join('\n');
  function shardGeo(){var pos=[],uv=[],ctr=[],rnd=[],idx=[],v=0;
    for(var j=0;j<SNY;j++)for(var i=0;i<SNX;i++){
      var x0=-PW/2+i*PW/SNX,x1=x0+PW/SNX,y0=-PH/2+j*PH/SNY,y1=y0+PH/SNY,cx=(x0+x1)/2,cy=(y0+y1)/2,r=[Math.random(),Math.random(),Math.random(),Math.random()];
      [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].forEach(function(q){pos.push(q[0],q[1],0);uv.push((q[0]+PW/2)/PW,(q[1]+PH/2)/PH);ctr.push(cx,cy,0);rnd.push(r[0],r[1],r[2],r[3]);});
      idx.push(v,v+1,v+2,v,v+2,v+3);v+=4;}
    var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setAttribute('aCtr',new THREE.Float32BufferAttribute(ctr,3));g.setAttribute('aRnd',new THREE.Float32BufferAttribute(rnd,4));g.setIndex(idx);return g;}
  var cards=[];
  NAMES.forEach(function(n,i){
    var mat=new THREE.ShaderMaterial({uniforms:{map:{value:panelTex(n,17+i*31)},uBreak:{value:0},uGlow:{value:0},uAlpha:{value:1}},vertexShader:SH_V,fragmentShader:SH_F,transparent:true,side:THREE.DoubleSide});
    var m=new THREE.Mesh(shardGeo(),mat);m.frustumCulled=false;m.renderOrder=1;
    var home=new THREE.Vector3(-.51+i*.34,1.2,-.331);m.position.copy(home);scene.add(m);
    cards.push({m:m,home:home});});

  /* ---------- Friday: a small obsidian core that the windows connect to ---------- */
  var CORE=new THREE.Vector3(0,1.95,-.2);
  var coreMat=new THREE.ShaderMaterial({uniforms:{uA:{value:0},uT:{value:0}},transparent:true,depthWrite:false,
    vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float uA;uniform float uT;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-abs(dot(normalize(vN),normalize(vV))),2.5);vec3 c=vec3(0.02,0.021,0.025)+vec3(0.85,0.87,0.92)*f*(0.8+0.2*sin(uT*1.4));gl_FragColor=vec4(c,uA*(0.85+0.15*f));}'});
  var core=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,4),coreMat);core.position.copy(CORE);scene.add(core);
  var ring=new THREE.Mesh(new THREE.TorusGeometry(.27,.0022,6,120),new THREE.MeshBasicMaterial({color:0xdfe2e8,transparent:true,opacity:0}));ring.position.copy(CORE);scene.add(ring);
  var SLOTS=[new THREE.Vector3(-.74,1.62,-.05),new THREE.Vector3(-.28,1.3,.05),new THREE.Vector3(.32,1.3,.05),new THREE.Vector3(.8,1.62,-.05)];
  var wires=SLOTS.map(function(){var g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
    var l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xdfe2e8,transparent:true,opacity:0}));scene.add(l);return l;});
  var sparks=SLOTS.map(function(){var s=new THREE.Mesh(new THREE.SphereGeometry(.012,10,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}));scene.add(s);return s;});

  /* ---------- the Friday layer: glass over the four windows, with what she is doing ---------- */
  var LC=document.createElement('canvas');LC.width=1400;LC.height=440;var lg=LC.getContext('2d');
  var layerTex=new THREE.CanvasTexture(LC);layerTex.encoding=THREE.sRGBEncoding;
  var layerMat=new THREE.ShaderMaterial({uniforms:{map:{value:layerTex},uA:{value:0},uT:{value:0}},transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:['uniform sampler2D map;uniform float uA;uniform float uT;varying vec2 vUv;',
      'void main(){vec4 t=texture2D(map,vUv);',
      'float sheen=smoothstep(0.0,0.35,vUv.y)*(1.0-smoothstep(0.35,1.0,vUv.y))*0.05;',
      'float sx=(vUv.x-fract(uT*0.07)*1.6+0.3)*6.0;float sweep=exp(-sx*sx)*0.05;',
      'float edge=max(1.0-smoothstep(0.0,0.006,vUv.y),1.0-smoothstep(0.994,1.0,vUv.y));edge=max(edge,max(1.0-smoothstep(0.0,0.003,vUv.x),1.0-smoothstep(0.997,1.0,vUv.x)));',
      'vec3 c=mix(vec3(0.07,0.075,0.085)+vec3(sheen+sweep),t.rgb,t.a)+vec3(0.8)*edge*0.5;',
      'float a=(0.62+t.a*0.38+edge*0.3)*uA;gl_FragColor=vec4(c,a);}'].join('\n')});
  var layer=new THREE.Mesh(new THREE.PlaneGeometry(1.38,.46),layerMat);layer.position.set(0,1.2,-.326);layer.renderOrder=5;scene.add(layer);

  var LTXT={code:['def total(items):','    return sum(i.price for i in items)','','# say "confirm" to run it in the sandbox'],
            mask:['Ring Dr Anita Rao on 98765 43210','Ring Dr [[PERSON_1]] on [[PHONE_1]]']};
  var lastBeat='',lastDraw=0;
  function drawLayer(beat,t,k){
    lg.clearRect(0,0,1400,440);
    lg.fillStyle='rgba(236,235,231,.9)';lg.font='400 20px "Hanken Grotesk",Arial,sans-serif';lg.textAlign='left';
    lg.save();lg.translate(40,52);spaced('FRIDAY',8);lg.restore();
    var label={overlay:'SPEAKING',listen:'LISTENING',code:'CODE',council:'ASKING YOUR MODELS',mask:'MASKING',held:'WITHHELD'}[beat]||'LISTENING';
    lg.fillStyle='rgba(236,235,231,.55)';lg.font='400 16px "Hanken Grotesk",Arial,sans-serif';lg.save();lg.translate(1360-measureSpaced(label,5),52);spaced(label,5);lg.restore();
    lg.fillStyle='rgba(236,235,231,.12)';lg.fillRect(40,74,1320,1);
    if(beat==='listen'){ /* a voice waveform and the words appearing */
      lg.strokeStyle='rgba(236,235,231,.85)';lg.lineWidth=2;lg.beginPath();
      for(var x=0;x<=600;x+=4){var a=Math.sin(x*.045+t*6)*Math.sin(x*.011+t*1.7)*(22+18*Math.sin(t*2.3))*Math.sin(x/600*Math.PI);lg.lineTo(400+x,200+a);}lg.stroke();
      var said='"Compare these two offers and draft a reply to Anita."';lg.fillStyle='rgba(236,235,231,.9)';lg.font='300 30px "Hanken Grotesk",Arial,sans-serif';lg.textAlign='center';
      lg.fillText(said.slice(0,Math.floor(((t*14)%(said.length+30)))),700,330);
    } else if(beat==='code'){
      lg.font='400 30px "JetBrains Mono",Consolas,monospace';lg.textAlign='left';var n=Math.floor(k*120),y=150;
      LTXT.code.forEach(function(ln,i){var sh=ln.slice(0,Math.max(0,Math.min(ln.length,n)));n-=ln.length;lg.fillStyle=i===3?'rgba(201,185,154,.9)':'rgba(236,235,231,.92)';lg.fillText(sh,90,y);y+=56;});
    } else if(beat==='council'){
      ['Claude','ChatGPT','Gemini'].forEach(function(nm,i){var on=k>(.15+i*.18);lg.strokeStyle=on?'rgba(236,235,231,.8)':'rgba(236,235,231,.2)';lg.strokeRect(120+i*400,140,340,90);
        lg.fillStyle=on?'rgba(236,235,231,.95)':'rgba(236,235,231,.35)';lg.font='300 30px "Hanken Grotesk",Arial,sans-serif';lg.textAlign='left';lg.fillText(nm,146+i*400,196);
        lg.textAlign='right';lg.font='400 18px "JetBrains Mono",Consolas,monospace';lg.fillText(on?'answered':'...',430+i*400,196);});
      lg.textAlign='center';lg.fillStyle='rgba(169,194,179,'+(k>.72?.95:0)+')';lg.font='400 22px "JetBrains Mono",Consolas,monospace';
      lg.fillText('council of 3 → synthesized by claude (cloud)',700,330);
    } else if(beat==='mask'){
      var p=Math.max(0,Math.min(1,(k-.2)/.5));lg.textAlign='center';lg.font='400 34px "JetBrains Mono",Consolas,monospace';
      lg.fillStyle='rgba(236,235,231,.9)';lg.fillText(LTXT.mask[0],700,170);
      lg.fillStyle='rgba(201,185,154,.95)';lg.fillText(scr(LTXT.mask[0],LTXT.mask[1],p),700,280);
      lg.font='400 16px "Hanken Grotesk",Arial,sans-serif';lg.fillStyle='rgba(236,235,231,.5)';lg.fillText('YOU SAID',700,122);lg.fillText('WHAT LEAVES',700,232);
    } else if(beat==='overlay'){
      var turns=[["Open Chrome.","Opening it now."],["Is 97 a prime number?","Yes, 97 is prime."],["Take a screenshot.","I've taken a screenshot."]],ti=Math.floor(k/4)%3,tk=(k%4)/4;
      lg.textAlign='left';lg.font='300 30px "Hanken Grotesk",Arial,sans-serif';lg.fillStyle='rgba(205,216,240,.9)';
      var yu='you:  '+turns[ti][0];lg.fillText(yu.slice(0,Math.floor(Math.min(1,tk*2.2)*yu.length)),120,190);
      if(tk>.5){lg.fillStyle='rgba(255,255,255,.95)';lg.font='400 36px "Hanken Grotesk",Arial,sans-serif';lg.fillText(turns[ti][1],120,270);}
    } else if(beat==='held'){
      lg.textAlign='center';lg.font='400 32px "JetBrains Mono",Consolas,monospace';lg.fillStyle='rgba(236,235,231,.9)';lg.fillText('my aadhaar is 2345 6789 0123',700,170);
      lg.fillStyle='rgba(201,160,160,'+Math.min(1,k*2)+')';lg.fillText('local, withheld: an AADHAAR was present',700,280);
    }
    layerTex.needsUpdate=true;
    function spaced(s,sp){var x=0;for(var i=0;i<s.length;i++){lg.fillText(s[i],x,0);x+=lg.measureText(s[i]).width+sp;}}
    function measureSpaced(s,sp){var w=0;for(var i=0;i<s.length;i++)w+=lg.measureText(s[i]).width+sp;return w;}
  }

  /* voice: thin rings travel from the person to the layer */
  var rings=[0,1,2].map(function(){var r=new THREE.Mesh(new THREE.TorusGeometry(.07,.0016,6,64),new THREE.MeshBasicMaterial({color:0xdfe2e8,transparent:true,opacity:0,depthWrite:false}));scene.add(r);return r;});
  var headWorld=new THREE.Vector3();
  /* the context you carry by hand: a small chip that hops from window to window */
  var chip=new THREE.Mesh(new THREE.PlaneGeometry(.07,.028),new THREE.MeshBasicMaterial({color:0xf2f3f6,transparent:true,opacity:0,depthWrite:false}));scene.add(chip);


  /* ---------- an overhead practical and its visible shaft ---------- */
  var over=new THREE.SpotLight(0xfff1dc,1.1,6,.42,.75,1.6);over.position.set(0,3.4,-.05);over.target.position.set(0,.74,-.05);scene.add(over);scene.add(over.target);
  var beamMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
    uniforms:{uT:{value:0},uA:{value:1},uCam:{value:1}},
    vertexShader:'varying vec3 vN;varying vec3 vW;varying vec3 vV;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:['uniform float uT,uA,uCam;varying vec3 vN;varying vec3 vW;varying vec3 vV;',
      'float n3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}',
      'float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(n3(i),n3(i+vec3(1,0,0)),f.x),mix(n3(i+vec3(0,1,0)),n3(i+vec3(1,1,0)),f.x),f.y),mix(mix(n3(i+vec3(0,0,1)),n3(i+vec3(1,0,1)),f.x),mix(n3(i+vec3(0,1,1)),n3(i+vec3(1,1,1)),f.x),f.y),f.z);}',
      'void main(){float edge=pow(abs(dot(normalize(vN),vV)),2.2);',
      'float h=clamp((vW.y-.74)/2.7,0.0,1.0);float fall=smoothstep(0.0,.12,h)*(1.0-smoothstep(.75,1.0,h))*mix(1.0,.45,h);',
      'float drift=.65+.35*vn(vW*3.0+vec3(0.0,-uT*.08,uT*.05));',
      'gl_FragColor=vec4(vec3(1.0,.93,.82)*edge*fall*drift*.17*uA*uCam,1.0);}'].join('\n')});
  var beam=new THREE.Mesh(new THREE.CylinderGeometry(.07,.95,2.66,48,1,true),beamMat);beam.position.set(0,2.07,-.05);beam.renderOrder=5;scene.add(beam);

  /* ---------- dust in the lamp and screen light: what makes a room look filmed rather than rendered ---------- */
  var dustTex=texture(64,64,function(g,w,h){var gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,240,220,1)');gr.addColorStop(.35,'rgba(255,230,200,.5)');gr.addColorStop(1,'rgba(255,220,190,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  var dustN=lite?90:220,dg=new THREE.BufferGeometry(),dpos=new Float32Array(dustN*3),dustV=[],dr=seeded(77);
  for(var dn=0;dn<dustN;dn++){dpos[dn*3]=-.75+dr()*1.5;dpos[dn*3+1]=.8+dr()*2.2;dpos[dn*3+2]=-.7+dr()*1.2;dustV.push([(dr()-.5)*.006,(dr()-.45)*.008,(dr()-.5)*.005]);}
  dg.setAttribute('position',new THREE.BufferAttribute(dpos,3));
  /* each mote is drawn as a lens would: sharp specks near the focus, soft wide discs in front of and behind it,
     bright inside the overhead shaft, faint outside it */
  var dustMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{map:{value:dustTex},uFocus:{value:2.6},uPx:{value:800},uCoc:{value:30},uA:{value:.35},uT:{value:0}},
    vertexShader:['uniform float uFocus,uPx,uCoc,uA,uT;varying float vA;attribute float seed;',
      'void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(.05,-mv.z);gl_Position=projectionMatrix*mv;',
      'float base=max(1.2,.011*uPx/d);float coc=abs(d-uFocus)/d*uCoc;float sz=base+coc;gl_PointSize=min(sz,90.0);',
      'float r=length(position.xz-vec2(0.0,-.05));float cone=.07+(.95-.07)*clamp((3.4-position.y)/2.66,0.0,1.0);float inBeam=1.0-smoothstep(cone*.55,cone*1.05,r);',
      'float tw=.75+.25*sin(uT*1.7+seed*40.0);vA=uA*tw*(.2+.8*inBeam)*clamp((base*base)/(sz*sz)*1.6,.03,1.0);}'].join('\n'),
    fragmentShader:'uniform sampler2D map;varying float vA;void main(){vec4 c=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vec3(1.0,.89,.77)*c.a*vA,1.0);}'});
  var seeds=new Float32Array(dustN);for(var sdn=0;sdn<dustN;sdn++)seeds[sdn]=dr();dg.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
  var dust=new THREE.Points(dg,dustMat);
  dust.frustumCulled=false;scene.add(dust);

  /* ---------- total 3D: props the details chapters act out in the same room ---------- */
  var RC=new THREE.Vector3(0,0,.1),RR=1.45;              /* "your PC": a boundary drawn round the desk */
  var bound=new THREE.Group();scene.add(bound);
  var ringPts=[];for(var ri=0;ri<=160;ri++){var ra=ri/160*Math.PI*2;ringPts.push(new THREE.Vector3(RC.x+Math.cos(ra)*RR,.012,RC.z+Math.sin(ra)*RR));}
  var ringLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts),new THREE.LineDashedMaterial({color:0xa9c2b3,dashSize:.06,gapSize:.05,transparent:true,opacity:0,depthWrite:false}));
  ringLine.computeLineDistances();bound.add(ringLine);
  var wallFade=texture(8,256,function(g,w,h){var gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,'#fff');gr.addColorStop(.55,'rgba(255,255,255,.25)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  var barrierMat=new THREE.MeshBasicMaterial({color:0xc9a0a0,alphaMap:wallFade,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
  wallFade.encoding=THREE.LinearEncoding;
  var barrier=new THREE.Mesh(new THREE.CylinderGeometry(RR,RR,1.9,96,1,true),barrierMat);barrier.position.set(RC.x,.95,RC.z);bound.add(barrier);
  function labelTex(lines,w,h){return texture(w,h,function(g){g.clearRect(0,0,w,h);g.textAlign='center';
    lines.forEach(function(l){g.font=l[1];g.fillStyle=l[2];var x=w/2,s=l[0],sp=l[3]||0;
      if(sp){var tw=0,i;for(i=0;i<s.length;i++)tw+=g.measureText(s[i]).width+sp;x=w/2-tw/2;g.textAlign='left';for(i=0;i<s.length;i++){g.fillText(s[i],x,l[4]);x+=g.measureText(s[i]).width+sp;}g.textAlign='center';}
      else g.fillText(s,x,l[4]);});});}
  function labelPlane(tex,w,h){var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0,depthWrite:false}));scene.add(m);return m;}
  var pcLabel=labelPlane(labelTex([['YOUR PC','400 44px "Hanken Grotesk",Arial,sans-serif','#a9c2b3',14,70]],512,96),.62,.116);
  pcLabel.rotation.x=-Math.PI/2;pcLabel.position.set(-.55,.014,RC.z+RR+.14);
  var outLabel=labelPlane(labelTex([['TO YOUR MODEL','400 40px "Hanken Grotesk",Arial,sans-serif','#c9b99a',12,52],['names already swapped for placeholders','300 30px "Hanken Grotesk",Arial,sans-serif','rgba(236,235,231,.7)',0,100]],720,120),.9,.15);
  outLabel.position.set(1.9,2.6,-1.46);
  /* packets: what you ask, sorted three ways */
  var PK=[],pkGeo=new THREE.BoxGeometry(.05,.05,.05);
  var pkCol=[0xa9c2b3,0xc9b99a,0xc9a0a0];
  for(var pi=0;pi<21;pi++){var kind=pi%3,solid=new THREE.MeshBasicMaterial({color:kind===1?0xf1eee8:pkCol[kind],transparent:true,opacity:0,depthWrite:false});
    var mh=new THREE.Mesh(pkGeo,solid);mh.userData={kind:kind,off:pi/21,solid:solid,
      hollow:new THREE.MeshBasicMaterial({color:pkCol[1],wireframe:true,transparent:true,opacity:0,depthWrite:false}),
      jit:new THREE.Vector3((Math.random()-.5)*.9,(Math.random()-.5)*.25,0),ang:(kind===2?(Math.PI*.62+Math.random()*1.1):0)+(kind===0?Math.random()*6.28:0)};
    scene.add(mh);PK.push(mh);}
  var WIN=new THREE.Vector3(1.9,1.75,-1.53),SRC=new THREE.Vector3(0,1.2,-.3),tmpA=new THREE.Vector3(),tmpB=new THREE.Vector3();
  function bez(a,c,b,t,out){var u=1-t;return out.set(u*u*a.x+2*u*t*c.x+t*t*b.x,u*u*a.y+2*u*t*c.y+t*t*b.y,u*u*a.z+2*u*t*c.z+t*t*b.z);}
  /* a screen share: a frame round the monitor that "captures" the screen now and then */
  var capPts=[[-.76,.3],[.76,.3],[.76,-.3],[-.76,-.3],[-.76,.3]].map(function(q){return new THREE.Vector3(q[0],1.205+q[1],-.3);});
  var capFrame=new THREE.Line(new THREE.BufferGeometry().setFromPoints(capPts),new THREE.LineBasicMaterial({color:0xdfe2e8,transparent:true,opacity:0,depthWrite:false}));scene.add(capFrame);
  var capLabel=labelPlane(labelTex([['SCREEN SHARE','400 40px "Hanken Grotesk",Arial,sans-serif','#dfe2e8',12,50],['her layer is not in the picture','300 32px "Hanken Grotesk",Arial,sans-serif','rgba(236,235,231,.72)',0,100]],720,120),.72,.12);
  capLabel.position.set(0,1.6,-.3);
  var recDot=new THREE.Mesh(new THREE.CircleGeometry(.012,20),new THREE.MeshBasicMaterial({color:0xd06a5e,transparent:true,opacity:0,depthWrite:false}));recDot.position.set(-.72,1.47,-.29);scene.add(recDot);
  /* camera for the details chapters, keyed to d: -1 = end of the story, 0..4 = the five panels, 5 = the footer */
  var DCAM=[
    [-1,[1.6,1.8,2.6],[0,1.05,-.1]],
    [0, [-1.25,3.0,3.9],[.95,1.0,-.75]],
    [1, [.95,1.5,1.75],[.08,1.2,-.33]],
    [2, [2.05,1.28,1.05],[.15,1.02,-.35]],
    [3, [-1.0,2.25,2.3],[1.5,1.45,-1.5]],
    [4, [3.1,2.9,4.9],[0,.95,-.3]],
    [5, [3.6,3.4,5.8],[0,.9,-.3]]];
  function dcamAt(d){for(var i=0;i<DCAM.length-1;i++){if(d<=DCAM[i+1][0]||i===DCAM.length-2){var a=DCAM[i],b=DCAM[i+1],k=ss(a[0],b[0],d);
      cp.set(a[1][0]+(b[1][0]-a[1][0])*k,a[1][1]+(b[1][1]-a[1][1])*k,a[1][2]+(b[1][2]-a[1][2])*k);
      ct.set(a[2][0]+(b[2][0]-a[2][0])*k,a[2][1]+(b[2][1]-a[2][1])*k,a[2][2]+(b[2][2]-a[2][2])*k);return;}}}
  function near(x,c,w){return 1-ss(w*.45,w,Math.abs(x-c));}

  /* ---------- photographic finish: real interior light, contact shadows, bloom, lens falloff ---------- */
  /* Image-based light from a CC0 Poly Haven interior HDRI, so wood, metal, glass and skin pick up real reflections. */
  (function(){
    if(!THREE.EXRLoader||!window.__HDRI)return;
    try{
      var bin=atob(window.__HDRI),buf=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);
      var ld=new THREE.EXRLoader();ld.setDataType(THREE.HalfFloatType);
      var data=ld.parse(buf.buffer);
      var tex=new THREE.DataTexture(data.data,data.width,data.height,data.format,data.type);
      tex.encoding=THREE.LinearEncoding;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.flipY=false;tex.generateMipmaps=false;
      tex.mapping=THREE.EquirectangularReflectionMapping;tex.needsUpdate=true;
      var pm=new THREE.PMREMGenerator(renderer);var env=pm.fromEquirectangular(tex).texture;tex.dispose();
      scene.environment=env;
      /* metal, glass and lacquer reflect a studio: long softbox highlights that read as "real" at a glance */
      if(window.__HDRI2){var b2=atob(window.__HDRI2),u2=new Uint8Array(b2.length);for(var j=0;j<b2.length;j++)u2[j]=b2.charCodeAt(j);
        var d2=ld.parse(u2.buffer),t2=new THREE.DataTexture(d2.data,d2.width,d2.height,d2.format,d2.type);
        t2.encoding=THREE.LinearEncoding;t2.minFilter=t2.magFilter=THREE.LinearFilter;t2.flipY=false;t2.generateMipmaps=false;t2.mapping=THREE.EquirectangularReflectionMapping;t2.needsUpdate=true;
        var env2=pm.fromEquirectangular(t2).texture;t2.dispose();
        [[mChrome,.95],[mShadeOut,.9],[mBezel,.8],[mDark,.7],[mKey,.18],[mSeat,.12]].forEach(function(x){x[0].envMap=env2;x[0].envMapIntensity=x[1];x[0].needsUpdate=true;});
        scene.traverse(function(o){var m=o.material;if(m&&m.clearcoatRoughnessMap===smudge){m.envMap=env2;m.envMapIntensity=.9;m.needsUpdate=true;}});}
      pm.dispose();
      var I=[[mWood,.38],[mMid,.18],[mClay,.16],[mShirt,.1],[mPants,.08],[mShoes,.25],[mHair,.1]];
      I.forEach(function(x){x[0].envMapIntensity=x[1];x[0].needsUpdate=true;});
      scene.traverse(function(o){if(o.material&&o.material.isMeshStandardMaterial&&o.material.envMapIntensity===1)o.material.envMapIntensity=.18;});
    }catch(err){/* no environment: the direct lights still carry the scene */}
  })();

  var smaa=null,composer=null,sao=null,bloom=null,fxaa=null,dof=null,film=null,focusD=2.6,hq=/[?&]hq/.test(location.search);
  if(THREE.EffectComposer&&THREE.RenderPass&&THREE.ShaderPass&&THREE.CopyShader){
    try{
      composer=new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene,camera));
      /* ambient occlusion is the costliest pass for the least visible gain: only in ?hq */
      /* contact shadows where things meet: the thing that stops a render looking pasted together */
      if(THREE.SAOPass&&!lite){sao=new THREE.SAOPass(scene,camera,false,true);
        var P=sao.params;P.saoBias=.5;P.saoIntensity=.016;P.saoScale=2.2;P.saoKernelRadius=18;P.saoMinResolution=0;P.saoBlur=true;P.saoBlurRadius=5;P.saoBlurStdDev=4;P.saoBlurDepthCutoff=.01;
        composer.addPass(sao);}
      /* a real lens: shallow depth of field, focused on whatever the camera is looking at */
      if(THREE.BokehPass&&THREE.BokehShader&&!lite){dof=new THREE.BokehPass(scene,camera,{focus:2.6,aperture:.0065,maxblur:.011,width:W,height:H});
        dof.materialDepth.skinning=true;dof.needsSwap=true;composer.addPass(dof);
        /* the lens focuses on solid things only: glass, glows, labels and dust must not write depth, or they fog the whole frame */
        var dofRender=dof.render.bind(dof),hidden=[];
        dof.render=function(r,wb,rb,dt,mask){hidden.length=0;scene.traverse(function(o){var m=o.material;
            if(o.visible&&m&&!o.isSkinnedMesh&&(o.isPoints||o.isLine||m.transparent||m.isShaderMaterial||m.isMeshBasicMaterial)){o.visible=false;hidden.push(o);}});
          dofRender(r,wb,rb,dt,mask);for(var i=0;i<hidden.length;i++)hidden[i].visible=true;};}
      if(THREE.UnrealBloomPass&&!lite){bloom=new THREE.UnrealBloomPass(new THREE.Vector2(256,256),.5,.62,.7);composer.addPass(bloom);}
      /* anti-aliasing: SMAA where it can load its lookup tables, FXAA otherwise */
      if(THREE.FXAAShader){fxaa=new THREE.ShaderPass(THREE.FXAAShader);composer.addPass(fxaa);}
      if(THREE.SMAAPass&&THREE.SMAAEdgesShader&&!lite){try{smaa=new THREE.SMAAPass(W||window.innerWidth,H||window.innerHeight);composer.insertPass(smaa,composer.passes.indexOf(fxaa));if(fxaa)fxaa.enabled=false;
        var smFail=function(){smaa.enabled=false;if(fxaa)fxaa.enabled=true;};
        [smaa.areaTexture,smaa.searchTexture].forEach(function(tx){if(tx&&tx.image){tx.image.addEventListener('error',smFail);}});}catch(e){smaa=null;if(fxaa)fxaa.enabled=true;}}
      /* the film stock: a print-film grade (cool shadows, warm highlights, lifted blacks, a little less saturation),
         lens falloff and edge fringing, then moving grain. One full-screen pass. */
      film=new THREE.ShaderPass({uniforms:{uShock:{value:0},uShockA:{value:0},uFlash:{value:0},uAsp:{value:1},tDiffuse:{value:null},uT:{value:0},uRes:{value:new THREE.Vector2(1,1)},offset:{value:1.05},darkness:{value:1.55},grain:{value:.05},ca:{value:.0028}},
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:['uniform sampler2D tDiffuse;uniform float uT,offset,darkness,grain,ca,uShock,uShockA,uFlash,uAsp;uniform vec2 uRes;varying vec2 vUv;',
          'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
          'void main(){vec2 uv=vUv;vec2 sd=(uv-.5)*vec2(uAsp,1.0);float sr=length(sd);',
          'float ring=uShockA*smoothstep(.16,0.0,abs(sr-uShock*1.25));uv-=normalize(sd+1e-5)/vec2(uAsp,1.0)*ring*.045;',
          'vec2 d=uv-.5;float r2=dot(d,d);vec2 o=d*(ca+ring*.02)*r2*4.0+d*ring*.012;',
          'vec3 c=vec3(texture2D(tDiffuse,uv+o).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-o).b);c+=uFlash*vec3(1.0,.96,.9);',
          'float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,.88);',
          'c*=mix(vec3(.9,.99,1.07),vec3(1.07,1.0,.9),smoothstep(0.0,.3,l));c+=vec3(.0035,.005,.008);',
          'vec2 u=d*vec2(offset);c=mix(c,vec3(1.0-darkness),dot(u,u));',
          'vec4 s=LinearTosRGB(vec4(max(c,vec3(0.0)),1.0));',
          'float g=h(floor(vUv*uRes/1.5)+fract(uT*24.0)*vec2(113.0,71.0))-.5;s.rgb+=g*grain*(1.0-s.rgb*.7);',
          'gl_FragColor=s;}'].join('\n')});
      composer.addPass(film);
    }catch(err){composer=null;}
  }
  function resizePost(){if(!composer)return;var pr=renderer.getPixelRatio();composer.setPixelRatio?composer.setPixelRatio(pr):0;composer.setSize(W,H);
    if(fxaa)fxaa.uniforms.resolution.value.set(1/(W*pr),1/(H*pr));
    if(film)film.uniforms.uRes.value.set(W*pr,H*pr);if(dof){dof.uniforms.aspect.value=W/H;}}
  /* keep it smooth on modest laptops: shed the costly passes first, then resolution */
  var ft=16,lastT=0,frames=0,level=0;
  function adapt(now){if(hq||!lastT){lastT=now;return;}var d=Math.min(120,now-lastT);lastT=now;ft+=(d-ft)*.05;frames++;
    if(frames>40&&ft>21){frames=0;level++;
      /* shed in order of cost for what you'd notice */
      if(level===1&&sao)sao.enabled=false;
      else if(level===2){renderer.setPixelRatio(1);resizePost();}
      else if(level===3&&dof)dof.enabled=false;
      else if(level===4&&smaa){smaa.enabled=false;if(fxaa)fxaa.enabled=true;}
      else if(level===5&&bloom)bloom.enabled=false;
      else if(level===6){renderer.shadowMap.enabled=false;scene.traverse(function(o){if(o.material)o.material.needsUpdate=true;});}
      else if(level===7){renderer.setPixelRatio(.8);resizePost();}}}
  var ghosts=null;
  var sframe=0;renderer.shadowMap.autoUpdate=false;
  function render(now){adapt(now);if(film){film.uniforms.uT.value=now/1000;var shk=(curP-.345)/.07;film.uniforms.uAsp.value=W/H;
      film.uniforms.uShock.value=Math.max(0,Math.min(1,shk));film.uniforms.uShockA.value=shk>0&&shk<1?Math.sin(shk*Math.PI):0;
      film.uniforms.uFlash.value=shk>0&&shk<.35?Math.pow(1-shk/.35,2)*.55:0;}beamMat.uniforms.uT.value=now/1000;beamMat.uniforms.uA.value=(.75+.45*ss(.6,.68,curP)+Math.min(.35,spd*.15))*(1-.6*curHang);
    var cdx=camera.position.x,cdz=camera.position.z+.05;beamMat.uniforms.uCam.value=ss(.35,1.3,Math.sqrt(cdx*cdx+cdz*cdz));
    if(dof&&dof.enabled){var fd=camera.position.distanceTo(camT);focusD=focusD<0?fd:focusD+(fd-focusD)*ease(.14);dof.uniforms.focus.value=focusD;
      dof.uniforms.aperture.value=(W<820?.003:.0045)*(1-(curD>-1?.3:0))*(1+curHang*.6);}if(renderer.shadowMap.enabled&&(sframe++%2===0))renderer.shadowMap.needsUpdate=true;if(!ghosts)ghosts=[core,ring,chip,layer].concat(wires,sparks,rings);
    ghosts.forEach(function(o){var m=o.material,a=m.uniforms?(m.uniforms.uA?m.uniforms.uA.value:1):m.opacity;o.visible=a>.004;});
    cards.forEach(function(c){c.m.visible=c.m.material.uniforms.uAlpha.value>.004;});if(composer)composer.render();else renderer.render(scene,camera);}

  /* ---------- camera path: keyed to story progress ---------- */
  var CAM=[ // p, position, target
    [0,   [3.3,2.5,5.0],[0,1.0,-.2]],        /* out of the dark: the lit desk, far away */
    [.10, [1.35,1.55,1.75],[0,1.05,-.25]],   /* push in over his shoulder */
    [.22, [.55,1.32,1.12],[.08,1.16,-.32]],  /* close: the windows fill the frame */
    [.31, [-.95,1.02,1.35],[.1,1.22,-.3]],   /* low, the other side, looking up: it's getting on top of him */
    [.37, [2.3,3.2,4.3],[0,1.1,-.2]],        /* the break: crane up and back */
    [.43, [0,1.8,2.9],[0,1.72,-.15]],        /* face the core */
    [.50, [1.9,1.9,2.0],[0,1.74,-.15]],      /* slow orbit while the windows arrive */
    [.58, [-1.5,1.85,2.3],[0,1.62,-.1]],
    [.64, [1.7,1.75,2.5],[0,1.0,-.1]],       /* swing back down: the room is whole */
    [.68, [1.3,1.38,.18],[0,1.28,.52]],      /* his face, lit by the screen: he just talks */
    [.72, [1.25,1.45,1.6],[0,1.05,-.2]],
    [.76, [1.08,1.52,1.5],[.12,1.2,-.33]],
    [.97, [.98,1.5,1.4],[.12,1.2,-.33]],
    [1,   [1.6,1.8,2.6],[0,1.05,-.1]]];
  var cp=new THREE.Vector3(),ct=new THREE.Vector3(),camP=new THREE.Vector3(1.9,2.05,2.9),camT=new THREE.Vector3(0,1,-.1);
  function camAt(p){for(var i=0;i<CAM.length-1;i++){if(p<=CAM[i+1][0]||i===CAM.length-2){var a=CAM[i],b=CAM[i+1],k=ss(a[0],b[0],p);
      cp.set(a[1][0]+(b[1][0]-a[1][0])*k,a[1][1]+(b[1][1]-a[1][1])*k,a[1][2]+(b[1][2]-a[1][2])*k);
      ct.set(a[2][0]+(b[2][0]-a[2][0])*k,a[2][1]+(b[2][1]-a[2][1])*k,a[2][2]+(b[2][2]-a[2][2])*k);return;}}}

  var W=1,H=1;
  function resize(){W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.fov=W<820?52:38;camera.updateProjectionMatrix();resizePost();}
  window.addEventListener('resize',function(){resize();draw(performance.now());});resize();

  /* click the screen to open the coordination animation */
  var ray=new THREE.Raycaster(),nd=new THREE.Vector2(),curP=0;
  cv.style.pointerEvents='none';
  document.addEventListener('click',function(e){if(curP<.6||curP>.98||e.target.closest('a,button,input,.cap,#coord,.corner'))return;
    nd.set(e.clientX/W*2-1,-(e.clientY/H)*2+1);ray.setFromCamera(nd,camera);if(ray.intersectObject(layer).length)openCoord();});
  document.addEventListener('mousemove',function(e){if(curP<.6||curP>.98){document.body.style.cursor='';return;}
    nd.set(e.clientX/W*2-1,-(e.clientY/H)*2+1);ray.setFromCamera(nd,camera);document.body.style.cursor=(!e.target.closest('a,button,.cap')&&ray.intersectObject(layer).length)?'pointer':'';},{passive:true});

  var camV=new THREE.Vector3(),camTV=new THREE.Vector3(),tmpV=new THREE.Vector3(),rollS=0,rollV=0,pitchS=0,pitchV=0,lastTmx=0,svSigned=0,
    curHang=0,lastSY=window.scrollY,spd=0,curD=-1,fdt=16.7,lastNow=0,lastSP=0,capOn=false;function ease(k){return 1-Math.pow(1-k,fdt/16.7);}
  var sd=-1,sp=0,t0=performance.now(),looping=false,onscreen=true,firstFrame=false,ox=0,oy=0,snapNext=false;
  function draw(now){
    fdt=lastNow?Math.min(66,Math.max(4,now-lastNow)):16.7;lastNow=now;
    var target=storyP();
    if(reduce){var keys2=[0,.14,.22,.30,.37,.5,.67,.77,.84,.9,.95,.99],best=0;keys2.forEach(function(k){if(Math.abs(k-target)<Math.abs(best-target))best=k;});target=best;sp=target;}
    else sp+=(target-sp)*ease(lenis?.3:.16);   /* a little weight on the scroll, same at any frame rate */
    var p=sp,t=reduce?4:(now-t0)/1000;curP=p;
    updateDom(target);
    var dT=detailsD();curD=dT;doc.classList.toggle('bars-on',dT<-.55&&!reduce);if(reduce||snapNext)sd=dT;else sd+=(dT-sd)*ease(.15);var d=sd;
    if(dT>-1){var ec=caps[caps.length-1],eo=+ec.style.opacity*(1-ss(-1,-.6,dT));ec.style.opacity=eo.toFixed(3);ec.classList.toggle('on',eo>.05);
      if(dT>-.5){stTxt.textContent=DCH[Math.max(0,Math.min(4,Math.round(dT)))];stDot.style.background='#a9c2b3';}}

    /* act 1 to 3: the break */
    /* the break, in three movements: a fast burst; a slow-motion hang in a tight cloud while the core takes focus;
       then every piece pulls home on its own beat and settles with a little weight */
    var brk=ss(.345,.40,p)*(1-ss(.585,.645,p));
    var burst=outCubic(Math.min(1,Math.max(0,(p-.345)/.055))),hang=ss(.39,.45,p)*(1-ss(.565,.60,p)),drift=hang;
    var home=Math.max(0,Math.min(1,(p-.565)/.075));curHang=hang;
    if(!fadingMats.__all){pieces.forEach(function(o){o.traverse(function(n){var m=n.material;if(m&&!m.isShaderMaterial&&fadingMats.indexOf(m)<0)fadingMats.push(m);});});fadingMats.__all=true;}
    fadingMats.forEach(function(mt){mt.opacity=1-hang*.45;mt.transparent=hang>.001;mt.depthWrite=hang<.5;});
    for(var pi2=0;pi2<pieces.length;pi2++){var o=pieces[pi2],h=o.userData.home,f=o.userData.fly;
      var kk=Math.max(0,Math.min(1,home*1.45-f.lag*.45)),back=home>0?outBack(kk):0;
      var out=burst*(.72+.18*hang)*(1-back)*(p<.345?0:1);
      var wob=hang*(1-back)*.035;
      o.position.set(h.p.x+f.d.x*out+Math.sin(t*.45+f.ph)*wob,h.p.y+f.d.y*out+Math.sin(t*.37+f.ph*1.3)*wob,h.p.z+f.d.z*out+Math.cos(t*.41+f.ph)*wob);
      var spin=(burst*.55+hang*.18*Math.sin(t*.12+f.ph))*(1-back);
      o.rotation.set(h.r.x+f.r.x*spin,h.r.y+f.r.y*spin,h.r.z+f.r.z*spin);}
    pose(ss(.60,.64,p),t,ss(.08,.33,p)*(1-ss(.34,.40,p)));
    if(real){real.apply(ss(.60,.64,p),ss(.08,.33,p)*(1-ss(.34,.40,p)),t);real.fade(1-ss(.34,.385,p)*(1-ss(.59,.635,p)));}
    /* the windows: glow as you shuttle between them, shatter, fly to Friday one by one, come back */
    var hot=Math.floor(t*(1.2+3*ss(.1,.33,p)))%4;
    cards.forEach(function(c,i){var u=c.m.material.uniforms;
      var gath=ss(.405+i*.035,.445+i*.035,p),ret=ss(.585+i*.01,.63+i*.01,p);
      u.uBreak.value=Math.max(ss(.345,.395,p)*(1-gath),0)+(ret>0&&ret<1?Math.sin(ret*Math.PI)*.35:0);
      u.uGlow.value=(p>.08&&p<.34&&i===hot)?.45*ss(.08,.12,p):0;
      var slot=SLOTS[i],sx=slot.x*(W<820?.6:1);var k=gath*(1-ret);
      c.m.position.set(c.home.x+(sx-c.home.x)*k,c.home.y+(slot.y-c.home.y)*k,c.home.z+(slot.z-c.home.z)*k);
      c.m.rotation.set(0,k*(-sx*.35),k*Math.sin(t*.8+i)*.02);
      c.m.scale.setScalar(1+k*(W<820?.02:.25));
      var w=wires[i],on=ss(.44+i*.035,.46+i*.035,p)*(1-ss(.575,.6,p));
      var a=w.geometry.attributes.position;a.setXYZ(0,c.m.position.x,c.m.position.y+PH*.5*c.m.scale.y,c.m.position.z);a.setXYZ(1,CORE.x,CORE.y,CORE.z);a.needsUpdate=true;
      w.material.opacity=on*.55;
      var sk=((t*.6+i*.25)%1);sparks[i].position.set(a.getX(0)+(CORE.x-a.getX(0))*sk,a.getY(0)+(CORE.y-a.getY(0))*sk,a.getZ(0)+(CORE.z-a.getZ(0))*sk);sparks[i].material.opacity=on*.9;});
    var hopA=ss(.095,.12,p)*(1-ss(.31,.335,p));
    if(hopA>0){var hr=t*(1.2+3*ss(.1,.33,p)),hi=Math.floor(hr)%4,hj=(hi+1)%4,hf=hr%1,hk=ss(.15,.85,hf);
      var ha=cards[hi].home,hb=cards[hj].home;chip.position.set(ha.x+(hb.x-ha.x)*hk,ha.y+.04+Math.sin(hk*Math.PI)*.16,ha.z+.03+Math.sin(hk*Math.PI)*.06);
      chip.material.opacity=hopA*(.35+.65*Math.sin(hf*Math.PI));chip.lookAt(camera.position);}else chip.material.opacity=0;
    var coreA=ss(.39,.43,p)*(1-ss(.59,.62,p));coreMat.uniforms.uA.value=coreA;coreMat.uniforms.uT.value=t;core.rotation.y=t*.3;
    core.scale.setScalar(.6+.4*coreA+.05*Math.sin(t*2));ring.material.opacity=coreA*.5;ring.rotation.set(1.2+Math.sin(t*.4)*.1,t*.25,0);
    screenLight.intensity=3.2*(1-brk*.85);

    /* act 3 on: the layer */
    var la=ss(.635,.675,p);layerMat.uniforms.uA.value=la;layerMat.uniforms.uT.value=t;
    var beat='listen',bk=0;
    if(p>.735&&p<.80){beat='code';bk=ss(.745,.79,p);}else if(p>=.80&&p<.87){beat='council';bk=ss(.81,.86,p);}
    else if(p>=.87&&p<.93){beat='mask';bk=ss(.875,.92,p);}else if(p>=.93){beat='held';bk=ss(.935,.965,p);}
    /* the details chapters */
    var wP=d>-1?near(d,0,1):0,wI=d>-1?near(d,1,1):0,wPr=d>-1?near(d,2,1.2):0,wOut=ss(2.6,4.6,d);
    if(d>-.5){if(wP>.5){beat='mask';bk=.2+((t*.22)%1)*.9;}else if(wI>.5){beat='overlay';bk=t;}else{beat='listen';}}
    /* privacy: the boundary, and what you ask sorted three ways */
    ringLine.material.opacity=wP*.8;pcLabel.material.opacity=wP*.9;outLabel.material.opacity=wP*.85;
    var hit=0;
    PK.forEach(function(m){var u=m.userData,ph=(t*.16+u.off)%1,o=wP*Math.sin(Math.min(1,ph*1.15)*Math.PI);
      tmpA.copy(SRC).add(u.jit);
      if(u.kind===0){ /* everyday things: answered here, never leave the circle */
        tmpB.set(RC.x+Math.cos(u.ang+ph*2)*.75,.8+ph*.1,RC.z-.25+Math.sin(u.ang+ph*2)*.45);bez(tmpA,tmpB.clone().setY(1.75),tmpB,ph,m.position);
        m.material=u.solid;u.solid.opacity=o*.9;}
      else if(u.kind===1){ /* hard questions: out through the window, names already swapped */
        var cross=tmpB.copy(WIN).sub(RC).setY(0).normalize().multiplyScalar(RR).add(RC).setY(1.62);
        if(ph<.5)bez(tmpA,tmpA.clone().add(new THREE.Vector3(.3,.35,0)),cross,ph/.5,m.position);
        else m.position.copy(cross).lerp(tmpA.copy(WIN).add(new THREE.Vector3(.25,.1,-.9)),(ph-.5)/.5);
        var hol=ph>.5;m.material=hol?u.hollow:u.solid;u.solid.opacity=o;u.hollow.opacity=o;m.rotation.set(t+u.off*9,t*.7,0);
        m.scale.setScalar(hol?1.25:1);}
      else { /* government IDs: stop at the edge */
        var edge=tmpB.set(RC.x+Math.cos(u.ang)*RR,1.1+u.jit.y,RC.z+Math.sin(u.ang)*RR);var k2=Math.min(1,ph/.55);
        m.position.copy(tmpA).lerp(edge,ss(0,1,k2));if(ph>.55){m.position.lerp(tmpA,(ph-.55)*.12);hit=Math.max(hit,1-(ph-.55)/.3);}
        m.material=u.solid;u.solid.opacity=o*(ph>.55?Math.max(0,1-(ph-.55)/.35):1);}
      m.visible=o>.01;});
    barrierMat.opacity=wP*.08*Math.max(0,hit);
    /* invisible: a screen share catches the screen, without her layer */
    var cyc=(t%3.4)/3.4,shut=ss(.55,.6,cyc)*(1-ss(.86,.92,cyc));
    capFrame.material.opacity=wI*(.18+.8*shut);capLabel.material.opacity=wI*shut;recDot.material.opacity=wI*(.5+.5*Math.sin(t*5));
    /* pricing and after: evening. The lamp takes over, the room steps back */
    key.intensity=2.1-1.0*wPr-.5*wOut;over.intensity=1.1-.35*wPr;practical.intensity=.75+1.1*wPr+.4*wOut;
    renderer.toneMappingExposure=.92-.14*wOut;
    if(la>0&&(beat!==lastBeat||now-lastDraw>66)){drawLayer(beat,t,bk);lastBeat=beat;lastDraw=now;}
    layerMat.uniforms.uA.value=la*(1-wI*shut*.97);
    cards.forEach(function(c){c.m.material.uniforms.uAlpha.value=1-la*.35;});

    /* voice rings while she listens */
    (real?real.head:skull).getWorldPosition(headWorld);
    var va=ss(.64,.68,p)*(1-ss(.735,.75,p));
    rings.forEach(function(r,i){var ph=((t*.45)+i/3)%1;r.position.set(headWorld.x+(layer.position.x-headWorld.x)*ph,headWorld.y+.05+(layer.position.y-headWorld.y-.05)*ph,headWorld.z+(layer.position.z-headWorld.z)*ph);
      r.lookAt(camera.position);r.scale.setScalar(.45+ph*.9);r.material.opacity=va*Math.sin(ph*Math.PI)*.7;});

    /* sound: the mood follows the scroll; events fire as you cross them */
    if(window.FS&&FS.on)FS.update(p,d);   /* the music's filter follows the story */
    lastSP=p;
    camAt(p);if(d>-1)dcamAt(d);
    if(reduce||snapNext){camP.copy(cp);camT.copy(ct);camV.set(0,0,0);camTV.set(0,0,0);}
    else{var dtc=Math.min(.05,fdt/1000);
      camV.addScaledVector(tmpV.copy(cp).sub(camP),15*dtc).multiplyScalar(Math.max(0,1-7.4*dtc));camP.addScaledVector(camV,dtc);
      camTV.addScaledVector(tmpV.copy(ct).sub(camT),20*dtc).multiplyScalar(Math.max(0,1-8.6*dtc));camT.addScaledVector(camTV,dtc);}
    camera.position.copy(camP);
    if(!reduce){var hh=.0045;camera.position.x+=(Math.sin(t*.37)*.6+Math.sin(t*.93+1.3)*.4)*hh;camera.position.y+=(Math.sin(t*.51+.7)*.6+Math.sin(t*1.17)*.4)*hh*.8;
      camera.position.z+=Math.sin(t*.29+2.1)*hh*.6;}
    if(!reduce){pmx+=(tmx-pmx)*ease(.05);pmy+=(tmy-pmy)*ease(.05);camera.position.x+=pmx*.09;camera.position.y-=pmy*.05;}
    var sy=window.scrollY,sv=(sy-lastSY)/Math.max(4,fdt),vel=Math.abs(sv);lastSY=sy;spd+=(Math.min(4,vel)-spd)*ease(.08);svSigned+=(Math.max(-4,Math.min(4,sv))-svSigned)*ease(.1);
    var fovT=(W<820?52:38)+spd*1.8;if(Math.abs(camera.fov-fovT)>.01){camera.fov=fovT;camera.updateProjectionMatrix();}
    if(film){film.uniforms.ca.value=.0028+Math.min(.006,spd*.0022);film.uniforms.grain.value=.05+Math.min(.03,spd*.012);}
    camera.lookAt(camT);
    if(!reduce){var dts=Math.min(.05,fdt/1000),mvx=(tmx-lastTmx)/Math.max(.004,dts);lastTmx=tmx;
      /* bank a little against a quick sideways mouse move, nose down a touch while you scroll down; both spring back */
      var rollT=Math.max(-.035,Math.min(.035,-mvx*.012)),pitchT=Math.max(-.025,Math.min(.025,-svSigned*.008));
      rollV+=((rollT-rollS)*30-rollV*9)*dts;rollS+=rollV*dts;pitchV+=((pitchT-pitchS)*26-pitchV*8.5)*dts;pitchS+=pitchV*dts;
      camera.rotateZ((Math.sin(t*.23)*.5+Math.sin(t*.61+.4)*.5)*.0022+rollS);camera.rotateX(pitchS);}
    if(dust){var da=dust.geometry.attributes.position;for(var di2=0;di2<da.count;di2++){var dv=dustV[di2];
      var x=da.getX(di2)+dv[0]*fdt*.001+Math.sin(t*.4+di2)*.00002*fdt,y=da.getY(di2)+dv[1]*fdt*.001+spd*.00018*fdt*(.5+dustV[di2][1]*60),z=da.getZ(di2)+dv[2]*fdt*.001;
      if(y>3.0)y=.8;if(y<.8)y=3.0;if(x>.75)x=-.75;if(x<-.75)x=.75;da.setXYZ(di2,x,y,z);}da.needsUpdate=true;
      dustMat.uniforms.uA.value=(.55+Math.min(.5,spd*.25))*(1-.7*ss(.34,.37,p)*(1-ss(.6,.64,p)));dustMat.uniforms.uT.value=t;
      dustMat.uniforms.uFocus.value=Math.max(.3,focusD);dustMat.uniforms.uPx.value=H*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));
      dustMat.uniforms.uCoc.value=(dof&&dof.enabled?38:10)*renderer.getPixelRatio();}
    /* lens shift: move the picture away from the captions (right on desktop, up on phones) */
    var left=(p<.335)||(p>.40&&p<.58)||(p>.615&&p<.975);
    var tox=W>820?(left?(p>.735?-.1:-.19):0):((p<.335||(p>.6&&p<.735))?-.17:0),toy=W>820?0:.2;
    if(d>-.6){tox=W>820?-.2:0;toy=W>820?0:.24;}
    var e3=(reduce||snapNext)?1:.07;snapNext=false;ox+=(tox-ox)*e3;oy+=(toy-oy)*e3;
    camera.setViewOffset(W,H,ox*W,oy*H,W,H);
    render(now);
    if(!firstFrame){firstFrame=true;step();}
  }
  function loop(now){if(!looping)return;draw(now);if(onscreen&&!document.hidden&&!reduce)requestAnimationFrame(loop);else looping=false;}
  function run(){if(looping||reduce||!onscreen||document.hidden)return;looping=true;requestAnimationFrame(loop);}
  if(reduce)window.addEventListener('scroll',function(){requestAnimationFrame(draw);},{passive:true});
  /* the room stays live for the whole page now, not only the story */
  document.addEventListener('visibilitychange',run);
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){onscreen=es[0].isIntersecting;doc.classList.toggle('in-story',onscreen);
    if(onscreen){run();}},{rootMargin:'0px'}).observe(story);}
  camAt(0);camP.copy(cp);camT.copy(ct);
  draw(performance.now());run();
  window.__fridayP=function(){return curP;};
  /* jump straight to the current scroll position (used by the back/forward cache and tests) */
  window.__snap=function(){focusD=-1;sp=storyP();sd=detailsD();camAt(sp);if(sd>-1)dcamAt(sd);camP.copy(cp);camT.copy(ct);snapNext=true;};
})();
