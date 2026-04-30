import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {useCart} from "../context/CartContext";
import {useAuth} from "../context/AuthContext";
import {orderAPI,offerAPI} from "../utils/api";
import toast from "react-hot-toast";

const PAYMENT_OPTIONS=[{key:"cash",icon:"💵",label:"Cash on Delivery",sub:"Pay when food arrives"},{key:"upi",icon:"📱",label:"UPI",sub:"PhonePe · GPay · Paytm"},{key:"card",icon:"💳",label:"Card",sub:"Debit / Credit card"},{key:"wallet",icon:"👜",label:"RapidWallet",sub:"Instant checkout"}];

export default function Cart(){
  const {cart,updateQty,removeItem,clearCart,total}=useCart();
  const {user}=useAuth();
  const navigate=useNavigate();
  const [address,setAddress]=useState(user?.address||"");
  const [instructions,setInstructions]=useState("");
  const [payment,setPayment]=useState("cash");
  const [coupon,setCoupon]=useState("");
  const [discount,setDiscount]=useState(0);
  const [couponMsg,setCouponMsg]=useState("");
  const [applying,setApplying]=useState(false);
  const [placing,setPlacing]=useState(false);

  const deliveryFee=cart.deliveryFee||49;
  const tax=Math.round(total*0.05);
  const platformFee=10;
  const grand=total+deliveryFee+tax+platformFee-discount;

  const applyCoupon=async()=>{
    if(!coupon.trim())return;
    setApplying(true);
    try{const r=await offerAPI.validate({code:coupon,orderTotal:total});setDiscount(r.data.discountAmount);setCouponMsg("✅ "+r.data.offer.description);toast.success("Coupon applied!");}
    catch(e){setCouponMsg("❌ "+(e.response?.data?.message||"Invalid"));setDiscount(0);}
    finally{setApplying(false);}
  };

  const handleOrder=async()=>{
    if(!address.trim()){toast.error("Enter delivery address");return;}
    setPlacing(true);
    try{
      const items=cart.items.map(i=>({menuItemId:i.id,quantity:i.quantity}));
      const r=await orderAPI.place({restaurantId:cart.restaurantId,items,deliveryAddress:address,paymentMethod:payment,couponCode:coupon||undefined,deliveryInstructions:instructions});
      clearCart();toast.success("Order placed! 🎉");navigate("/orders/"+r.data.order.id);
    }catch(e){toast.error(e.response?.data?.message||"Failed");}
    finally{setPlacing(false);}
  };

  if(!cart.items.length) return(
    <div style={s.empty}>
      <div style={{fontSize:80}}>🛒</div>
      <h2 style={s.emptyTitle}>Your cart is empty</h2>
      <p style={s.emptySub}>Add something delicious to get started</p>
      <Link to="/" style={s.browseBtn}>Browse Restaurants</Link>
    </div>
  );

  return(
    <div style={s.page}>
      <div style={s.container}>
        {/* Left */}
        <div style={s.left}>
          {/* Items */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <h2 style={s.cardTitle}>🛒 Order from {cart.restaurantImage} {cart.restaurantName}</h2>
              <button style={s.clearBtn} onClick={()=>{ if(window.confirm("Clear cart?"))clearCart(); }}>Clear all</button>
            </div>
            {cart.items.map(item=>(
              <div key={item.id} style={s.itemRow}>
                <div style={{...s.vegSq,borderColor:item.isVeg?"var(--green)":"var(--red)"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:item.isVeg?"var(--green)":"var(--red)"}}/>
                </div>
                <div style={s.itemInfo}>
                  <p style={s.itemName}>{item.name}</p>
                  <p style={s.itemUnit}>₹{item.price} per item</p>
                </div>
                <div style={s.qtyCtrl}>
                  <button style={s.qtyBtn} onClick={()=>updateQty(item.id,item.quantity-1)}>−</button>
                  <span style={s.qtyNum}>{item.quantity}</span>
                  <button style={s.qtyBtn} onClick={()=>updateQty(item.id,item.quantity+1)}>+</button>
                </div>
                <span style={s.lineTotal}>₹{item.price*item.quantity}</span>
                <button style={s.removeBtn} onClick={()=>removeItem(item.id)}>🗑</button>
              </div>
            ))}
          </div>

          {/* Delivery */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>📍 Delivery Details</h3>
            <textarea style={s.textarea} rows={3} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Enter full delivery address..."/>
            <input style={{...s.textarea,height:44,resize:"none",marginTop:10}} value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="Delivery instructions (optional)"/>
            {user?.savedAddresses?.length>0&&(
              <div style={s.savedAddresses}>
                <p style={s.savedLabel}>Saved addresses:</p>
                {user.savedAddresses.map((a,i)=>(
                  <button key={i} style={s.savedAddr} onClick={()=>setAddress(a)}>📍 {a}</button>
                ))}
              </div>
            )}
          </div>

          {/* Coupon */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>🏷️ Offers & Coupons</h3>
            <div style={s.couponRow}>
              <input style={s.couponInput} placeholder="Enter promo code" value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())}/>
              <button style={s.couponBtn} onClick={applyCoupon} disabled={applying}>{applying?"...":"Apply"}</button>
            </div>
            {couponMsg&&<p style={{fontSize:13,marginTop:8,color:discount>0?"var(--green)":"var(--red)"}}>{couponMsg}</p>}
            <div style={s.couponChips}>
              {["FIRST50","SAVE100","FREEDEL","WEEKEND20","FLASH30"].map(c=>(
                <button key={c} style={{...s.chip,...(coupon===c?s.chipActive:{})}} onClick={()=>setCoupon(c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>💳 Payment Method</h3>
            <div style={s.payGrid}>
              {PAYMENT_OPTIONS.map(p=>(
                <button key={p.key} style={{...s.payOpt,...(payment===p.key?s.payOptActive:{})}} onClick={()=>setPayment(p.key)}>
                  <span style={{fontSize:22}}>{p.icon}</span>
                  <div><p style={s.payLabel}>{p.label}</p><p style={s.paySub}>{p.sub}</p></div>
                  {payment===p.key&&<span style={s.payCheck}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div style={s.right}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Bill Details</h3>
            <div style={s.billRows}>
              {[["Item Total",`₹${total}`],["Delivery Fee",`₹${deliveryFee}`],["GST (5%)",`₹${tax}`],["Platform Fee",`₹${platformFee}`],...(discount>0?[[`Discount (${coupon})`,`-₹${discount}`]]:[])].map(([l,v])=>(
                <div key={l} style={s.billRow}><span style={s.billLabel}>{l}</span><span style={{...s.billVal,color:l.includes("Discount")?"var(--green)":"var(--text2)"}}>{v}</span></div>
              ))}
            </div>
            <div style={s.billDivider}/>
            <div style={{...s.billRow,fontWeight:800,fontSize:17,color:"var(--text)"}}>
              <span>To Pay</span><span style={{color:"var(--orange)"}}>₹{grand}</span>
            </div>
            {user?.loyaltyPoints>=0&&<div style={s.loyaltyNote}>⭐ You'll earn +{Math.floor(grand/10)} loyalty points</div>}
          </div>
          <div style={s.card}>
            <div style={s.safeTag}><span>🔒</span><span style={{fontSize:12,color:"var(--text3)"}}>Secure &amp; safe payments. 100% authentic food.</span></div>
          </div>
          <button style={s.placeBtn} onClick={handleOrder} disabled={placing}>
            {placing?(
              <span style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}><span style={s.btnSpinner}/>Placing Order...</span>
            ):`Place Order · ₹${grand}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const s={
  page:{background:"var(--bg)",minHeight:"100vh",padding:"32px 40px"},
  container:{maxWidth:1100,margin:"0 auto",display:"flex",gap:22,alignItems:"flex-start"},
  left:{flex:1,display:"flex",flexDirection:"column",gap:16},
  right:{width:330,flexShrink:0,display:"flex",flexDirection:"column",gap:14,position:"sticky",top:100},
  card:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"22px 24px"},
  cardHead:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18},
  cardTitle:{fontSize:16,fontWeight:800,color:"var(--text)",margin:"0 0 16px",fontFamily:"var(--font-display)"},
  clearBtn:{background:"none",border:"1px solid var(--border2)",color:"var(--text3)",padding:"6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"},
  itemRow:{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"},
  vegSq:{width:14,height:14,borderRadius:3,border:"1.5px solid",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  itemInfo:{flex:1},
  itemName:{fontSize:14,fontWeight:700,color:"var(--text)",margin:"0 0 2px"},
  itemUnit:{fontSize:11,color:"var(--text3)",margin:0},
  qtyCtrl:{display:"flex",alignItems:"center",gap:8,background:"var(--bg3)",borderRadius:10,padding:"4px 8px",border:"1px solid var(--border)"},
  qtyBtn:{background:"var(--orange)",border:"none",color:"#fff",width:24,height:24,borderRadius:6,fontWeight:800,fontSize:14,cursor:"pointer"},
  qtyNum:{fontSize:14,fontWeight:800,color:"var(--text)",minWidth:18,textAlign:"center"},
  lineTotal:{fontWeight:800,color:"var(--text)",fontSize:14,minWidth:50,textAlign:"right"},
  removeBtn:{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"var(--text3)",padding:4},
  textarea:{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:12,padding:"12px 14px",color:"var(--text)",fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"},
  savedAddresses:{marginTop:12},
  savedLabel:{fontSize:11,color:"var(--text3)",marginBottom:6},
  savedAddr:{display:"block",width:"100%",textAlign:"left",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text2)",fontSize:12,cursor:"pointer",marginBottom:6},
  couponRow:{display:"flex",gap:10},
  couponInput:{flex:1,background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:12,padding:"12px 14px",color:"var(--text)",fontSize:14,outline:"none",letterSpacing:1},
  couponBtn:{background:"rgba(255,87,34,0.12)",border:"1px solid rgba(255,87,34,0.3)",color:"var(--orange)",padding:"12px 20px",borderRadius:12,fontWeight:800,fontSize:14,cursor:"pointer"},
  couponChips:{display:"flex",gap:8,flexWrap:"wrap",marginTop:12},
  chip:{background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",color:"var(--text3)",padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.5px"},
  chipActive:{background:"rgba(255,87,34,0.08)",border:"1px solid rgba(255,87,34,0.3)",color:"var(--orange)"},
  payGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  payOpt:{display:"flex",alignItems:"center",gap:10,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s",textAlign:"left",position:"relative"},
  payOptActive:{background:"rgba(255,87,34,0.08)",border:"1px solid rgba(255,87,34,0.35)"},
  payLabel:{fontSize:13,fontWeight:700,color:"var(--text)",margin:"0 0 2px"},
  paySub:{fontSize:10,color:"var(--text3)",margin:0},
  payCheck:{position:"absolute",top:8,right:10,color:"var(--orange)",fontWeight:800,fontSize:14},
  billRows:{display:"flex",flexDirection:"column",gap:1},
  billRow:{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:14},
  billLabel:{color:"var(--text3)"},
  billVal:{fontWeight:500},
  billDivider:{height:1,background:"var(--border)",margin:"10px 0"},
  loyaltyNote:{background:"rgba(255,214,0,0.06)",border:"1px solid rgba(255,214,0,0.18)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"var(--gold)",fontWeight:600,marginTop:12},
  safeTag:{display:"flex",alignItems:"center",gap:10,margin:0},
  placeBtn:{width:"100%",padding:"17px",background:"linear-gradient(135deg,var(--orange),var(--orange2))",border:"none",borderRadius:14,fontSize:17,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:"0 8px 28px rgba(255,87,34,0.4)",fontFamily:"var(--font-body)"},
  btnSpinner:{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"},
  empty:{minHeight:"85vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,background:"var(--bg)"},
  emptyTitle:{fontSize:26,fontWeight:800,color:"var(--text)",fontFamily:"var(--font-display)"},
  emptySub:{color:"var(--text3)"},
  browseBtn:{marginTop:8,background:"linear-gradient(135deg,var(--orange),var(--orange2))",color:"#fff",textDecoration:"none",padding:"14px 36px",borderRadius:50,fontWeight:800,fontSize:16,boxShadow:"0 4px 20px rgba(255,87,34,0.35)"},
};
