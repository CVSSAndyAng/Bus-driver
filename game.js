const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#road'),ctx=canvas.getContext('2d');
const routes={
 '24':[{n:'Tampines Int',c:'75009'},{n:'Opp Tampines Hub',c:'76191'},{n:'Bedok Reservoir Rd',c:'75351'},{n:'Kaki Bukit Ave 1',c:'71081'},{n:'Eunos Link',c:'72041'},{n:'Paya Lebar Rd',c:'70231'},{n:'City Fringe',c:'80011'}],
 '27':[{n:'Tampines Int',c:'75009'},{n:'Tampines Ave 5',c:'76059'},{n:'Pasir Ris Dr 1',c:'77029'},{n:'Loyang Ave',c:'98039'},{n:'Airport Area',c:'95129'},{n:'Hougang Ave',c:'64009'}],
 '36':[{n:'Changi Airport',c:'95009'},{n:'Airport Blvd',c:'95159'},{n:'Marine Parade Rd',c:'92049'},{n:'Mountbatten Rd',c:'80279'},{n:'Suntec City',c:'02151'},{n:'Tomlinson Rd',c:'09179'}],
 '53':[{n:'Bishan Int',c:'53009'},{n:'Lor 6 Toa Payoh',c:'52059'},{n:'Serangoon Rd',c:'60089'},{n:'Upper Paya Lebar Rd',c:'70289'},{n:'Pasir Ris Dr 1',c:'77009'},{n:'Changi Airport',c:'95009'}],
 '118':[{n:'Punggol Int',c:'65009'},{n:'Punggol Central',c:'65119'},{n:'TPE',c:'65189'},{n:'Tampines Ave 10',c:'75489'},{n:'Tampines Ave 5',c:'76059'},{n:'Tampines Int',c:'75009'}]
};
const tips=['Keep left unless overtaking.','Signal before leaving a bus bay.','Bus captains should watch for cyclists when entering or leaving bus bays.','Stop smoothly so standing passengers can stay balanced.','Open passenger doors only when the bus is fully stopped.','Give pedestrians plenty of time at crossings.','Check both mirrors before moving away from a stop.'];
let mode='driver',route=[],running=false,accel=false,braking=false,left=false,right=false,doors=false,kneel=false,wipers=false,lights=false,signal=0,sound=true;
let speed=0,lane=-.18,score=100,passengers=12,stopIndex=1,world=0,atStop=false,served=false,last=performance.now(),startedAt=0,gpsWatch=null,lastGps=null,gpsDistance=0;
let redLight=false,lightPhase=0,eventKey='',rainDrops=[];const once=new Set();
let wheelAngle=0,wheelDragging=false,lastPointerAngle=null;const MAX_WHEEL=450;
let phoneSteeringEnabled=false,orientationListening=false,tiltBase=null,tiltRaw=0,tiltSteer=0,stopRequested=false;
let roadSource='sim',cameraStream=null,streetPanorama=null,streetService=null,streetLastWorld=-999,streetLoading=false,streetBaseHeading=90;
const SG_STREET_PATH=[
 {lat:1.29372,lng:103.85658},{lat:1.29343,lng:103.85769},{lat:1.29313,lng:103.85888},{lat:1.29272,lng:103.86014},
 {lat:1.29224,lng:103.86118},{lat:1.29162,lng:103.86191},{lat:1.29087,lng:103.86202},{lat:1.29015,lng:103.86162}
];
$$('.mode').forEach(b=>b.onclick=()=>{$$('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode});
$('#startBtn').onclick=startGame;
$('#roadSource').addEventListener('change',updateRoadSourceSetup);updateRoadSourceSetup();$('#helpBtn').onclick=()=>$('#help').classList.remove('hidden');$('#closeHelp').onclick=()=>$('#help').classList.add('hidden');$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=sound?'🔊 Sound':'🔇 Muted'};
$('#doorBtn').onclick=toggleDoors;$('#bellBtn').onclick=requestStop;$('#announceBtn').onclick=()=>announce('Next stop, '+route[stopIndex].n+'.');$('#kneelBtn').onclick=()=>{kneel=!kneel;active('#kneelBtn',kneel);announce(kneel?'Bus lowered for easier boarding.':'Bus returned to normal ride height.')};$('#leftSignalBtn').onclick=()=>toggleSignal(-1);$('#rightSignalBtn').onclick=()=>toggleSignal(1);$('#wiperBtn').onclick=()=>{wipers=!wipers;active('#wiperBtn',wipers)};$('#lightBtn').onclick=()=>{lights=!lights;active('#lightBtn',lights)};$('#gpsBtn').onclick=enableGps;
$('#mobileLeftSignal')?.addEventListener('click',()=>toggleSignal(-1));$('#mobileRightSignal')?.addEventListener('click',()=>toggleSignal(1));$('#mobileStopRequest')?.addEventListener('click',requestStop);$('#mobileDoorBtn')?.addEventListener('click',toggleDoors);$('#tiltCalibrateBtn')?.addEventListener('click',calibrateTilt);
function active(id,on){$(id).classList.toggle('active-control',on)}
function bindHold(id,on,off){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();on()});['pointerup','pointercancel','pointerleave'].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();off()}))}
bindHold('#goBtn',()=>accel=true,()=>accel=false);bindHold('#brakeBtn',()=>braking=true,()=>braking=false);bindHold('#leftBtn',()=>left=true,()=>left=false);bindHold('#rightBtn',()=>right=true,()=>right=false);bindHold('#mobileGoBtn',()=>accel=true,()=>accel=false);bindHold('#mobileBrakeBtn',()=>braking=true,()=>braking=false);
setupSteeringWheel();
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='w'||e.key==='ArrowUp')accel=true;if(k==='s'||e.key==='ArrowDown')braking=true;if(k==='a'||e.key==='ArrowLeft')left=true;if(k==='d'||e.key==='ArrowRight')right=true;if(k==='q')toggleSignal(-1);if(k==='e')toggleSignal(1);if(e.code==='Space'){e.preventDefault();toggleDoors()}});window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='w'||e.key==='ArrowUp')accel=false;if(k==='s'||e.key==='ArrowDown')braking=false;if(k==='a'||e.key==='ArrowLeft')left=false;if(k==='d'||e.key==='ArrowRight')right=false});

