// ═══════════════════════════════════════════════════════════════
// Orders.js
// ═══════════════════════════════════════════════════════════════
import React,{useEffect,useState} from "react";
export {Orders};
import {Link} from "react-router-dom";
import {orderAPI} from "../utils/api";

const ST={pending:{c:"#FFB300",bg:"rgba(255,179,0,0.1)",l:"⏳ Pending"},confirmed:{c:"#2979FF",bg:"rgba(41,121,255,0.1)",l:"✅ Confirmed"},preparing:{c:"#FF5722",bg:"rgba(255,87,34,0.1)",l:"👨‍🍳 Preparing"},out_for_delivery:{c:"#00C853",bg:"rgba(0,200,83,0.1)",l:"🛵 On the Way"},delivered:{c:"#00C853",bg:"rgba(0,200,83,0.08)",l:"🎉 Delivered"},cancelled:{c:"#FF1744",bg:"rgba(255,23,68,0.08)",l:"❌ Cancelled"}};

function Orders(){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState("all");
  useEffect(()=>{orderAPI.getAll().then(r=>setOrders(r.data)).finally(()=>setLoading(false));},[]);
  const tabs=[{key:"all",label:"All"},{key:"active",label:"Active"},{key:"delivered",label:"Delivered"},{key:"cancelled",label:"Cancelled"}];
  const filtered=orders.filter(o=>activeTab==="all"?true:activeTab==="active"?["pending","confirmed","preparing","out_for_delivery"].includes(o.status):o.status===activeTab);
  if(loading) return <div style={so.loader}>Loading orders...</div>;
  return(
    <div style={so.page}>
      <div style={so.container}>
        <h1 style={so.title}>My Orders</h1>
        <div style={so.tabRow}>{tabs.map(t=><button key={t.key} style={{...so.tab,...(activeTab===t.key?so.tabActive:{})}} onClick={()=>setActiveTab(t.key)}>{t.label}</button>)}</div>
        {filtered.length===0?(
          <div style={so.empty}><div style={{fontSize:60}}>📦</div><p style={{color:"var(--text3)",marginTop:12}}>No orders here</p><Link to="/" style={so.browseBtn}>Order Now</Link></div>
        ):(
          <div style={so.list}>
            {filtered.map(o=>{
              const st=ST[o.status]||ST.pending;
              return(
                <Link key={o.id} to={"/orders/"+o.id} style={so.card}>
                  <div style={so.cardL}>
                    <div style={so.restIcon}>{o.restaurantImage}</div>
                    <div>
                      <h3 style={so.restName}>{o.restaurantName}</h3>
                      <p style={so.items}>{o.items.map(i=>`${i.name} ×${i.quantity}`).join(", ")}</p>
                      <p style={so.date}>{new Date(o.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                    </div>
                  </div>
                  <div style={so.cardR}>
                    <span style={{...so.stBadge,background:st.bg,color:st.c}}>{st.l}</span>
                    <p style={so.total}>₹{o.total}</p>
                    {o.loyaltyEarned>0&&<p style={so.pts}>+{o.loyaltyEarned} pts</p>}
                    <span style={so.viewLink}>View details →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
const so={page:{background:"var(--bg)",minHeight:"100vh",padding:"40px 40px"},container:{maxWidth:860,margin:"0 auto"},title:{fontSize:28,fontWeight:800,color:"var(--text)",margin:"0 0 24px",fontFamily:"var(--font-display)"},tabRow:{display:"flex",gap:8,marginBottom:28},tab:{padding:"8px 20px",borderRadius:50,border:"1px solid var(--border)",background:"transparent",color:"var(--text3)",fontSize:13,fontWeight:600,cursor:"pointer"},tabActive:{background:"rgba(255,87,34,0.1)",border:"1px solid rgba(255,87,34,0.3)",color:"var(--orange)"},list:{display:"flex",flexDirection:"column",gap:14},card:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",textDecoration:"none",gap:16,transition:"border-color 0.2s"},cardL:{display:"flex",alignItems:"center",gap:16,flex:1,minWidth:0},restIcon:{width:54,height:54,background:"var(--bg3)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0},restName:{fontSize:15,fontWeight:800,color:"var(--text)",margin:"0 0 3px"},items:{fontSize:12,color:"var(--text3)",margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:380},date:{fontSize:11,color:"var(--text3)",margin:0},cardR:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0},stBadge:{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:700},total:{fontSize:18,fontWeight:800,color:"var(--text)",margin:0},pts:{fontSize:10,color:"var(--gold)",fontWeight:700,margin:0},viewLink:{fontSize:12,color:"var(--orange)",fontWeight:700},loader:{textAlign:"center",padding:80,color:"var(--text3)"},empty:{textAlign:"center",padding:"60px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:12},browseBtn:{background:"linear-gradient(135deg,var(--orange),var(--orange2))",color:"#fff",textDecoration:"none",padding:"12px 28px",borderRadius:50,fontWeight:700}};
