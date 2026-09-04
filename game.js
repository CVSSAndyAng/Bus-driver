const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#road'), ctx=canvas.getContext('2d');
const stops=['Tampines Interchange','Tampines Ave 5','Bedok Reservoir','Kaki Bukit','Eunos Link','Paya Lebar','City Centre'];
const facts=[
 'A bus captain checks that doors are closed before moving off.',
 'Stopping smoothly helps standing passengers stay balanced.',
 'Passengers should move to the rear so others can board.',
 'The bell tells the bus captain that somebody wants the next stop.',
 'Priority seats are for passengers who may need them more.',
 'Buses need extra space to turn because they are long vehicles.'
];
let mode='driver', running=false, accel=false, braking=false, left=false, right=false, doors=false, kneel=false;
let speed=0, x=0, lane=0, score=100, passengers=8, stopIndex=1, atStop=false, stoppedHandled=false, gpsWatch=null, lastGps=null, gpsDistance=0;
let last=performance.now(), sound=true;

$$('.mode').forEach(b=>b.onclick=()=>{$$('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode});
$('#startBtn').onclick=startGame; $('#helpBtn').onclick=()=>$('#help').classList.remove('hidden'); $('#closeHelp').onclick=()=>$('#help').classList.add('hidden');
$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=sound?'🔊 Sound':'🔇 Muted'};
$('#doorBtn').onclick=toggleDoors; $('#bellBtn').onclick=()=>announce('🔔 Ding! Passenger wants the next stop.');
$('#announceBtn').onclick=()=>announce('Next stop: '+stops[stopIndex]);
$('#kneelBtn').onclick=()=>{kneel=!kneel;$('#kneelBtn').textContent=kneel?'♿ Raise bus':'♿ Kneel bus';announce(kneel?'Bus lowered to help boarding.':'Bus returned to normal height.');};
$('#gpsBtn').onclick=enableGps;

function bindHold(id,on,off){const el=$(id);['pointerdown','touchstart'].forEach(e=>el.addEventListener(e,ev=>{ev.preventDefault();on()}));['pointerup','pointercancel','pointerleave','touchend'].forEach(e=>el.addEventListener(e,ev=>{ev.preventDefault();off()}));}
bindHold('#goBtn',()=>accel=true,()=>accel=false);bindHold('#brakeBtn',()=>braking=true,()=>braking=false);bindHold('#leftBtn',()=>left=true,()=>left=false);bindHold('#rightBtn',()=>right=true,()=>right=false);
window.addEventListener('keydown',e=>{if(e.key==='ArrowUp')accel=true;if(e.key==='ArrowDown')braking=true;if(e.key==='ArrowLeft')left=true;if(e.key==='ArrowRight')right=true;if(e.key.toLowerCase()==='d')toggleDoors()});
window.addEventListener('keyup',e=>{if(e.key==='ArrowUp')accel=false;if(e.key==='ArrowDown')braking=false;if(e.key==='ArrowLeft')left=false;if(e.key==='ArrowRight')right=false});

function startGame(){running=true;mode=$('.mode.active').dataset.mode;speed=0;x=0;lane=0;score=100;passengers=8;stopIndex=1;doors=false;atStop=false;stoppedHandled=false;$('#setup').classList.add('hidden');$('#game').classList.remove('hidden');$('#driverControls').classList.toggle('hidden',mode!=='driver');$('#rideControls').classList.toggle('hidden',mode!=='ride');$('#hudService').textContent=$('#service').value;updateHud();announce(mode==='driver'?'Start when safe. Doors must be closed!':'Tap Enable GPS when you are on the bus.');requestAnimationFrame(loop)}
function toggleDoors(){if(speed>1){score=Math.max(0,score-10);announce('⚠️ Stop the bus before opening doors!');return}doors=!doors;$('#doorBtn').textContent=doors?'🚪 Close doors':'🚪 Open doors';$('#doorStatus').textContent=doors?'Open':'Closed';if(doors&&atStop&&!stoppedHandled){stoppedHandled=true;const off=Math.floor(Math.random()*4), on=2+Math.floor(Math.random()*6);passengers=Math.max(0,passengers-off)+on;score=Math.min(999,score+8);announce(`✅ Stop served! ${on} boarded, ${off} alighted.`);setTimeout(()=>{stopIndex=Math.min(stops.length-1,stopIndex+1);atStop=false;stoppedHandled=false;updateHud();},1600)}}
function announce(t){$('#announcement').textContent=t;if(sound&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/[✅⚠️🔔]/g,''));u.rate=1.05;u.pitch=1.05;speechSynthesis.speak(u)}}
function updateHud(){$('#speed').textContent=Math.round(speed);$('#score').textContent=Math.round(score);$('#passengers').textContent=passengers;$('#nextStop').textContent=stops[stopIndex]||'Terminus';$('#scheduleStatus').textContent=score>80?'On time':score>55?'A little late':'Delayed';$('#missionText').textContent=atStop?'Stop fully and open the doors.':'Drive safely to '+stops[stopIndex]+'.';$('#fact').textContent=facts[stopIndex%facts.length]}
function loop(t){if(!running)return;const dt=Math.min(.05,(t-last)/1000);last=t;if(mode==='driver')physics(dt);draw();updateHud();requestAnimationFrame(loop)}
function physics(dt){const difficulty=$('#difficulty').value;const limit=difficulty==='easy'?45:40;if(doors&&accel){score-=15*dt;speed=0;announceOnce('doorMove','⚠️ Close the doors before moving!')}else{if(accel)speed+=18*dt;if(braking)speed-=30*dt;speed-=3.5*dt;speed=Math.max(0,Math.min(58,speed))}if(left)lane-=.75*dt;if(right)lane+=.75*dt;lane=Math.max(-1,Math.min(1,lane));if(Math.abs(lane)>.75)score-=4*dt;if(speed>limit)score-=2.5*dt;x+=speed*dt*1.05;const nextStopX=240+stopIndex*330;const dist=nextStopX-x;atStop=dist<55&&dist>-35;if(atStop&&speed<1&&!doors)announceOnce('stop'+stopIndex,'🟨 Perfect position. Open the doors.');if(dist<-50&&!stoppedHandled){score-=12;stopIndex=Math.min(stops.length-1,stopIndex+1);announce('⚠️ You missed a bus stop!');}if(stopIndex===stops.length-1&&x>240+stopIndex*330+80){announce('🏁 Journey complete! Great work, Bus Captain!');running=false}}
const once=new Set();function announceOnce(k,t){if(!once.has(k)){once.add(k);announce(t)}}