function setupSteeringWheel(){
 const wheel=$('#steeringWheel'); if(!wheel)return;
 const pointerAngle=e=>{const r=wheel.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;return Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI};
 wheel.addEventListener('pointerdown',e=>{e.preventDefault();wheel.setPointerCapture?.(e.pointerId);wheelDragging=true;lastPointerAngle=pointerAngle(e)});
 wheel.addEventListener('pointermove',e=>{if(!wheelDragging)return;e.preventDefault();const a=pointerAngle(e);let d=a-lastPointerAngle;if(d>180)d-=360;if(d<-180)d+=360;wheelAngle=Math.max(-MAX_WHEEL,Math.min(MAX_WHEEL,wheelAngle+d));lastPointerAngle=a;setWheelVisual()});
 const stop=e=>{if(!wheelDragging)return;wheelDragging=false;lastPointerAngle=null;try{wheel.releasePointerCapture?.(e.pointerId)}catch{}};
 wheel.addEventListener('pointerup',stop);wheel.addEventListener('pointercancel',stop);
 wheel.addEventListener('dblclick',()=>{wheelAngle=0;setWheelVisual()});
}
function setWheelVisual(){const wheel=$('#steeringWheel');if(!wheel)return;wheel.style.transform=`rotate(${wheelAngle}deg)`;wheel.setAttribute('aria-valuenow',String(Math.round(wheelAngle)));const needle=$('.dial i');if(needle)needle.style.transform=`rotate(${-45+Math.min(1,speed/60)*235}deg)`}

