/**
 * Cloudflare Worker route-data proxy for Bus Captain SG V6.
 * Add LTA_ACCOUNT_KEY as a Worker secret. Never put it in browser JavaScript.
 */
const LTA='https://datamall2.mytransport.sg/ltaodataservice';

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname!=='/api/route') return new Response('Not found',{status:404});
    const service=(url.searchParams.get('service')||'').trim();
    const dirParam=Number(url.searchParams.get('direction')||0);
    if(!service) return json({error:'service required'},400);
    if(!env.LTA_ACCOUNT_KEY) return json({error:'LTA_ACCOUNT_KEY secret is not configured'},500);
    const [routes,stops]=await Promise.all([
      fetchAll('BusRoutes',env.LTA_ACCOUNT_KEY),
      fetchAll('BusStops',env.LTA_ACCOUNT_KEY)
    ]);
    const stopMap=new Map(stops.map(s=>[s.BusStopCode,s]));
    const matched=routes.filter(r=>String(r.ServiceNo).toUpperCase()===service.toUpperCase());
    const dirs=[...new Set(matched.map(r=>Number(r.Direction)))].sort();
    const build=d=>({direction:d,stops:matched.filter(r=>Number(r.Direction)===d).sort((a,b)=>Number(a.StopSequence)-Number(b.StopSequence)).map(r=>{
      const s=stopMap.get(r.BusStopCode)||{};
      return {code:r.BusStopCode,description:s.Description||r.BusStopCode,lat:Number(s.Latitude),lng:Number(s.Longitude),sequence:Number(r.StopSequence),distanceKm:Number(r.Distance)};
    }).filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng))});
    if(dirParam) return json({service,route:build(dirParam)});
    return json({service,directions:dirs.map(build)});
  }
};
async function fetchAll(name,key){
  const all=[];
  for(let skip=0;skip<30000;skip+=500){
    const r=await fetch(`${LTA}/${name}?$skip=${skip}`,{headers:{AccountKey:key,accept:'application/json'}});
    if(!r.ok) throw new Error(`${name} ${r.status}`);
    const j=await r.json(),batch=j.value||[];all.push(...batch);if(batch.length<500)break;
  }
  return all;
}
function json(v,status=200){return new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'public,max-age=3600'}})}