function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);let grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#8fd3ff');grad.addColorStop(.48,'#cfeec1');grad.addColorStop(.49,'#59626b');grad.addColorStop(1,'#343a40');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 // skyline
 ctx.fillStyle='#d9e1e8';for(let i=0;i<11;i++){const bx=(i*115-(x*.12)%115)-20,bh=65+(i%4)*28;ctx.fillRect(bx,205-bh,80,bh);ctx.fillStyle='#8799a8';for(let yy=150-bh;yy<190;yy+=18)ctx.fillRect(bx+12,yy+12,8,8);ctx.fillStyle='#d9e1e8'}
 // road markings
 ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.setLineDash([34,28]);for(const yy of[382,492]){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w,yy);ctx.stroke()}ctx.setLineDash([]);
 // bus stops along world
 for(let i=1;i<stops.length;i++){const sx=240+i*330-x;if(sx>-120&&sx<w+120)drawStop(sx,318,i)}
 // traffic cars
 for(let i=0;i<5;i++){const cx=((i*260+500-x*.7)%(w+400))-180,cy=424+(i%2)*105;drawCar(cx,cy,i%2?'#d9485f':'#2878c8')}
 drawBus(420,430+lane*53);
 // speed-limit sign
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(80,90,35,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e23';ctx.lineWidth=7;ctx.stroke();ctx.fillStyle='#111';ctx.font='bold 28px system-ui';ctx.textAlign='center';ctx.fillText('40',80,100);ctx.textAlign='left';
}
function drawStop(sx,y,i){ctx.fillStyle='#f4c20d';ctx.fillRect(sx-52,y+88,110,10);ctx.fillStyle='#214c32';ctx.fillRect(sx+30,y-18,8,104);ctx.fillStyle='#fff';ctx.fillRect(sx+8,y-42,54,34);ctx.strokeStyle='#214c32';ctx.lineWidth=3;ctx.strokeRect(sx+8,y-42,54,34);ctx.fillStyle='#214c32';ctx.font='bold 15px system-ui';ctx.fillText('BUS',sx+17,y-20);ctx.fillStyle='#fff';ctx.fillRect(sx-60,y+4,78,6);ctx.fillRect(sx-55,y+10,6,62);ctx.fillRect(sx+10,y+10,6,62)}
function drawBus(bx,by){ctx.save();ctx.translate(bx,by);ctx.fillStyle='#f7b500';roundRect(-130,-55,260,94,16);ctx.fill();ctx.fillStyle='#202b35';ctx.fillRect(-110,-40,188,38);ctx.fillStyle='#bfe9ff';for(let i=0;i<5;i++)ctx.fillRect(-100+i*39,-34,31,26);ctx.fillStyle='#fff';ctx.font='bold 18px system-ui';ctx.fillText($('#service').value,86,-14);ctx.fillStyle='#151515';for(const wx of[-78,78]){ctx.beginPath();ctx.arc(wx,40,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#777';ctx.beginPath();ctx.arc(wx,40,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#151515'}ctx.restore()}
function drawCar(cx,cy,c){ctx.fillStyle=c;roundRect(cx,cy-28,92,38,10);ctx.fill();ctx.fillStyle='#bfe9ff';ctx.fillRect(cx+16,cy-22,45,14);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(cx+20,cy+12,10,0,Math.PI*2);ctx.arc(cx+72,cy+12,10,0,Math.PI*2);ctx.fill()}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

async function enableGps(){if(!navigator.geolocation){announce('GPS is not available on this device.');return}$('#gpsBtn').textContent='GPS active';$('#gpsBanner').classList.remove('hidden');gpsWatch=navigator.geolocation.watchPosition(p=>{const cur={lat:p.coords.latitude,lon:p.coords.longitude,t:p.timestamp};if(lastGps){const d=haversine(lastGps.lat,lastGps.lon,cur.lat,cur.lon);const dt=Math.max(1,(cur.t-lastGps.t)/1000);if(d<300){gpsDistance+=d;x+=d*1.5;speed=Math.min(80,(d/dt)*3.6);const virtualStopEvery=520;if(gpsDistance>stopIndex*virtualStopEvery){atStop=true;if(speed<4)announceOnce('gpsStop'+stopIndex,'📍 You are near the next virtual stop. Look outside for the real bus stop!')}}}lastGps=cur;updateHud()},e=>announce('Location permission is needed for Ride-Along mode.'),{enableHighAccuracy:true,maximumAge:3000,timeout:10000})}
function haversine(a,b,c,d){const R=6371000,toRad=x=>x*Math.PI/180;const p1=toRad(a),p2=toRad(c),dp=toRad(c-a),dl=toRad(d-b);const q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