async function startGame(){mode=$('.mode.active').dataset.mode;roadSource=$('#roadSource').value;route=routes[$('#service').value];phoneSteeringEnabled=mode==='driver'&&!!$('#phoneSteering')?.checked&&isPhoneLike();if(phoneSteeringEnabled)await enablePhoneSteering();running=true;speed=0;lane=-.18;wheelAngle=0;setWheelVisual();score=100;passengers=12;stopIndex=1;world=0;doors=false;served=false;atStop=false;signal=0;stopRequested=false;once.clear();startedAt=performance.now();last=performance.now();$('#setup').classList.add('hidden');$('#game').classList.remove('hidden');document.body.classList.toggle('phone-driving',phoneSteeringEnabled);$('#mobileDriveUI')?.classList.toggle('hidden',!phoneSteeringEnabled);$('#driverControls').classList.toggle('hidden',mode!=='driver'||phoneSteeringEnabled);$('#rideControls').classList.toggle('hidden',mode!=='ride');$('#hudService').textContent=$('#service').value;try{screen.orientation?.lock?.('landscape').catch(()=>{})}catch{}await activateRoadSource();announce(phoneSteeringEnabled?'Phone steering ready. Hold the phone in landscape and rotate it like a steering wheel.':'Cockpit ready. Check mirrors, signal and move off when safe.');updateHud();requestAnimationFrame(loop)}
function toggleSignal(v){signal=signal===v?0:v;active('#leftSignalBtn',signal===-1);active('#rightSignalBtn',signal===1);$('#leftInd').classList.toggle('on',signal===-1);$('#rightInd').classList.toggle('on',signal===1);$('#mobileLeftSignal')?.classList.toggle('on',signal===-1);$('#mobileRightSignal')?.classList.toggle('on',signal===1)}
function toggleDoors(){if(speed>1){score-=8;announce('Warning. Stop fully before opening the doors.');return}doors=!doors;active('#doorBtn',doors);$('#doorBtn').textContent=doors?'🚪 Close doors':'🚪 Open doors';$('#doorStatus').textContent=doors?'Open':'Closed';$('#doorLamp').classList.toggle('on',doors);const md=$('#mobileDoorBtn');if(md){md.textContent=doors?'CLOSE DOORS':'OPEN DOORS';md.classList.toggle('open',doors)}if(doors&&atStop&&!served){served=true;stopRequested=false;updateStopRequestUI();const off=Math.floor(Math.random()*5),on=2+Math.floor(Math.random()*7);passengers=Math.max(0,passengers-off)+on;score+=8;announce(`Stop served. ${on} boarded and ${off} alighted.`);setTimeout(()=>{if(doors)return;advanceStop()},1200)}}
function advanceStop(){if(stopIndex<route.length-1){stopIndex++;served=false;atStop=false;stopRequested=false;updateStopRequestUI();toggleSignal(0);announce('Doors closed. Check mirrors before moving off.')}else{announce('Journey complete. Excellent work, Bus Captain!');running=false}}
function requestStop(){stopRequested=true;updateStopRequestUI();announce('Ding dong. Bus stopping.')}
function updateStopRequestUI(){active('#mobileStopRequest',stopRequested);$('#busStoppingSign')?.classList.toggle('hidden',!stopRequested)}
function isPhoneLike(){return matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)}
async function enablePhoneSteering(){
 try{
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error('Motion permission denied')}
  if(!orientationListening){window.addEventListener('deviceorientation',onDeviceOrientation,true);orientationListening=true}
  $('#tiltStatus').textContent='PHONE STEERING READY';
 }catch(e){console.warn(e);phoneSteeringEnabled=false;$('#tiltStatus').textContent='MOTION ACCESS NEEDED';announce('Motion access was not granted. Use touch steering instead.')}
}
function orientationAxis(e){const a=screen.orientation?.angle ?? window.orientation ?? 0;if(a===90)return e.beta??0;if(a===270||a===-90)return -(e.beta??0);return e.gamma??0}
function onDeviceOrientation(e){if(!phoneSteeringEnabled)return;const raw=orientationAxis(e);if(!Number.isFinite(raw))return;tiltRaw=raw;if(tiltBase===null)tiltBase=raw;let delta=raw-tiltBase;while(delta>180)delta-=360;while(delta<-180)delta+=360;const dead=2.5;if(Math.abs(delta)<dead)delta=0;else delta-=Math.sign(delta)*dead;tiltSteer=Math.max(-1,Math.min(1,delta/38));wheelAngle+=(tiltSteer*MAX_WHEEL-wheelAngle)*.28;wheelDragging=true;setWheelVisual();$('#tiltStatus').textContent=`STEERING ${Math.round(tiltSteer*100)}%`;requestAnimationFrame(()=>wheelDragging=false)}
function calibrateTilt(){tiltBase=tiltRaw;tiltSteer=0;wheelAngle=0;setWheelVisual();$('#tiltStatus').textContent='STEERING CENTRED'}
function announce(t){$('#announcement').textContent=t;if(sound&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=1.03;u.pitch=1;speechSynthesis.speak(u)}}
function onceSay(k,t){if(!once.has(k)){once.add(k);announce(t)}}
function loop(t){if(!running)return;const dt=Math.min(.04,(t-last)/1000);last=t;if(mode==='driver')physics(dt);draw(t);updateHud();requestAnimationFrame(loop)}
function physics(dt){const weather=$('#weather').value,difficulty=$('#difficulty').value,limit=difficulty==='easy'?45:40,max=weather==='rain'?48:55;if(doors&&accel){speed=0;score-=12*dt;onceSay('doorMove','Close the doors before moving off.')}else{if(accel)speed+=17*dt;if(braking)speed-=weather==='rain'?21*dt:29*dt;speed-=2.8*dt;speed=Math.max(0,Math.min(max,speed))}if(left)wheelAngle=Math.max(-MAX_WHEEL,wheelAngle-250*dt);if(right)wheelAngle=Math.min(MAX_WHEEL,wheelAngle+250*dt);if(!phoneSteeringEnabled&&!wheelDragging&&!left&&!right){wheelAngle*=Math.pow(.86,dt*10);if(Math.abs(wheelAngle)<.3)wheelAngle=0}setWheelVisual();const steerNorm=wheelAngle/MAX_WHEEL;lane+=steerNorm*(0.58+speed/95)*dt;lane=Math.max(-1.15,Math.min(.95,lane));if(Math.abs(lane+.18)>.5)score-=3.2*dt;if(speed>limit)score-=2.2*dt;world+=speed*dt*1.25;
 const stopW=520,stopPos=stopIndex*stopW,dist=stopPos-world;atStop=dist<42&&dist>-22;if(dist<120&&dist>45&&speed>24)onceSay('approach'+stopIndex,'Bus stop ahead. Slow down and signal left.');if(atStop&&speed<1&&!doors){onceSay('stop'+stopIndex,'Good stop. Open the doors when safe.');if(signal!==-1)score-=.04}if(dist<-42&&!served){score-=12;onceSay('miss'+stopIndex,'You missed the bus stop.');advanceStop()}
 const lightPos=stopPos-245,ld=lightPos-world;redLight=(stopIndex%2===0)&&((Math.floor((performance.now()-startedAt)/7000)%3)!==2);if(ld<75&&ld>-12&&redLight){$('#roadStatus').textContent='Red light';if(speed>1&&ld<10){score-=8*dt;onceSay('red'+stopIndex,'Red light. Stop before the line.')}}else $('#roadStatus').textContent='Clear';if(world>stopPos+75&&served&&!doors)advanceStop();score=Math.max(0,Math.min(999,score))}
