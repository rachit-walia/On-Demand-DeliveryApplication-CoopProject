import React,{useState,useEffect,useRef} from "react";
import {Link,useNavigate,useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useCart} from "../context/CartContext";
import {restAPI} from "../utils/api";

export default function Navbar(){
  const {user,logout}=useAuth();
  const {itemCount,total}=useCart();
  const navigate=useNavigate();
  const location=useLocation();
  const [scrolled,setScrolled]=useState(false);
  const [search,setSearch]=useState("");
  const [results,setResults]=useState(null);
  const [searching,setSearching]=useState(false);
  const [userMenu,setUserMenu]=useState(false);
  const searchRef=useRef();
  const timerRef=useRef();

  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>10);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  useEffect(()=>{setResults(null);setSearch("");},[location]);

  const handleSearch=e=>{
    const v=e.target.value;setSearch(v);
    clearTimeout(timerRef.current);
    if(!v.trim()){setResults(null);return;}
    setSearching(true);
    timerRef.current=setTimeout(async()=>{
      try{const r=await restAPI.search(v);setResults(r.data);}catch(_){}finally{setSearching(false);}
    },350);
  };

  const isActive=p=>location.pathname===p;

  return(
    <nav style={{...s.nav,...(scrolled?s.navScrolled:{})}}>
      {/* Top ticker */}
      <div style={s.ticker}>
        <div style={s.tickerInner}>
          {["⚡ Express delivery in 20 min","🎉 Use FIRST50 for 50% off","🛵 Track your rider live","⭐ 500+ restaurants near you","🏷️ New coupons every day"].map((t,i)=>(
            <span key={i} style={s.tickerItem}>{t}</span>
          ))}
          {["⚡ Express delivery in 20 min","🎉 Use FIRST50 for 50% off","🛵 Track your rider live","⭐ 500+ restaurants near you","🏷️ New coupons every day"].map((t,i)=>(
            <span key={"b"+i} style={s.tickerItem}>{t}</span>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <div style={s.main}>
        <div style={s.inner}>
          {/* Logo */}
          <Link to="/" style={s.logo}>
            <div style={s.logoBox}>
              <span style={{fontSize:18}}>⚡</span>
            </div>
            <div>
              <div style={s.logoText}>RapidRush</div>
              <div style={s.logoSub}>On-Demand Delivery</div>
            </div>
          </Link>

          {/* Location pill */}
          <div style={s.locationPill}>
            <span style={{fontSize:14}}>📍</span>
            <div>
              <div style={s.locLabel}>Deliver to</div>
              <div style={s.locCity}>Chandigarh, Sector 17</div>
            </div>
            <span style={{color:"var(--text3)",fontSize:10}}>▼</span>
          </div>

          {/* Search */}
          <div style={s.searchWrap} ref={searchRef}>
            <div style={s.searchBox}>
              <span style={{fontSize:16,color:"var(--text3)"}}>🔍</span>
              <input style={s.searchInput} placeholder="Search food, restaurants..." value={search} onChange={handleSearch} onFocus={()=>{if(search){}}} />
              {searching&&<div style={s.spinner}/>}
              {search&&<button style={s.clearSearch} onClick={()=>{setSearch("");setResults(null);}}>✕</button>}
            </div>
            {results&&(
              <div style={s.searchDrop}>
                {results.restaurants?.length>0&&(
                  <div>
                    <p style={s.searchSection}>Restaurants</p>
                    {results.restaurants.slice(0,4).map(r=>(
                      <div key={r.id} style={s.searchItem} onClick={()=>{navigate("/restaurant/"+r.id);setResults(null);setSearch("");}}>
                        <span style={{fontSize:22}}>{r.image}</span>
                        <div>
                          <p style={s.searchItemName}>{r.name}</p>
                          <p style={s.searchItemSub}>{r.cuisine} · {r.deliveryTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {results.items?.length>0&&(
                  <div>
                    <p style={s.searchSection}>Dishes</p>
                    {results.items.slice(0,4).map(item=>(
                      <div key={item.id} style={s.searchItem} onClick={()=>{navigate("/restaurant/"+item.restaurantId);setResults(null);setSearch("");}}>
                        <span style={{fontSize:22}}>{item.isVeg?"🥗":"🍖"}</span>
                        <div>
                          <p style={s.searchItemName}>{item.name}</p>
                          <p style={s.searchItemSub}>{item.restaurantName} · ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {results.restaurants?.length===0&&results.items?.length===0&&(
                  <p style={{color:"var(--text3)",padding:"16px",textAlign:"center",fontSize:13}}>No results found for "{search}"</p>
                )}
              </div>
            )}
          </div>

          {/* Nav links */}
          <div style={s.navLinks}>
            {[{to:"/offers",label:"🏷️ Offers"},{to:"/riders",label:"🛵 Track"}].map(l=>(
              <Link key={l.to} to={l.to} style={{...s.navLink,...(isActive(l.to)?s.navLinkActive:{})}}>{l.label}</Link>
            ))}
          </div>

          {/* Right */}
          <div style={s.right}>
            {user?(
              <>
                <Link to="/cart" style={s.cartBtn}>
                  <div style={s.cartIconWrap}>
                    <span style={{fontSize:18}}>🛒</span>
                    {itemCount>0&&<span style={s.cartBadge}>{itemCount}</span>}
                  </div>
                  <div style={s.cartInfo}>
                    <span style={s.cartLabel}>{itemCount>0?`${itemCount} item${itemCount>1?"s":""}`:"Cart"}</span>
                    {total>0&&<span style={s.cartTotal}>₹{total}</span>}
                  </div>
                </Link>
                <div style={s.userBtn} onClick={()=>setUserMenu(!userMenu)}>
                  <div style={s.userAvatar}>{user.name[0].toUpperCase()}</div>
                  <div style={s.userMeta}>
                    <span style={s.userGreet}>Hi, {user.name.split(" ")[0]}</span>
                    {user.loyaltyPoints>0&&<span style={s.userPts}>⭐{user.loyaltyPoints}pts</span>}
                  </div>
                  {userMenu&&(
                    <div style={s.userDropdown} onClick={e=>e.stopPropagation()}>
                      <div style={s.dropHead}><div style={s.dropAvatar}>{user.name[0].toUpperCase()}</div><div><p style={s.dropName}>{user.name}</p><p style={s.dropEmail}>{user.email}</p></div></div>
                      <div style={s.dropDivider}/>
                      {[{to:"/orders",icon:"📦",label:"My Orders"},{to:"/profile",icon:"👤",label:"Profile"},{to:"/offers",icon:"🏷️",label:"Offers & Coupons"},{to:"/riders",icon:"🛵",label:"Live Tracking"}].map(item=>(
                        <Link key={item.to} to={item.to} style={s.dropItem} onClick={()=>setUserMenu(false)}>{item.icon} {item.label}</Link>
                      ))}
                      <div style={s.dropDivider}/>
                      <button style={s.dropLogout} onClick={()=>{logout();navigate("/login");}}>🚪 Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ):(
              <div style={s.authBtns}>
                <Link to="/login" style={s.loginBtn}>Sign In</Link>
                <Link to="/register" style={s.signupBtn}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}.search-item:hover{background:rgba(255,255,255,0.05)!important;}.drop-item:hover{background:rgba(255,255,255,0.05)!important;}.nav-link:hover{color:var(--text)!important;}`}</style>
    </nav>
  );
}

const s={
  nav:{position:"sticky",top:0,zIndex:300,background:"rgba(9,9,14,0.85)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.05)"},
  navScrolled:{boxShadow:"0 4px 40px rgba(0,0,0,0.6)"},
  ticker:{background:"var(--orange)",overflow:"hidden",height:28},
  tickerInner:{display:"flex",width:"max-content",animation:"ticker 30s linear infinite",whiteSpace:"nowrap"},
  tickerItem:{padding:"0 40px",fontSize:11,fontWeight:700,color:"#fff",lineHeight:"28px",letterSpacing:"0.3px"},
  main:{},
  inner:{maxWidth:1400,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",gap:16},
  logo:{textDecoration:"none",display:"flex",alignItems:"center",gap:10,flexShrink:0},
  logoBox:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--orange),var(--orange2))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(255,87,34,0.4)"},
  logoText:{fontSize:17,fontWeight:800,color:"var(--text)",fontFamily:"var(--font-display)",lineHeight:1.1},
  logoSub:{fontSize:9,color:"var(--text3)",lineHeight:1},
  locationPill:{display:"flex",alignItems:"center",gap:8,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px",cursor:"pointer",flexShrink:0},
  locLabel:{fontSize:9,color:"var(--text3)",lineHeight:1,marginBottom:2},
  locCity:{fontSize:12,fontWeight:700,color:"var(--text)",lineHeight:1},
  searchWrap:{flex:1,position:"relative",maxWidth:440},
  searchBox:{display:"flex",alignItems:"center",gap:10,background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:12,padding:"0 14px",height:42},
  searchInput:{flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:"var(--text)",padding:"0"},
  spinner:{width:16,height:16,border:"2px solid var(--border2)",borderTopColor:"var(--orange)",borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0},
  clearSearch:{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:13,padding:4},
  searchDrop:{position:"absolute",top:"calc(100%+8px)",left:0,right:0,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",maxHeight:420,overflowY:"auto",zIndex:400,padding:8},
  searchSection:{fontSize:10,fontWeight:800,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1,padding:"8px 12px 4px"},
  searchItem:{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,cursor:"pointer",transition:"background 0.15s"},
  searchItemName:{fontSize:13,fontWeight:600,color:"var(--text)",margin:"0 0 2px"},
  searchItemSub:{fontSize:11,color:"var(--text3)",margin:0},
  navLinks:{display:"flex",gap:4},
  navLink:{textDecoration:"none",color:"var(--text2)",fontSize:13,fontWeight:600,padding:"6px 12px",borderRadius:8,transition:"color 0.2s"},
  navLinkActive:{color:"var(--orange)"},
  right:{display:"flex",alignItems:"center",gap:12,marginLeft:"auto",flexShrink:0},
  cartBtn:{textDecoration:"none",display:"flex",alignItems:"center",gap:10,background:"rgba(255,87,34,0.1)",border:"1px solid rgba(255,87,34,0.25)",borderRadius:12,padding:"8px 14px"},
  cartIconWrap:{position:"relative"},
  cartBadge:{position:"absolute",top:-6,right:-6,background:"var(--orange)",color:"#fff",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800},
  cartInfo:{display:"flex",flexDirection:"column",gap:1},
  cartLabel:{fontSize:11,color:"var(--orange)",fontWeight:700,lineHeight:1},
  cartTotal:{fontSize:13,fontWeight:800,color:"var(--text)",lineHeight:1},
  userBtn:{display:"flex",alignItems:"center",gap:10,padding:"6px 12px",borderRadius:12,border:"1px solid var(--border)",background:"var(--bg3)",cursor:"pointer",position:"relative"},
  userAvatar:{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,var(--orange),var(--orange2))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff",flexShrink:0},
  userMeta:{display:"flex",flexDirection:"column",gap:1},
  userGreet:{fontSize:12,fontWeight:700,color:"var(--text)",lineHeight:1},
  userPts:{fontSize:9,color:"#FFD600",fontWeight:700,lineHeight:1},
  userDropdown:{position:"absolute",top:"calc(100%+10px)",right:0,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:16,minWidth:230,padding:8,boxShadow:"0 20px 60px rgba(0,0,0,0.7)",zIndex:500},
  dropHead:{display:"flex",alignItems:"center",gap:12,padding:"10px 12px 12px"},
  dropAvatar:{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,var(--orange),var(--orange2))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0},
  dropName:{fontSize:14,fontWeight:700,color:"var(--text)",margin:"0 0 2px"},
  dropEmail:{fontSize:11,color:"var(--text3)",margin:0},
  dropDivider:{height:1,background:"var(--border)",margin:"4px 0"},
  dropItem:{display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:"var(--text2)",padding:"10px 12px",borderRadius:10,fontSize:13,fontWeight:500,transition:"background 0.15s"},
  dropLogout:{width:"100%",textAlign:"left",background:"rgba(255,23,68,0.08)",border:"none",color:"var(--red)",padding:"10px 12px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer"},
  authBtns:{display:"flex",gap:8},
  loginBtn:{textDecoration:"none",color:"var(--text2)",padding:"9px 18px",borderRadius:10,fontSize:13,fontWeight:600,border:"1px solid var(--border)"},
  signupBtn:{textDecoration:"none",background:"linear-gradient(135deg,var(--orange),var(--orange2))",color:"#fff",padding:"9px 18px",borderRadius:10,fontSize:13,fontWeight:700,boxShadow:"0 4px 16px rgba(255,87,34,0.35)"},
};
