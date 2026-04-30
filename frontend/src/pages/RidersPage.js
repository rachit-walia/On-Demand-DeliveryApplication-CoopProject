import React,{useEffect,useState,useRef,useCallback} from "react";
import {riderAPI,restAPI as restaurantAPI} from "../utils/api";

const toRad=d=>d*Math.PI/180;
function haversine(a,b,c,d){const R=6371,dL=toRad(c-a),dN=toRad(d-b);const x=Math.sin(dL/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dN/2)**2;return parseFloat((R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(2));}
function project(lat,lng,bounds,W,H){return{x:((lng-bounds.minLng)/(bounds.maxLng-bounds.minLng))*(W-100)+50,y:((bounds.maxLat-lat)/(bounds.maxLat-bounds.minLat))*(H-100)+50};}
function getBounds(pts){const pad=0.012;return{minLat:Math.min(...pts.map(p=>p.lat))-pad,maxLat:Math.max(...pts.map(p=>p.lat))+pad,minLng:Math.min(...pts.map(p=>p.lng))-pad,maxLng:Math.max(...pts.map(p=>p.lng))+pad};}
function buildWps(from,to,steps=12){return Array.from({length:steps+2},(_,i)=>{const t=i/(steps+1),curve=Math.sin(t*Math.PI)*0.006;return{lat:from.lat+(to.lat-from.lat)*t+curve,lng:from.lng+(to.lng-from.lng)*t};});}

const W=800,H=520;

export default function RidersPage(){
  const [riders,setRiders]=useState([]);
  const [rests,setRests]=useState([]);
  const [selRider,setSelRider]=useState(null);
  const [selRest,setSelRest]=useState(null);
  const [route,setRoute]=useState(null);
  const [animPct,setAnimPct]=useState(0);
  const [riderFilter,setRiderFilter]=useState("all");
  const animRef=useRef(null);

  useEffect(()=>{
    Promise.all([riderAPI.getAll(),restaurantAPI.getAll()]).then(([r,rs])=>{setRiders(r.data);setRests(rs.data);});
  },[]);

  useEffect(()=>{
    if(!selRider||!selRest){setRoute(null);return;}
    const dist=haversine(selRider.lat,selRider.lng,selRest.lat,selRest.lng);
    const wps=buildWps({lat:selRider.lat,lng:selRider.lng},{lat:selRest.lat,lng:selRest.lng});
    setRoute({distanceKm:dist,estimatedMinutes:Math.round(dist*4+5),waypoints:wps});
    setAnimPct(0);
  },[selRider,selRest]);

  const startAnim=useCallback(()=>{
    cancelAnimationFrame(animRef.current);
    setAnimPct(0);
    let start=null;
    const run=ts=>{if(!start)start=ts;const p=Math.min((ts-start)/4000,1);setAnimPct(p);if(p<1)animRef.current=requestAnimationFrame(run);};
    animRef.current=requestAnimationFrame(run);
  },[]);

  useEffect(()=>{if(route)startAnim();},[route]);
  useEffect(()=>()=>cancelAnimationFrame(animRef.current),[]);

  const allPts=[...riders.map(r=>({lat:r.lat,lng:r.lng})),...rests.map(r=>({lat:r.lat,lng:r.lng}))];
  const bounds=allPts.length?getBounds(allPts):null;
  const proj=(lat,lng)=>bounds?project(lat,lng,bounds,W,H):{x:0,y:0};

  let animPos=null;
  if(route&&bounds){
    const wps=route.waypoints,total=wps.length-1;
    const ai=animPct*total,seg=Math.min(Math.floor(ai),total-1),t=ai-seg;
    const a=wps[seg],b=wps[seg+1];
    animPos=proj(a.lat+(b.lat-a.lat)*t,a.lng+(b.lng-a.lng)*t);
  }

  const nearest=selRest?[...riders].filter(r=>r.status==="available").sort((a,b)=>haversine(a.lat,a.lng,selRest.lat,selRest.lng)-haversine(b.lat,b.lng,selRest.lat,selRest.lng))[0]:null;
  const filteredRiders=riders.filter(r=>riderFilter==="all"?true:r.status===riderFilter);
  const available=riders.filter(r=>r.status==="available").length;
  const busy=riders.filter(r=>r.status==="busy").length;

  return(
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerGlow}/>
        <div style={s.headerContent}>
          <h1 style={s.title}>🛵 Live Delivery Tracker</h1>
          <p style={s.sub}>Select a rider and restaurant to simulate the delivery route with real-time distance calculation</p>
          <div style={s.headerStats}>
            {[["🛵",riders.length,"Total Riders"],["🟢",available,"Available"],["🔴",busy,"On Delivery"],["🍽️",rests.length,"Restaurants"]].map(([icon,val,label])=>(
              <div key={label} style={s.headerStat}>
                <span style={{fontSize:24}}>{icon}</span>
                <div><p style={s.headerStatVal}>{val}</p><p style={s.headerStatLabel}>{label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.layout}>
        {/* ── PANEL ── */}
        <div style={s.panel}>
          {/* Rider filter */}
          <div style={s.panelCard}>
            <div style={s.panelCardHead}>
              <h3 style={s.panelTitle}>Delivery Riders</h3>
              <div style={s.filterPills}>
                {["all","available","busy"].map(f=>(
                  <button key={f} style={{...s.filterPill,...(riderFilter===f?s.filterPillActive:{})}} onClick={()=>setRiderFilter(f)}>{f}</button>
                ))}
              </div>
            </div>
            <div style={s.riderList}>
              {filteredRiders.map(rider=>{
                const isSel=selRider?.id===rider.id;
                const isAvail=rider.status==="available";
                return(
                  <div key={rider.id}
                    style={{...s.riderCard,...(isSel?s.riderCardSel:{}),opacity:isAvail?1:0.55,cursor:isAvail?"pointer":"not-allowed"}}
                    onClick={()=>isAvail&&setSelRider(isSel?null:rider)}>
                    <div style={{...s.riderAvatar,background:isSel?"linear-gradient(135deg,var(--orange),var(--orange2))":"var(--bg3)"}}>
                      {rider.avatar}
                    </div>
                    <div style={s.riderInfo}>
                      <p style={s.riderName}>{rider.name}</p>
                      <p style={s.riderMeta}>{rider.vehicle} · ★{rider.rating} · {rider.completedOrders} trips</p>
                      <p style={s.riderMeta}>{rider.onlineHours}h online today</p>
                    </div>
                    <div style={s.riderRight}>
                      <span style={{...s.riderStatus,background:isAvail?"rgba(0,200,83,0.1)":"rgba(255,23,68,0.1)",color:isAvail?"var(--green)":"var(--red)"}}>
                        {isAvail?"Free":"Busy"}
                      </span>
                      {isSel&&<span style={{fontSize:10,color:"var(--orange)",fontWeight:800}}>SELECTED</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restaurant selector */}
          <div style={s.panelCard}>
            <h3 style={s.panelTitle}>Select Restaurant</h3>
            <div style={s.restGrid}>
              {rests.map(r=>(
                <button key={r.id} style={{...s.restBtn,...(selRest?.id===r.id?s.restBtnSel:{})}} onClick={()=>setSelRest(selRest?.id===r.id?null:r)}>
                  <span style={{fontSize:20}}>{r.image}</span>
                  <span style={{fontSize:11,fontWeight:600,color:selRest?.id===r.id?"var(--orange)":"var(--text3)"}}>{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Route details */}
          {route&&selRider&&selRest&&(
            <div style={s.routeCard}>
              <div style={s.routeCardHead}>
                <h3 style={s.panelTitle}>📍 Route Details</h3>
                {nearest?.id===selRider.id&&<span style={s.nearestTag}>⚡ Nearest rider</span>}
              </div>
              {[["From",selRider.name,"var(--green)"],["To",selRest.name,"var(--orange)"],["Distance",route.distanceKm+" km","var(--orange)"],["Est. Time","~"+route.estimatedMinutes+" min","var(--green)"],["Vehicle",selRider.vehicle,"var(--text2)"],["Rating","★"+selRider.rating,"var(--gold)"]].map(([l,v,c])=>(
                <div key={l} style={s.routeRow}><span style={s.routeLabel}>{l}</span><span style={{...s.routeVal,color:c}}>{v}</span></div>
              ))}
              <button style={s.replayBtn} onClick={startAnim}>▶ Replay Animation</button>
            </div>
          )}

          {!selRider&&<div style={s.hintBox}>👆 Select an available rider (green) to begin</div>}
          {selRider&&!selRest&&<div style={s.hintBox}>🍽️ Now select a restaurant destination</div>}
        </div>

        {/* ── MAP ── */}
        <div style={s.mapCard}>
          <div style={s.mapHeader}>
            <span style={s.mapTitle}>🗺️ Live Delivery Map</span>
            <div style={s.legend}>
              {[["var(--green)","Available"],["var(--red)","On Delivery"],["var(--orange)","Restaurant"],["var(--blue)","Route"]].map(([c,l])=>(
                <span key={l} style={s.legItem}><span style={{...s.legDot,background:c}}/>{l}</span>
              ))}
            </div>
          </div>

          <div style={{position:"relative"}}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={s.svg}>
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>

              {/* Road-like lines between points for realism */}
              {bounds&&riders.filter(r=>r.status==="available").slice(0,3).map((r,i)=>{
                const p=proj(r.lat,r.lng);
                const rp=rests[i%rests.length];
                if(!rp)return null;
                const rpp=proj(rp.lat,rp.lng);
                return <line key={r.id} x1={p.x} y1={p.y} x2={rpp.x} y2={rpp.y} stroke="rgba(255,255,255,0.03)" strokeWidth={1.5} strokeDasharray="6 8"/>;
              })}

              {/* Full dashed route */}
              {route&&bounds&&(
                <polyline points={route.waypoints.map(wp=>{const p=proj(wp.lat,wp.lng);return p.x+","+p.y;}).join(" ")}
                  fill="none" stroke="rgba(255,87,34,0.25)" strokeWidth={2.5} strokeDasharray="10 7"/>
              )}

              {/* Animated route line */}
              {route&&bounds&&(()=>{
                const wps=route.waypoints;
                const cut=Math.floor(animPct*(wps.length-1))+1;
                const pts=wps.slice(0,cut);
                if(pts.length<2)return null;
                return(
                  <polyline points={pts.map(wp=>{const p=proj(wp.lat,wp.lng);return p.x+","+p.y;}).join(" ")}
                    fill="none" stroke="var(--orange)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"
                    style={{filter:"drop-shadow(0 0 6px rgba(255,87,34,0.5))"}}/>
                );
              })()}

              {/* Distance markers on route */}
              {route&&bounds&&animPct>0.5&&(()=>{
                const mid=route.waypoints[Math.floor(route.waypoints.length/2)];
                const p=proj(mid.lat,mid.lng);
                return(
                  <g>
                    <rect x={p.x-30} y={p.y-14} width={60} height={22} rx={11} fill="rgba(10,10,20,0.85)" stroke="rgba(255,87,34,0.5)" strokeWidth={1}/>
                    <text x={p.x} y={p.y+3} textAnchor="middle" fontSize={10} fontWeight="800" fill="var(--orange)">{route.distanceKm}km</text>
                  </g>
                );
              })()}

              {/* Restaurant markers */}
              {bounds&&rests.map(r=>{
                const p=proj(r.lat,r.lng);
                const isSel=selRest?.id===r.id;
                return(
                  <g key={r.id} onClick={()=>setSelRest(selRest?.id===r.id?null:r)} style={{cursor:"pointer"}}>
                    {isSel&&<circle cx={p.x} cy={p.y} r={28} fill="rgba(255,87,34,0.08)" stroke="var(--orange)" strokeWidth={1.5} strokeDasharray="5 4"/>}
                    <circle cx={p.x} cy={p.y} r={isSel?20:14} fill={isSel?"var(--orange)":"var(--card)"} stroke="var(--orange)" strokeWidth={2} style={{filter:isSel?"drop-shadow(0 0 8px rgba(255,87,34,0.5))":"none"}}/>
                    <text x={p.x} y={p.y+5} textAnchor="middle" fontSize={isSel?15:11}>{r.image}</text>
                    <text x={p.x} y={p.y+(isSel?36:28)} textAnchor="middle" fontSize={9} fontWeight="700" fill="rgba(240,240,245,0.7)">{r.name.split(" ")[0]}</text>
                  </g>
                );
              })}

              {/* Rider markers */}
              {bounds&&riders.map(rider=>{
                const p=proj(rider.lat,rider.lng);
                const isSel=selRider?.id===rider.id;
                const isAvail=rider.status==="available";
                const clr=isAvail?"var(--green)":"var(--red)";
                return(
                  <g key={rider.id} onClick={()=>isAvail&&setSelRider(isSel?null:rider)} style={{cursor:isAvail?"pointer":"default"}}>
                    {isSel&&<circle cx={p.x} cy={p.y} r={24} fill="rgba(0,200,83,0.07)" stroke="var(--green)" strokeWidth={1.5} strokeDasharray="4 4"/>}
                    <circle cx={p.x} cy={p.y} r={isSel?16:12} fill={clr} stroke="var(--bg)" strokeWidth={2.5} style={{filter:isSel?`drop-shadow(0 0 8px ${clr})`:"none"}}/>
                    <text x={p.x} y={p.y+5} textAnchor="middle" fontSize={isSel?13:10}>🛵</text>
                    <text x={p.x} y={p.y+(isSel?30:24)} textAnchor="middle" fontSize={8} fontWeight="700" fill="rgba(240,240,245,0.6)">{rider.name.split(" ")[0]}</text>
                  </g>
                );
              })}

              {/* Animated rider dot */}
              {animPos&&animPct<1&&animPct>0&&(
                <g>
                  <circle cx={animPos.x} cy={animPos.y} r={18} fill="rgba(255,87,34,0.12)"/>
                  <circle cx={animPos.x} cy={animPos.y} r={14} fill="var(--orange)" stroke="var(--bg)" strokeWidth={2.5} style={{filter:"drop-shadow(0 0 10px rgba(255,87,34,0.7))"}}/>
                  <text x={animPos.x} y={animPos.y+5} textAnchor="middle" fontSize={11}>🛵</text>
                </g>
              )}
            </svg>

            {/* Route stats overlay */}
            {route&&(
              <div style={s.routeOverlay}>
                <div style={s.overlayItem}>
                  <span style={s.overlayVal}>{route.distanceKm}</span>
                  <span style={s.overlayLabel}>km</span>
                </div>
                <div style={s.overlayDivider}/>
                <div style={s.overlayItem}>
                  <span style={{...s.overlayVal,color:"var(--green)"}}>~{route.estimatedMinutes}</span>
                  <span style={s.overlayLabel}>min ETA</span>
                </div>
              </div>
            )}

            {/* Progress bar when animating */}
            {route&&animPct<1&&animPct>0&&(
              <div style={s.animProgress}>
                <div style={{...s.animProgressFill,width:(animPct*100)+"%"}}/>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s={
  page:{background:"var(--bg)",minHeight:"100vh",padding:"0 0 40px"},
  header:{position:"relative",overflow:"hidden",padding:"48px 40px 36px",background:"linear-gradient(160deg,#0F091A,#0A0912)"},
  headerGlow:{position:"absolute",top:-60,right:100,width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,87,34,0.08) 0%,transparent 70%)",pointerEvents:"none"},
  headerContent:{maxWidth:1280,margin:"0 auto",position:"relative",zIndex:1},
  title:{fontSize:30,fontWeight:800,color:"var(--text)",margin:"0 0 8px",fontFamily:"var(--font-display)"},
  sub:{color:"var(--text3)",fontSize:14,margin:"0 0 28px",maxWidth:560,lineHeight:1.6},
  headerStats:{display:"flex",gap:24},
  headerStat:{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",borderRadius:14,padding:"12px 18px"},
  headerStatVal:{fontSize:22,fontWeight:800,color:"var(--text)",margin:"0 0 2px",fontFamily:"var(--font-display)",lineHeight:1},
  headerStatLabel:{fontSize:10,color:"var(--text3)",margin:0},
  layout:{maxWidth:1280,margin:"0 auto",padding:"28px 40px 0",display:"flex",gap:20,alignItems:"flex-start"},
  panel:{width:310,flexShrink:0,display:"flex",flexDirection:"column",gap:14},
  panelCard:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"18px 16px"},
  panelCardHead:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14},
  panelTitle:{fontSize:13,fontWeight:800,color:"var(--text)",margin:0,textTransform:"uppercase",letterSpacing:"0.5px"},
  filterPills:{display:"flex",gap:5},
  filterPill:{padding:"3px 9px",borderRadius:20,border:"1px solid var(--border)",background:"transparent",color:"var(--text3)",fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize"},
  filterPillActive:{background:"rgba(255,87,34,0.1)",border:"1px solid rgba(255,87,34,0.3)",color:"var(--orange)"},
  riderList:{display:"flex",flexDirection:"column",gap:8},
  riderCard:{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,border:"1px solid transparent",transition:"all 0.2s"},
  riderCardSel:{border:"1px solid rgba(255,87,34,0.35)",background:"rgba(255,87,34,0.06)"},
  riderAvatar:{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff",flexShrink:0},
  riderInfo:{flex:1},
  riderName:{fontSize:13,fontWeight:700,color:"var(--text)",margin:"0 0 2px"},
  riderMeta:{fontSize:10,color:"var(--text3)",margin:"0 0 1px"},
  riderRight:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4},
  riderStatus:{padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:700},
  restGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
  restBtn:{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"10px 6px",borderRadius:12,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",transition:"all 0.15s"},
  restBtnSel:{border:"1px solid rgba(255,87,34,0.4)",background:"rgba(255,87,34,0.07)"},
  routeCard:{background:"var(--card)",border:"1px solid rgba(255,87,34,0.2)",borderRadius:18,padding:"18px 16px"},
  routeCardHead:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12},
  nearestTag:{background:"rgba(255,87,34,0.1)",border:"1px solid rgba(255,87,34,0.25)",color:"var(--orange)",padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:800},
  routeRow:{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)"},
  routeLabel:{fontSize:11,color:"var(--text3)"},
  routeVal:{fontSize:13,fontWeight:700},
  replayBtn:{marginTop:14,width:"100%",padding:"10px",background:"rgba(255,87,34,0.08)",border:"1px solid rgba(255,87,34,0.2)",borderRadius:10,color:"var(--orange)",fontWeight:700,cursor:"pointer",fontSize:13},
  hintBox:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:"16px",color:"var(--text3)",fontSize:12,textAlign:"center",lineHeight:1.6},
  mapCard:{flex:1,background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,overflow:"hidden"},
  mapHeader:{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"},
  mapTitle:{fontWeight:800,fontSize:14,color:"var(--text)"},
  legend:{display:"flex",gap:16},
  legItem:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--text3)"},
  legDot:{width:8,height:8,borderRadius:"50%",display:"inline-block"},
  svg:{display:"block",background:"var(--bg2)"},
  routeOverlay:{position:"absolute",bottom:16,right:16,background:"rgba(9,9,14,0.92)",border:"1px solid var(--border2)",borderRadius:14,padding:"12px 20px",display:"flex",gap:16,alignItems:"center",backdropFilter:"blur(10px)"},
  overlayItem:{display:"flex",alignItems:"baseline",gap:4},
  overlayVal:{fontSize:22,fontWeight:900,color:"var(--orange)",fontFamily:"var(--font-display)"},
  overlayLabel:{fontSize:11,color:"var(--text3)"},
  overlayDivider:{width:1,height:28,background:"var(--border)"},
  animProgress:{height:3,background:"var(--bg3)"},
  animProgressFill:{height:"100%",background:"linear-gradient(90deg,var(--orange),var(--orange2))",transition:"width 0.1s linear"},
};