function updateHud(){if(!route.length)return;const s=route[Math.min(stopIndex,route.length-1)];$('#speed').textContent=$('#dashSpeed').textContent=Math.round(speed);$('#score').textContent=Math.round(score);$('#passengers').textContent=passengers;$('#nextStop').textContent=$('#dashStop').textContent=s.n;$('#nextCode').textContent=$('#dashCode').textContent='Bus Stop '+s.c;$('#arNextStop').textContent=s.n;$('#arNextCode').textContent='Bus Stop '+s.c;$('#missionText').textContent=atStop?'Stop fully, secure the bus and serve passengers.':'Keep left and drive safely to '+s.n+'.';$('#fact').textContent=tips[stopIndex%tips.length];$('#routeProgress').style.width=Math.min(100,(world/((route.length-1)*520))*100)+'%';const secs=Math.max(0,(performance.now()-startedAt)/1000),mm=String(Math.floor(secs/60)).padStart(2,'0'),ss=String(Math.floor(secs%60)).padStart(2,'0');$('#tripTime').textContent=mm+':'+ss;$('#scheduleStatus').textContent=score>82?'On time':score>60?'Watch pace':'Delayed';$('#busStatus').textContent=doors?'Boarding':speed>1?'In service':'Stopped';const fullyStopped=speed<1&&atStop;$('#mobileDoorPanel')?.classList.toggle('hidden',!phoneSteeringEnabled||!fullyStopped);if(!fullyStopped&&doors){/* keep physical state but hide mobile door panel while moving should never occur */}const arrow=$('.ar-route-arrow');if(arrow)arrow.style.transform=`translate(-50%,-50%) rotate(${wheelAngle/MAX_WHEEL*18}deg)`;setWheelVisual()}
function draw(t){if(roadSource==='street'){updateStreetView();return}if(roadSource==='ar')return;const W=canvas.width,H=canvas.height,weather=$('#weather').value;ctx.clearRect(0,0,W,H);drawSky(weather);drawCity();drawRoad();drawWorldObjects();drawTraffic();drawRain(weather,t);if(lights)drawHeadlights();}
function drawSky(weather){let g=ctx.createLinearGradient(0,0,0,420);if(weather==='evening'){g.addColorStop(0,'#35405f');g.addColorStop(.6,'#e79b68');g.addColorStop(1,'#f5c89a')}else if(weather==='rain'){g.addColorStop(0,'#6f858f');g.addColorStop(1,'#b6c2c4')}else{g.addColorStop(0,'#73c9f3');g.addColorStop(1,'#d7f0fb')}ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,430)}
function drawCity(){const shift=(world*.12)%170;for(let i=-2;i<10;i++){const x=i*170-shift,base=330,h=80+(i%4+4)%4*35;ctx.fillStyle=i%3===0?'#d9e2e1':'#e8d8c4';ctx.fillRect(x,base-h,120,h);ctx.fillStyle='#789096';for(let yy=base-h+18;yy<base-15;yy+=24)for(let xx=x+15;xx<x+105;xx+=26)ctx.fillRect(xx,yy,10,9);ctx.fillStyle='#4b805e';ctx.beginPath();ctx.arc(x+135,315,28,0,Math.PI*2);ctx.fill();ctx.fillStyle='#76593c';ctx.fillRect(x+131,315,8,32)}ctx.fillStyle='#4f7f54';ctx.fillRect(0,345,canvas.width,32)}
function perspY(z){return 368+320*(1-z)}function perspX(x,z){return canvas.width/2+(x-lane*145)*(1.5-z)*2.15}function scaleZ(z){return .15+(1-z)*1.05}
function drawRoad(){const horizon=368,bottom=720;ctx.fillStyle='#50565a';ctx.beginPath();ctx.moveTo(470,horizon);ctx.lineTo(0,bottom);ctx.lineTo(canvas.width,bottom);ctx.lineTo(810,horizon);ctx.closePath();ctx.fill();ctx.fillStyle='#d9b400';ctx.beginPath();ctx.moveTo(485,horizon);ctx.lineTo(60,bottom);ctx.lineTo(77,bottom);ctx.lineTo(492,horizon);ctx.closePath();ctx.fill();ctx.fillStyle='#e8e8e8';ctx.beginPath();ctx.moveTo(795,horizon);ctx.lineTo(1210,bottom);ctx.lineTo(1230,bottom);ctx.lineTo(803,horizon);ctx.closePath();ctx.fill();for(let i=0;i<10;i++){const z=((i*.16-(world%70)/430)+1)%1,y=perspY(z),w=8+40*(1-z),h=3+12*(1-z);ctx.fillStyle='#eee';ctx.fillRect(canvas.width/2-5,y,w,h)}ctx.fillStyle='#e0bf24';ctx.font='900 70px sans-serif';ctx.save();ctx.translate(190,625);ctx.rotate(-.08);ctx.fillText('BUS',0,0);ctx.restore()}
function drawWorldObjects(){const stopW=520;for(let j=stopIndex;j<=Math.min(route.length-1,stopIndex+1);j++){const rel=(j*stopW-world)/650;if(rel>-0.08&&rel<1.03)drawBusStop(rel,route[j],j)}const lp=stopIndex*stopW-245,lr=(lp-world)/650;if(lr>-0.05&&lr<1.02)drawTrafficLight(lr,redLight);drawCrossing(lr-.06);drawSigns()}
function drawBusStop(z,s,idx){const sc=scaleZ(z),x=perspX(-115,z),y=perspY(z);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle='#f1c400';ctx.fillRect(-120,23,240,13);ctx.fillStyle='#245b45';ctx.fillRect(35,-155,10,180);ctx.fillStyle='#fff';ctx.fillRect(0,-205,82,55);ctx.strokeStyle='#245b45';ctx.lineWidth=5;ctx.strokeRect(0,-205,82,55);ctx.fillStyle='#245b45';ctx.font='900 20px sans-serif';ctx.fillText(s.c,8,-174);ctx.fillStyle='#245b45';ctx.fillRect(-105,-120,120,9);ctx.fillRect(-95,-112,10,120);ctx.fillRect(0,-112,10,120);ctx.fillStyle='#d6dad8';ctx.fillRect(-104,-108,112,8);ctx.fillStyle='#1c4f3c';ctx.font='800 15px sans-serif';ctx.fillText('BUS STOP',-100,-130);ctx.restore()}
function drawTrafficLight(z,red){const sc=scaleZ(z),x=perspX(120,z),y=perspY(z);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle='#30383b';ctx.fillRect(-6,-190,12,190);ctx.fillRect(-6,-190,100,9);ctx.fillStyle='#161b1d';ctx.fillRect(68,-185,45,92);for(let i=0;i<3;i++){ctx.fillStyle=(i===0&&red)||(i===2&&!red)?(i===0?'#ff3b30':'#38d768'):'#455052';ctx.beginPath();ctx.arc(90,-166+i*29,10,0,Math.PI*2);ctx.fill()}ctx.restore()}
function drawCrossing(z){if(z<0||z>1)return;const y=perspY(z),spread=160*(1-z)+8;ctx.fillStyle='#eee';for(let i=-4;i<=4;i++)ctx.fillRect(canvas.width/2+i*spread*.24,y,spread*.16,8+25*(1-z))}
function drawSigns(){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(1130,155,34,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e23b45';ctx.lineWidth=6;ctx.stroke();ctx.fillStyle='#111';ctx.font='900 27px sans-serif';ctx.textAlign='center';ctx.fillText('40',1130,165);ctx.textAlign='left'}
function drawTraffic(){for(let i=0;i<4;i++){let z=((i*.28+0.22-(world%260)/900)+1)%1;if(z>.12){const sc=scaleZ(z),x=perspX(i%2?45:-22,z),y=perspY(z);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle=i%2?'#d9474f':'#3c7fc5';ctx.fillRect(-34,-22,68,34);ctx.fillStyle='#bde8f6';ctx.fillRect(-23,-18,46,14);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-22,14,8,0,Math.PI*2);ctx.arc(22,14,8,0,Math.PI*2);ctx.fill();ctx.restore()}}}
function drawRain(weather,t){if(weather!=='rain')return;if(!rainDrops.length)for(let i=0;i<90;i++)rainDrops.push({x:Math.random()*1280,y:Math.random()*720,l:10+Math.random()*18});ctx.strokeStyle='#d7eef8aa';ctx.lineWidth=2;for(const d of rainDrops){d.y+=12;if(d.y>720){d.y=-20;d.x=Math.random()*1280}ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-5,d.y+d.l);ctx.stroke()}if(wipers){ctx.strokeStyle='#20282b';ctx.lineWidth=13;ctx.beginPath();ctx.arc(640,680,380,Math.PI*1.18,Math.PI*1.82);ctx.stroke();ctx.strokeStyle='#ffffff14';ctx.lineWidth=80;ctx.beginPath();ctx.arc(640,680,330,Math.PI*1.18,Math.PI*1.82);ctx.stroke()}}
function drawHeadlights(){let g=ctx.createRadialGradient(640,660,20,640,520,480);g.addColorStop(0,'#fff6bd55');g.addColorStop(1,'#fff0');ctx.fillStyle=g;ctx.fillRect(0,300,1280,420)}
async function enableGps(){if(!navigator.geolocation){announce('GPS is not available on this device.');return}$('#gpsBtn').textContent='GPS active';$('#gpsBanner').classList.remove('hidden');gpsWatch=navigator.geolocation.watchPosition(p=>{const cur={lat:p.coords.latitude,lon:p.coords.longitude,t:p.timestamp};if(lastGps){const d=haversine(lastGps.lat,lastGps.lon,cur.lat,cur.lon),dt=Math.max(1,(cur.t-lastGps.t)/1000);if(d<250){gpsDistance+=d;world+=d*1.25;speed=Math.min(80,d/dt*3.6);const next=stopIndex*520;if(world>next-20){atStop=speed<4;if(atStop)onceSay('gps'+stopIndex,'You are approaching the next virtual stop. Look outside for the real bus stop.')}}}lastGps=cur},()=>announce('Location permission is needed for Ride-Along mode.'),{enableHighAccuracy:true,maximumAge:3000,timeout:10000})}
function haversine(a,b,c,d){const R=6371000,r=x=>x*Math.PI/180,p1=r(a),p2=r(c),dp=r(c-a),dl=r(d-b),q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}


