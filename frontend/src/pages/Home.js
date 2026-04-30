import React,{useEffect,useState,useRef} from "react";
import {Link,useNavigate} from "react-router-dom";
import {restAPI,offerAPI} from "../utils/api";

const SORT_OPTIONS=[{val:"",label:"Relevance"},{val:"rating",label:"Rating"},{val:"delivery",label:"Fastest"},{val:"cost_asc",label:"Cost: Low"}];

export default function Home(){
  const [restaurants,setRestaurants]=useState([]);
  const [categories,setCategories]=useState([]);
  const [offers,setOffers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [activeCategory,setActiveCategory]=useState("");
  const [vegOnly,setVegOnly]=useState(false);
  const [sort,setSort]=useState("");
  const [bannerIdx,setBannerIdx]=useState(0);
  const navigate=useNavigate();

  useEffect(()=>{
    Promise.all([restAPI.getAll(),restAPI.getCategories(),offerAPI.getAll()])
      .then(([r,c,o])=>{setRestaurants(r.data);setCategories(c.data);setOffers(o.data);})
      .finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{
    restAPI.getAll({category:activeCategory||undefined,veg:vegOnly||undefined,sort:sort||undefined})
      .then(r=>setRestaurants(r.data));
  },[activeCategory,vegOnly,sort]);

  useEffect(()=>{if(!offers.length)return;const t=setInterval(()=>setBannerIdx(i=>(i+1)%offers.length),4000);return()=>clearInterval(t);},[offers]);

  const promoted=restaurants.filter(r=>r.isPromoted);
  const regular=restaurants.filter(r=>!r.isPromoted);

  return(
    <div style={s.page}>
      {/* ── HERO BANNER ── */}
      <div style={s.hero}>
        <div style={s.heroOverlay}/>
        <div style={s.heroContent}>
          <div style={s.heroLeft}>
            <div style={s.heroBadge}>
              <span style={s.heroBadgeDot}/>
              <span>Live delivery in your area</span>
            </div>
            <h1 style={s.heroH1}>
              Hungry?<br/>
              <span style={s.heroAccent}>We deliver</span><br/>
              in minutes.
            </h1>
            <p style={s.heroP}>Hot food from 500+ restaurants, delivered fast to your door. Real-time tracking, exclusive deals, zero hassle.</p>
            <div style={s.heroButtons}>
              <button style={s.heroOrderBtn} onClick={()=>document.getElementById("restaurants").scrollIntoView({behavior:"smooth"})}>
                🍔 Order Now
              </button>
              <Link to="/offers" style={s.heroOffersBtn}>🏷️ See Offers</Link>
            </div>
            <div style={s.heroStats}>
              {[["30 min","Avg. Delivery"],["500+","Restaurants"],["50K+","Happy Orders"],["4.8★","Avg. Rating"]].map(([v,l])=>(
                <div key={l} style={s.heroStat}><span style={s.heroStatVal}>{v}</span><span style={s.heroStatLabel}>{l}</span></div>
              ))}
            </div>
          </div>
          <div style={s.heroRight}>
            <div style={s.heroCard}>
              <div style={s.heroCardHeader}>
                <div style={s.heroCardIcon}>🛵</div>
                <div>
                  <p style={s.heroCardTitle}>Your order is on the way!</p>
                  <p style={s.heroCardSub}>Arjun · 3 min away</p>
                </div>
                <div style={s.livePill}><span style={s.liveDot}/>LIVE</div>
              </div>
              <div style={s.heroProgress}>
                {["Placed","Confirmed","Preparing","On Way","Delivered"].map((st,i)=>(
                  <div key={st} style={s.heroProgressStep}>
                    <div style={{...s.heroProgressDot,background:i<=3?"var(--orange)":"var(--bg3)",boxShadow:i===3?"0 0 0 4px rgba(255,87,34,0.25)":"none"}}/>
                    {i<4&&<div style={{...s.heroProgressLine,background:i<3?"var(--orange)":"var(--bg3)"}}/>}
                    <span style={{...s.heroProgressLabel,color:i<=3?"var(--text)":"var(--text3)"}}>{st}</span>
                  </div>
                ))}
              </div>
              <div style={s.heroCardFood}>
                {["🍕","🍔","🍱","🌮","🍛","🥡","🥗"].map((e,i)=>(
                  <div key={i} style={{...s.foodFloat,animationDelay:`${i*0.45}s`}}>{e}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OFFER BANNER STRIP ── */}
      {offers.length>0&&(
        <div style={s.offerStrip}>
          <div style={s.offerStripInner}>
            {offers.map((o,i)=>(
              <div key={o.id} style={{...s.offerSlide,opacity:i===bannerIdx?1:0,transform:i===bannerIdx?"translateY(0)":"translateY(8px)",pointerEvents:i===bannerIdx?"auto":"none"}}>
                <span style={s.offerEmoji}>{o.emoji}</span>
                <span style={s.offerDesc}>{o.description}</span>
                <code style={s.offerCodeTag}>{o.code}</code>
              </div>
            ))}
          </div>
          <div style={s.offerDots}>
            {offers.map((_,i)=>(
              <button key={i} style={{...s.offerDot,background:i===bannerIdx?"var(--orange)":"var(--border2)"}} onClick={()=>setBannerIdx(i)}/>
            ))}
          </div>
          <Link to="/offers" style={s.offerStripLink}>All offers →</Link>
        </div>
      )}

      {/* ── CATEGORY QUICK PICKS ── */}
      <div style={s.section}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>What are you craving?</h2>
        </div>
        <div style={s.categoryGrid}>
          {categories.map(cat=>(
            <button key={cat.id}
              style={{...s.catCard,...(activeCategory===cat.id?s.catCardActive:{})}}
              onClick={()=>setActiveCategory(activeCategory===cat.id?"":cat.id)}>
              <div style={{...s.catIcon,background:cat.color+"18",color:cat.color}}>{cat.icon}</div>
              <span style={s.catName}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={s.filterBar}>
        <div style={s.filterBarInner}>
          <div style={s.filterLeft}>
            <button style={{...s.filterChip,...(vegOnly?s.filterChipActive:{})}} onClick={()=>setVegOnly(!vegOnly)}>
              <span style={{...s.vegDot,background:"var(--green)"}}/>Pure Veg
            </button>
            {SORT_OPTIONS.map(opt=>(
              <button key={opt.val} style={{...s.filterChip,...(sort===opt.val?s.filterChipActive:{})}} onClick={()=>setSort(opt.val===sort?"":opt.val)}>
                {opt.label}
              </button>
            ))}
          </div>
          <span style={s.filterCount}>{restaurants.length} restaurants</span>
        </div>
      </div>

      {/* ── PROMOTED ── */}
      {promoted.length>0&&!loading&&(
        <div style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>⚡ Sponsored</h2>
          </div>
          <div style={s.promoGrid}>
            {promoted.map(r=><RestCard key={r.id} r={r} promoted/>)}
          </div>
        </div>
      )}

      {/* ── ALL RESTAURANTS ── */}
      <div style={s.section} id="restaurants">
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>All Restaurants</h2>
          {activeCategory&&<button style={s.clearBtn} onClick={()=>setActiveCategory("")}>Clear filter ✕</button>}
        </div>
        {loading?(
          <div style={s.grid}>{[...Array(8)].map((_,i)=><SkeletonCard key={i}/>)}</div>
        ):(
          <div style={s.grid}>
            {regular.map(r=><RestCard key={r.id} r={r}/>)}
          </div>
        )}
        {!loading&&restaurants.length===0&&(
          <div style={s.empty}>
            <p style={{fontSize:56}}>🍽️</p>
            <p style={{color:"var(--text2)",fontSize:18,marginTop:12}}>No restaurants match your filters</p>
            <button style={s.emptyBtn} onClick={()=>{setActiveCategory("");setVegOnly(false);setSort("");}}>Reset filters</button>
          </div>
        )}
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={s.howSection}>
        <div style={s.howInner}>
          <h2 style={s.howTitle}>How RapidRush works</h2>
          <div style={s.howGrid}>
            {[
              {icon:"📍",step:"1",title:"Set your location",desc:"Tell us where you want your food delivered"},
              {icon:"🍔",step:"2",title:"Choose your food",desc:"Browse 500+ restaurants and pick your favourites"},
              {icon:"💳",step:"3",title:"Pay securely",desc:"Multiple payment options — cash, card, UPI, wallet"},
              {icon:"🛵",step:"4",title:"Track live",desc:"Watch your rider on the live map in real time"},
            ].map(h=>(
              <div key={h.step} style={s.howCard}>
                <div style={s.howStep}>{h.step}</div>
                <div style={s.howIcon}>{h.icon}</div>
                <h3 style={s.howCardTitle}>{h.title}</h3>
                <p style={s.howCardDesc}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}`}</style>
    </div>
  );
}

function RestCard({r,promoted}){
  const [hov,setHov]=useState(false);
  return(
    <Link to={"/restaurant/"+r.id} style={{...s.card,...(hov?s.cardHov:{}),textDecoration:"none"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={s.cardImg}>
        <div style={s.cardEmoji}>{r.image}</div>
        <div style={s.cardImgGradient}/>
        {r.badge&&<span style={s.cardBadge}>{r.badge}</span>}
        {r.discount&&<span style={s.cardDiscount}>{r.discount}</span>}
        {r.isPureVeg&&<span style={s.vegBadge}>🌿 Pure Veg</span>}
        {promoted&&<span style={s.promoBadge}>Promoted</span>}
        {!r.isOpen&&<div style={s.closedOverlay}><span>Closed</span></div>}
      </div>
      <div style={s.cardBody}>
        <div style={s.cardRow1}>
          <h3 style={s.cardName}>{r.name}</h3>
          <div style={s.cardRating}>
            <span style={{color:"var(--gold)",fontSize:13}}>★</span>
            <span style={s.ratingNum}>{r.rating}</span>
            <span style={s.ratingCnt}>({r.totalReviews})</span>
          </div>
        </div>
        <p style={s.cardCuisine}>{r.cuisine}</p>
        <div style={s.cardTags}>{(r.tags||[]).slice(0,3).map(t=><span key={t} style={s.tag}>{t}</span>)}</div>
        <div style={s.cardRow2}>
          <div style={s.delivInfo}>
            <span style={s.delivTime}>🕒 {r.deliveryTime}</span>
            <span style={s.delivDot}>·</span>
            <span style={r.deliveryFee===0?s.freeDel:s.paidDel}>{r.deliveryFee===0?"Free delivery":"₹"+r.deliveryFee+" delivery"}</span>
          </div>
          <span style={s.minOrd}>Min ₹{r.minOrder}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard(){
  return(
    <div style={s.skeleton}>
      <div style={s.skelImg}/>
      <div style={{padding:16}}>
        <div style={{...s.skelLine,width:"65%",height:14}}/>
        <div style={{...s.skelLine,width:"45%",height:11,marginTop:8}}/>
        <div style={{...s.skelLine,width:"80%",height:11,marginTop:8}}/>
      </div>
    </div>
  );
}

const s={
  page:{background:"var(--bg)",minHeight:"100vh"},
  hero:{background:"linear-gradient(135deg,#0D0D18 0%,#110A18 50%,#0D0D18 100%)",padding:"60px 40px 50px",position:"relative",overflow:"hidden"},
  heroOverlay:{position:"absolute",inset:0,background:"radial-gradient(ellipse at 70% 50%,rgba(255,87,34,0.08) 0%,transparent 60%)",pointerEvents:"none"},
  heroContent:{maxWidth:1280,margin:"0 auto",display:"flex",gap:60,alignItems:"center"},
  heroLeft:{flex:1},
  heroBadge:{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.25)",color:"var(--green)",padding:"6px 14px",borderRadius:50,fontSize:12,fontWeight:700,marginBottom:24},
  heroBadgeDot:{width:7,height:7,borderRadius:"50%",background:"var(--green)",animation:"pulse-ring 2s infinite"},
  heroH1:{fontSize:60,fontWeight:800,lineHeight:1.08,margin:"0 0 18px",fontFamily:"var(--font-display)",color:"var(--text)"},
  heroAccent:{background:"linear-gradient(90deg,var(--orange),var(--orange2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  heroP:{color:"var(--text2)",fontSize:17,lineHeight:1.65,margin:"0 0 32px",maxWidth:480},
  heroButtons:{display:"flex",gap:12,marginBottom:40},
  heroOrderBtn:{background:"linear-gradient(135deg,var(--orange),var(--orange2))",border:"none",color:"#fff",padding:"15px 32px",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 28px rgba(255,87,34,0.4)",fontFamily:"var(--font-body)"},
  heroOffersBtn:{display:"flex",alignItems:"center",textDecoration:"none",background:"rgba(255,255,255,0.06)",border:"1px solid var(--border2)",color:"var(--text)",padding:"15px 28px",borderRadius:14,fontSize:15,fontWeight:600},
  heroStats:{display:"flex",gap:36},
  heroStat:{display:"flex",flexDirection:"column",gap:3},
  heroStatVal:{fontSize:20,fontWeight:800,color:"var(--text)",fontFamily:"var(--font-display)"},
  heroStatLabel:{fontSize:11,color:"var(--text3)"},
  heroRight:{flexShrink:0,width:340},
  heroCard:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:24,backdropFilter:"blur(10px)"},
  heroCardHeader:{display:"flex",alignItems:"center",gap:12,marginBottom:20},
  heroCardIcon:{fontSize:32,background:"rgba(255,87,34,0.15)",border:"1px solid rgba(255,87,34,0.3)",borderRadius:12,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center"},
  heroCardTitle:{fontSize:14,fontWeight:700,color:"var(--text)",margin:"0 0 2px"},
  heroCardSub:{fontSize:12,color:"var(--text3)",margin:0},
  livePill:{display:"flex",alignItems:"center",gap:5,background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.25)",color:"var(--green)",padding:"4px 10px",borderRadius:50,fontSize:10,fontWeight:800,marginLeft:"auto"},
  liveDot:{width:6,height:6,borderRadius:"50%",background:"var(--green)",animation:"pulse-ring 1.5s infinite"},
  heroProgress:{display:"flex",alignItems:"flex-start",gap:0,marginBottom:20},
  heroProgressStep:{display:"flex",flexDirection:"column",alignItems:"center",flex:1,position:"relative"},
  heroProgressDot:{width:12,height:12,borderRadius:"50%",flexShrink:0,zIndex:1,transition:"all 0.3s"},
  heroProgressLine:{position:"absolute",top:5,left:"50%",width:"100%",height:2,transition:"background 0.3s"},
  heroProgressLabel:{fontSize:9,marginTop:6,color:"var(--text3)",textAlign:"center"},
  heroCardFood:{display:"flex",gap:8,flexWrap:"wrap",marginTop:4},
  foodFloat:{fontSize:28,animation:"float 3s ease-in-out infinite",cursor:"default"},
  offerStrip:{background:"linear-gradient(90deg,rgba(255,87,34,0.08),rgba(255,138,101,0.05))",borderTop:"1px solid rgba(255,87,34,0.12)",borderBottom:"1px solid rgba(255,87,34,0.12)",padding:"12px 40px",display:"flex",alignItems:"center",gap:20,position:"relative",height:48,overflow:"hidden"},
  offerStripInner:{flex:1,position:"relative"},
  offerSlide:{position:"absolute",top:0,left:0,display:"flex",alignItems:"center",gap:12,transition:"all 0.5s ease",lineHeight:"24px"},
  offerEmoji:{fontSize:18},
  offerDesc:{fontSize:13,fontWeight:500,color:"var(--text)"},
  offerCodeTag:{background:"rgba(255,87,34,0.15)",border:"1px solid rgba(255,87,34,0.3)",color:"var(--orange)",padding:"2px 10px",borderRadius:6,fontSize:12,fontWeight:800,letterSpacing:1},
  offerDots:{display:"flex",gap:5},
  offerDot:{width:6,height:6,borderRadius:"50%",border:"none",cursor:"pointer",padding:0},
  offerStripLink:{color:"var(--orange)",textDecoration:"none",fontSize:13,fontWeight:700,flexShrink:0},
  section:{maxWidth:1280,margin:"0 auto",padding:"40px 40px 0"},
  sectionHead:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20},
  sectionTitle:{fontSize:22,fontWeight:800,color:"var(--text)",fontFamily:"var(--font-display)"},
  clearBtn:{background:"rgba(255,87,34,0.08)",border:"1px solid rgba(255,87,34,0.2)",color:"var(--orange)",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"},
  categoryGrid:{display:"flex",gap:12,overflowX:"auto",paddingBottom:8},
  catCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"14px 18px",borderRadius:16,border:"1px solid var(--border)",background:"var(--card)",cursor:"pointer",transition:"all 0.2s",flexShrink:0,minWidth:80},
  catCardActive:{border:"1px solid rgba(255,87,34,0.4)",background:"rgba(255,87,34,0.08)"},
  catIcon:{width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22},
  catName:{fontSize:12,fontWeight:600,color:"var(--text2)",whiteSpace:"nowrap"},
  filterBar:{background:"rgba(9,9,14,0.8)",backdropFilter:"blur(10px)",borderBottom:"1px solid var(--border)",position:"sticky",top:96,zIndex:50,marginTop:32},
  filterBarInner:{maxWidth:1280,margin:"0 auto",padding:"12px 40px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  filterLeft:{display:"flex",gap:8,flexWrap:"wrap"},
  filterChip:{padding:"7px 16px",borderRadius:50,border:"1px solid var(--border2)",background:"transparent",color:"var(--text2)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:6},
  filterChipActive:{background:"rgba(255,87,34,0.12)",border:"1px solid rgba(255,87,34,0.35)",color:"var(--orange)"},
  vegDot:{width:8,height:8,borderRadius:"50%",display:"inline-block"},
  filterCount:{fontSize:12,color:"var(--text3)",fontWeight:500},
  promoGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20,marginBottom:40},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:20,padding:"0 0 40px"},
  card:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,overflow:"hidden",transition:"all 0.25s",display:"block"},
  cardHov:{transform:"translateY(-3px)",border:"1px solid rgba(255,87,34,0.2)",boxShadow:"0 12px 40px rgba(0,0,0,0.5)"},
  cardImg:{height:155,background:"linear-gradient(135deg,#1a1a28,#110E1C)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"},
  cardEmoji:{fontSize:70,zIndex:1},
  cardImgGradient:{position:"absolute",bottom:0,left:0,right:0,height:50,background:"linear-gradient(transparent,rgba(17,17,25,0.7))"},
  cardBadge:{position:"absolute",top:10,left:10,background:"rgba(255,214,0,0.12)",border:"1px solid rgba(255,214,0,0.3)",color:"var(--gold)",padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:800,zIndex:2},
  cardDiscount:{position:"absolute",top:10,right:10,background:"rgba(0,200,83,0.12)",border:"1px solid rgba(0,200,83,0.3)",color:"var(--green)",padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:800,zIndex:2},
  vegBadge:{position:"absolute",bottom:10,left:10,background:"rgba(0,200,83,0.12)",border:"1px solid rgba(0,200,83,0.25)",color:"var(--green)",padding:"3px 10px",borderRadius:6,fontSize:9,fontWeight:700,zIndex:2},
  promoBadge:{position:"absolute",bottom:10,right:10,background:"rgba(41,121,255,0.12)",border:"1px solid rgba(41,121,255,0.3)",color:"var(--blue)",padding:"3px 10px",borderRadius:6,fontSize:9,fontWeight:700,zIndex:2},
  closedOverlay:{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"var(--red)",zIndex:3},
  cardBody:{padding:"14px 18px 18px"},
  cardRow1:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3},
  cardName:{fontSize:16,fontWeight:800,color:"var(--text)",margin:0,fontFamily:"var(--font-display)"},
  cardRating:{display:"flex",alignItems:"center",gap:3,flexShrink:0},
  ratingNum:{fontSize:13,fontWeight:800,color:"var(--text)"},
  ratingCnt:{fontSize:10,color:"var(--text3)"},
  cardCuisine:{fontSize:12,color:"var(--text3)",margin:"0 0 8px"},
  cardTags:{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12},
  tag:{background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text3)",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:500},
  cardRow2:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  delivInfo:{display:"flex",alignItems:"center",gap:5},
  delivTime:{fontSize:12,color:"var(--text2)",fontWeight:500},
  delivDot:{color:"var(--text3)"},
  freeDel:{fontSize:12,color:"var(--green)",fontWeight:700},
  paidDel:{fontSize:12,color:"var(--text3)"},
  minOrd:{fontSize:10,color:"var(--text3)"},
  skeleton:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,overflow:"hidden"},
  skelImg:{height:155,background:"linear-gradient(90deg,var(--bg3) 25%,var(--bg2) 50%,var(--bg3) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"},
  skelLine:{background:"rgba(255,255,255,0.04)",borderRadius:5},
  empty:{textAlign:"center",padding:"80px 0 40px"},
  emptyBtn:{marginTop:16,background:"rgba(255,87,34,0.08)",border:"1px solid rgba(255,87,34,0.2)",color:"var(--orange)",padding:"10px 24px",borderRadius:10,fontWeight:600,cursor:"pointer"},
  howSection:{background:"var(--bg2)",borderTop:"1px solid var(--border)",marginTop:40,padding:"60px 40px"},
  howInner:{maxWidth:1280,margin:"0 auto"},
  howTitle:{fontSize:28,fontWeight:800,color:"var(--text)",margin:"0 0 36px",fontFamily:"var(--font-display)"},
  howGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24},
  howCard:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,padding:"28px 24px"},
  howStep:{display:"inline-block",background:"rgba(255,87,34,0.1)",color:"var(--orange)",fontWeight:800,fontSize:11,letterSpacing:1,padding:"4px 10px",borderRadius:6,marginBottom:16},
  howIcon:{fontSize:40,marginBottom:14},
  howCardTitle:{fontSize:16,fontWeight:700,color:"var(--text)",margin:"0 0 8px"},
  howCardDesc:{fontSize:13,color:"var(--text3)",lineHeight:1.6},
};
