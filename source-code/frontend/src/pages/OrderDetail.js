import React,{useEffect,useState,useCallback} from "react";
import {useParams,Link} from "react-router-dom";
import {orderAPI} from "../utils/api";
import toast from "react-hot-toast";

const STEPS=[{key:"pending",icon:"📋",label:"Order Placed"},{key:"confirmed",icon:"✅",label:"Confirmed"},{key:"preparing",icon:"👨‍🍳",label:"Preparing"},{key:"out_for_delivery",icon:"🛵",label:"On the Way"},{key:"delivered",icon:"🎉",label:"Delivered"}];
const IDX={pending:0,confirmed:1,preparing:2,out_for_delivery:3,delivered:4,cancelled:-1};

export default function OrderDetail(){
  const {id}=useParams();
  const [order,setOrder]=useState(null);
  const [loading,setLoading]=useState(true);
  const fetch=useCallback(()=>{orderAPI.getOne(id).then(r=>{setOrder(r.data);setLoading(false);}).catch(()=>setLoading(false));},[id]);
  useEffect(()=>{fetch();const t=setInterval(fetch,5000);return()=>clearInterval(t);},[fetch]);
  const cancel=async()=>{if(!window.confirm("Cancel this order?"))return;try{await orderAPI.cancel(id);toast.success("Cancelled");fetch();}catch(e){toast.error(e.response?.data?.message||"Cannot cancel");}};
  if(loading) return <div style={s.loader}>Loading order...</div>;
  if(!order)  return <div style={s.loader}>Order not found</div>;
  const idx=IDX[order.status]??0;
  const cancelled=order.status==="cancelled";
  return(
    <div style={s.page}>
      <div style={s.container}>
        <Link to="/orders" style={s.back}>← My Orders</Link>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerL}>
            <span style={{fontSize:40}}>{order.restaurantImage}</span>
            <div>
              <h1 style={s.restName}>{order.restaurantName}</h1>
              <p style={s.orderId}>Order #{order.id.slice(0,8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</p>
            </div>
          </div>
          {!cancelled&&(
            <div style={s.etaBox}>
              <span style={s.liveTag}><span style={s.liveDot}/>LIVE</span>
              <p style={s.etaTime}>{order.estimatedTime}</p>
              <p style={s.etaLabel}>Estimated delivery</p>
            </div>
          )}
        </div>

        {/* Tracker */}
        {!cancelled?(
          <div style={s.tracker}>
            <h3 style={s.trackerTitle}>Order Status</h3>
            <div style={s.stepsRow}>
              {STEPS.map((step,i)=>{
                const done=i<=idx, active=i===idx;
                return(
                  <div key={step.key} style={s.stepWrap}>
                    <div style={{...s.stepCircle,background:done?"linear-gradient(135deg,var(--orange),var(--orange2))":"var(--bg3)",border:done?"none":"1px solid var(--border2)",boxShadow:active?"0 0 0 6px rgba(255,87,34,0.18)":"none",transform:active?"scale(1.15)":"scale(1)"}}>
                      <span style={{fontSize:active?20:16}}>{step.icon}</span>
                    </div>
                    {i<STEPS.length-1&&<div style={{...s.stepLine,background:i<idx?"var(--orange)":"var(--border)"}}/>}
                    <p style={{...s.stepLabel,color:done?"var(--text)":"var(--text3)",fontWeight:active?800:500}}>{step.label}</p>
                    {active&&order.timeline?.find(t=>t.status===step.key)&&(
                      <p style={s.stepTime}>{new Date(order.timeline.find(t=>t.status===step.key).time).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Rider info */}
            {order.assignedRider&&["out_for_delivery","preparing"].includes(order.status)&&(
              <div style={s.riderBox}>
                <div style={s.riderAvatar}>{order.assignedRider.name[0]}</div>
                <div>
                  <p style={s.riderName}>{order.assignedRider.name}</p>
                  <p style={s.riderMeta}>{order.assignedRider.vehicle} · ★{order.assignedRider.rating}</p>
                </div>
                <div style={s.riderActions}>
                  <a href={"tel:"+order.assignedRider.phone} style={s.callBtn}>📞 Call Rider</a>
                  <Link to="/riders" style={s.trackBtn}>🗺 Track Live</Link>
                </div>
              </div>
            )}
          </div>
        ):(
          <div style={s.cancelBox}>❌ This order was cancelled</div>
        )}

        {/* Timeline */}
        {order.timeline?.length>0&&(
          <div style={s.card}>
            <h3 style={s.cardTitle}>Order Timeline</h3>
            <div style={s.timeline}>
              {[...order.timeline].reverse().map((t,i)=>(
                <div key={i} style={s.timelineItem}>
                  <div style={s.timelineDot}/>
                  <div>
                    <p style={s.timelineMsg}>{t.message}</p>
                    <p style={s.timelineTime}>{new Date(t.time).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={s.grid}>
          {/* Items */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Order Items</h3>
            {order.items.map(item=>(
              <div key={item.id} style={s.itemRow}>
                <span style={s.itemQty}>{item.quantity}×</span>
                <span style={s.itemName}>{item.name}</span>
                <span style={s.itemPrice}>₹{item.itemTotal}</span>
              </div>
            ))}
            <div style={s.divider}/>
            {[["Item Total",`₹${order.subtotal}`],["Delivery",`₹${order.deliveryFee}`],["GST",`₹${order.tax}`],["Platform Fee",`₹${order.platformFee||10}`],...(order.discount>0?[["Discount",`-₹${order.discount}`]]:[])].map(([l,v])=>(
              <div key={l} style={s.sumRow}><span style={{color:"var(--text3)"}}>{l}</span><span style={{color:l==="Discount"?"var(--green)":"var(--text2)"}}>{v}</span></div>
            ))}
            <div style={{...s.sumRow,fontWeight:800,fontSize:16,color:"var(--text)",borderTop:"1px solid var(--border)",paddingTop:10,marginTop:4}}>
              <span>Total Paid</span><span style={{color:"var(--orange)"}}>₹{order.total}</span>
            </div>
            {order.loyaltyEarned>0&&<div style={s.loyaltyNote}>⭐ +{order.loyaltyEarned} loyalty points earned</div>}
          </div>

          {/* Delivery info */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Delivery Details</h3>
            {[["📍","Address",order.deliveryAddress],["💳","Payment",order.paymentMethod.toUpperCase()],["🔖","Status",order.status.replace("_"," ")],...(order.couponCode?[["🏷️","Coupon",order.couponCode]]:[]),...(order.deliveryInstructions?[["📝","Instructions",order.deliveryInstructions]]:[])].map(([icon,label,val])=>(
              <div key={label} style={s.infoRow}>
                <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                <div><p style={s.infoLabel}>{label}</p><p style={{...s.infoVal,textTransform:"capitalize",color:label==="Status"?"var(--orange)":"var(--text)"}}>{val}</p></div>
              </div>
            ))}
            {["pending","confirmed"].includes(order.status)&&(
              <button style={s.cancelBtn} onClick={cancel}>Cancel Order</button>
            )}
          </div>
        </div>

        <div style={s.actions}>
          <Link to="/" style={s.reorderBtn}>Order Again 🛵</Link>
        </div>
      </div>
    </div>
  );
}

const s={
  page:{background:"var(--bg)",minHeight:"100vh",padding:"32px 40px"},
  container:{maxWidth:960,margin:"0 auto"},
  loader:{textAlign:"center",padding:80,color:"var(--text3)"},
  back:{display:"inline-block",color:"var(--orange)",textDecoration:"none",fontWeight:700,fontSize:14,marginBottom:22},
  header:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"22px 26px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"},
  headerL:{display:"flex",alignItems:"center",gap:16},
  restName:{fontSize:20,fontWeight:800,color:"var(--text)",margin:"0 0 4px",fontFamily:"var(--font-display)"},
  orderId:{fontSize:12,color:"var(--text3)",margin:0},
  etaBox:{textAlign:"right"},
  liveTag:{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.25)",color:"var(--green)",padding:"3px 10px",borderRadius:50,fontSize:10,fontWeight:800,marginBottom:6},
  liveDot:{width:6,height:6,borderRadius:"50%",background:"var(--green)",animation:"pulse-ring 1.5s infinite"},
  etaTime:{fontSize:22,fontWeight:800,color:"var(--orange)",margin:"0 0 2px",fontFamily:"var(--font-display)"},
  etaLabel:{fontSize:10,color:"var(--text3)",margin:0},
  tracker:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"24px 28px",marginBottom:16},
  trackerTitle:{fontSize:15,fontWeight:800,color:"var(--text)",margin:"0 0 24px"},
  stepsRow:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20},
  stepWrap:{display:"flex",flexDirection:"column",alignItems:"center",flex:1,position:"relative"},
  stepCircle:{width:44,height:44,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.35s",zIndex:1},
  stepLine:{position:"absolute",top:22,left:"50%",width:"100%",height:2,transition:"background 0.35s"},
  stepLabel:{fontSize:11,marginTop:10,textAlign:"center",transition:"color 0.3s"},
  stepTime:{fontSize:10,color:"var(--orange)",fontWeight:700,marginTop:2},
  riderBox:{display:"flex",alignItems:"center",gap:14,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:14,padding:"14px 18px"},
  riderAvatar:{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,var(--orange),var(--orange2))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",flexShrink:0},
  riderName:{fontSize:14,fontWeight:800,color:"var(--text)",margin:"0 0 2px"},
  riderMeta:{fontSize:11,color:"var(--text3)",margin:0},
  riderActions:{display:"flex",gap:8,marginLeft:"auto"},
  callBtn:{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.25)",color:"var(--green)",padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:700,textDecoration:"none"},
  trackBtn:{background:"rgba(41,121,255,0.1)",border:"1px solid rgba(41,121,255,0.25)",color:"var(--blue)",padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:700,textDecoration:"none"},
  cancelBox:{background:"rgba(255,23,68,0.06)",border:"1px solid rgba(255,23,68,0.18)",borderRadius:12,padding:"16px 24px",marginBottom:16,color:"var(--red)",fontWeight:700},
  card:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"22px 24px",marginBottom:16},
  cardTitle:{fontSize:15,fontWeight:800,color:"var(--text)",margin:"0 0 16px"},
  timeline:{display:"flex",flexDirection:"column",gap:0},
  timelineItem:{display:"flex",alignItems:"flex-start",gap:14,padding:"10px 0",borderBottom:"1px solid var(--border)"},
  timelineDot:{width:8,height:8,borderRadius:"50%",background:"var(--orange)",flexShrink:0,marginTop:5},
  timelineMsg:{fontSize:13,fontWeight:600,color:"var(--text)",margin:"0 0 2px"},
  timelineTime:{fontSize:11,color:"var(--text3)",margin:0},
  grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
  itemRow:{display:"flex",alignItems:"center",gap:10,marginBottom:10},
  itemQty:{background:"rgba(255,87,34,0.1)",color:"var(--orange)",borderRadius:6,padding:"2px 8px",fontWeight:800,fontSize:12},
  itemName:{flex:1,fontSize:13,color:"var(--text2)"},
  itemPrice:{fontWeight:700,fontSize:13,color:"var(--text)"},
  divider:{height:1,background:"var(--border)",margin:"12px 0"},
  sumRow:{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:7},
  loyaltyNote:{background:"rgba(255,214,0,0.06)",border:"1px solid rgba(255,214,0,0.18)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"var(--gold)",fontWeight:700,marginTop:12},
  infoRow:{display:"flex",gap:14,marginBottom:18,alignItems:"flex-start"},
  infoLabel:{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 3px"},
  infoVal:{fontSize:14,fontWeight:600,margin:0},
  cancelBtn:{marginTop:8,width:"100%",padding:"12px",background:"rgba(255,23,68,0.06)",border:"1px solid rgba(255,23,68,0.2)",borderRadius:10,color:"var(--red)",fontWeight:700,cursor:"pointer",fontSize:14},
  actions:{textAlign:"center",marginTop:8},
  reorderBtn:{display:"inline-block",background:"linear-gradient(135deg,var(--orange),var(--orange2))",color:"#fff",textDecoration:"none",padding:"14px 36px",borderRadius:50,fontWeight:800,fontSize:16,boxShadow:"0 4px 20px rgba(255,87,34,0.35)"},
};