function updateRoadSourceSetup(){
 const src=$('#roadSource')?.value||'sim';
 $('#mapsKeyWrap')?.classList.toggle('hidden',src!=='street');
}
function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null}}
function resetOutsideLayers(){
 stopCamera();
 $('#streetView').classList.add('hidden');$('#arCamera').classList.add('hidden');$('#arOverlay').classList.add('hidden');canvas.classList.add('hidden');
}
async function activateRoadSource(){
 resetOutsideLayers();streetPanorama=null;streetService=null;streetLastWorld=-999;
 if(roadSource==='ar'){
   $('#viewBadge').textContent='AR LIVE CAMERA';$('#arCamera').classList.remove('hidden');$('#arOverlay').classList.remove('hidden');
   await startArCamera();return;
 }
 if(roadSource==='street'){
   $('#viewBadge').textContent='SINGAPORE STREET VIEW';$('#streetView').classList.remove('hidden');
   try{await initStreetView()}catch(err){console.error(err);announce('Street View could not start. Falling back to the offline road.');roadSource='sim';resetOutsideLayers();canvas.classList.remove('hidden');$('#viewBadge').textContent='OFFLINE ROAD'}
   return;
 }
 canvas.classList.remove('hidden');$('#viewBadge').textContent='OFFLINE ROAD';
}
async function startArCamera(){
 if(!navigator.mediaDevices?.getUserMedia){announce('Live camera is not available in this browser.');return}
 try{
   cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
   const v=$('#arCamera');v.srcObject=cameraStream;await v.play();
   announce('AR live windscreen active. Keep the device safely mounted or held by a passenger.');
 }catch(e){console.error(e);announce('Camera permission is needed for AR live view.');}
}
function loadGoogleMaps(key){
 if(window.google?.maps?.StreetViewPanorama)return Promise.resolve();
 return new Promise((resolve,reject)=>{
   const cb='busCaptainMapsReady_'+Math.random().toString(36).slice(2);window[cb]=()=>{delete window[cb];resolve()};
   const sc=document.createElement('script');sc.async=true;sc.defer=true;sc.onerror=()=>reject(new Error('Maps JavaScript API failed to load'));
   sc.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&v=weekly&callback='+cb;document.head.appendChild(sc);
 });
}
async function initStreetView(){
 const key=$('#mapsApiKey').value.trim() || window.BUS_CAPTAIN_CONFIG?.googleMapsApiKey || '';
 if(!key)throw new Error('Google Maps API key required');
 await loadGoogleMaps(key);
 streetService=new google.maps.StreetViewService();
 streetPanorama=new google.maps.StreetViewPanorama($('#streetView'),{position:SG_STREET_PATH[0],pov:{heading:90,pitch:1},zoom:1,linksControl:false,panControl:false,addressControl:false,fullscreenControl:false,enableCloseButton:false,clickToGo:false,scrollwheel:false,motionTracking:false,motionTrackingControl:false,showRoadLabels:true});
 await updateStreetView(true);announce('Singapore Street View windscreen active. This is a simulated training corridor.');
}
function interpolatePath(f){
 f=Math.max(0,Math.min(.9999,f));const n=SG_STREET_PATH.length-1,x=f*n,i=Math.floor(x),u=x-i,a=SG_STREET_PATH[i],b=SG_STREET_PATH[Math.min(i+1,SG_STREET_PATH.length-1)];
 const p={lat:a.lat+(b.lat-a.lat)*u,lng:a.lng+(b.lng-a.lng)*u};p.heading=bearing(a,b);return p;
}
function bearing(a,b){const r=Math.PI/180,p1=a.lat*r,p2=b.lat*r,dl=(b.lng-a.lng)*r;const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);return (Math.atan2(y,x)/r+360)%360}
async function updateStreetView(force=false){
 if(!streetPanorama||!streetService||streetLoading)return;
 if(!force&&Math.abs(world-streetLastWorld)<14){streetPanorama.setPov({heading:streetBaseHeading+(wheelAngle/MAX_WHEEL)*16,pitch:1});return}
 streetLastWorld=world;const maxWorld=Math.max(1,(route.length-1)*520),f=Math.max(0,Math.min(1,world/maxWorld));const target=interpolatePath(f);streetBaseHeading=target.heading;streetLoading=true;
 try{
   const result=await streetService.getPanorama({location:{lat:target.lat,lng:target.lng},radius:80,preference:google.maps.StreetViewPreference.NEAREST,source:google.maps.StreetViewSource.OUTDOOR});
   if(result?.data?.location?.latLng){streetPanorama.setPosition(result.data.location.latLng);streetPanorama.setPov({heading:streetBaseHeading+(wheelAngle/MAX_WHEEL)*16,pitch:1})}
 }catch(e){console.warn('No nearby Street View panorama',e)}finally{streetLoading=false}
}
window.addEventListener('beforeunload',stopCamera);
