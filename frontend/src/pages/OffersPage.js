import React,{useEffect,useState} from "react";
import {offerAPI} from "../utils/api";
import toast from "react-hot-toast";

const PALETTES=[
  {bg:"rgba(255,87,34,0.07)",border:"rgba(255,87,34,0.2)",accent:"#FF5722",glow:"rgba(255,87,34,0.15)"},
  {bg:"rgba(41,121,255,0.07)",border:"rgba(41,121,255,0.2)",accent:"#2979FF",glow:"rgba(41,121,255,0.15)"},
  {bg:"rgba(0,200,83,0.07)",border:"rgba(0,200,83,0.2)",accent:"#00C853",glow:"rgba(0,200,83,0.15)"},
  {bg:"rgba(255,214,0,0.07)",border:"rgba(255,214,0,0.2)",accent:"#FFD600",glow:"rgba(255,214,0,0.15)"},
  {bg:"rgba(236,64,122,0.07)",border:"rgba(236,64,122,0.2)",accent:"#EC407A",glow:"rgba(236,64,122,0.15)"},
  {bg:"rgba(124,77,255,0.07)",border:"rgba(124,77,255,0.2)",accent:"#7C4DFF",glow:"rgba(124,77,255,0.15)"},
];

export default function OffersPage(){
  const [offers,setOffers]=useState([]);
  const [copied,setCopied]=useState("");

  useEffect(()=>{offerAPI.getAll().then(r=>setOffers(r.data));},[]);

  const copyCode=code=>{
    navigator.clipboard.writeText(code).then(()=>{setCopied(code);toast.success("Code copied: "+code,{icon:"🏷️"});setTimeout(()=>setCopied(""),2500);});
  };

  const getDiscountLabel=o=>{
    if(o.type==="percent")        return `${o.discount}% OFF`;
    if(o.type==="flat")           return `₹${o.discount} OFF`;
    if(o.type==="free_delivery")  return "FREE DELIVERY";
    return "OFFER";
  };

  return(
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerGlow}/>
        <div style={s.headerContent}>
          <div style={s.headerBadge}>🔥 Limited Time Deals</div>
          <h1 style={s.headerTitle}>Offers & Coupons</h1>
          <p style={s.headerSub}>Exclusive deals that save you money on every order. New codes added daily.</p>
        </div>
      </div>

      <div style={s.container}>
        {/* Offer cards */}
        <div style={s.grid}>
          {offers.map((offer,i)=>{
            const pal=PALETTES[i%PALETTES.length];
            const isCopied=copied===offer.code;
            return(
              <div key={offer.id} style={{...s.card,background:pal.bg,border:`1px solid ${pal.border}`,boxShadow:isCopied?`0 0 30px ${pal.glow}`:s.card.boxShadow}}>
                {/* top */}
                <div style={s.cardTop}>
                  <span style={s.offerEmoji}>{offer.emoji}</span>
                  <div style={{...s.discLabel,color:pal.accent,background:pal.accent+"18",border:`1px solid ${pal.accent}40`}}>
                    {getDiscountLabel(offer)}
                  </div>
                </div>
                {/* max savings */}
                {offer.maxDiscount>0&&<div style={{...s.maxSave,color:pal.accent}}>Max savings: ₹{offer.maxDiscount}</div>}
                <h3 style={s.offerTitle}>{offer.description}</h3>
                {offer.minOrder>0&&<p style={s.minOrder}>Min. order ₹{offer.minOrder}</p>}

                {/* Code */}
                <div style={s.codeWrap}>
                  <div style={{...s.codePill,border:`1.5px dashed ${pal.accent}60`,color:pal.accent,background:pal.accent+"0D"}}>
                    <span style={s.codeText}>{offer.code}</span>
                  </div>
                  <button
                    style={{...s.copyBtn,background:isCopied?pal.accent:"transparent",color:isCopied?"#fff":pal.accent,border:`1px solid ${pal.accent}60`}}
                    onClick={()=>copyCode(offer.code)}>
                    {isCopied?"✓ Copied!":"Copy"}
                  </button>
                </div>

                <div style={s.cardFooter}>
                  <span style={s.expiryTag}>⏰ Valid till {new Date(offer.expiry).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to use */}
        <div style={s.howSection}>
          <h2 style={s.howTitle}>How to redeem coupons</h2>
          <div style={s.howGrid}>
            {[
              {n:"01",icon:"🏷️",title:"Pick a coupon",desc:"Browse above and copy the code that suits your order."},
              {n:"02",icon:"🛒",title:"Add items to cart",desc:"Choose from any of our 500+ restaurants."},
              {n:"03",icon:"💬",title:"Paste at checkout",desc:"Enter the code in the coupon field on the cart page."},
              {n:"04",icon:"🎉",title:"Enjoy savings",desc:"Your discount is applied instantly to the order total."},
            ].map(h=>(
              <div key={h.n} style={s.howCard}>
                <div style={s.howNum}>{h.n}</div>
                <div style={s.howIcon}>{h.icon}</div>
                <h4 style={s.howCardTitle}>{h.title}</h4>
                <p style={s.howCardDesc}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div style={s.terms}>
          <h3 style={{fontSize:14,fontWeight:700,color:"var(--text2)",marginBottom:10}}>Terms & Conditions</h3>
          <ul style={s.termsList}>
            {["Coupons are valid for a limited time only.","Each coupon can be applied once per order.","Minimum order value must be met for the coupon to apply.","Maximum discount caps apply as specified on each coupon.","RapidRush reserves the right to modify or cancel offers at any time.","Coupons cannot be combined with other promotional offers."].map(t=>(
              <li key={t} style={s.termItem}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const s={
  page:{background:"var(--bg)",minHeight:"100vh"},
  header:{position:"relative",overflow:"hidden",padding:"56px 40px 48px"},
  headerGlow:{position:"absolute",top:-80,left:"50%",transform:"translateX(-50%)",width:600,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,87,34,0.1) 0%,transparent 70%)",pointerEvents:"none"},
  headerContent:{maxWidth:1100,margin:"0 auto",position:"relative",zIndex:1},
  headerBadge:{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,87,34,0.1)",border:"1px solid rgba(255,87,34,0.25)",color:"var(--orange)",padding:"6px 14px",borderRadius:50,fontSize:12,fontWeight:800,marginBottom:16,letterSpacing:"0.3px"},
  headerTitle:{fontSize:44,fontWeight:800,color:"var(--text)",margin:"0 0 12px",fontFamily:"var(--font-display)"},
  headerSub:{color:"var(--text3)",fontSize:16,margin:0,maxWidth:500,lineHeight:1.6},
  container:{maxWidth:1100,margin:"0 auto",padding:"0 40px 60px"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:20,marginBottom:56},
  card:{borderRadius:20,padding:"24px",position:"relative",overflow:"hidden",transition:"all 0.25s",boxShadow:"0 4px 24px rgba(0,0,0,0.2)"},
  cardTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12},
  offerEmoji:{fontSize:44},
  discLabel:{padding:"7px 16px",borderRadius:10,fontSize:14,fontWeight:900,letterSpacing:"0.5px",fontFamily:"var(--font-display)"},
  maxSave:{fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:"0.3px"},
  offerTitle:{fontSize:16,fontWeight:700,color:"var(--text)",margin:"0 0 6px",lineHeight:1.4},
  minOrder:{fontSize:12,color:"var(--text3)",margin:"0 0 18px"},
  codeWrap:{display:"flex",gap:10,alignItems:"center",marginBottom:16},
  codePill:{display:"flex",alignItems:"center",padding:"9px 18px",borderRadius:10,flex:1},
  codeText:{fontSize:16,fontWeight:900,letterSpacing:"2px",fontFamily:"monospace"},
  copyBtn:{padding:"9px 18px",borderRadius:10,fontSize:13,fontWeight:800,cursor:"pointer",transition:"all 0.2s",letterSpacing:"0.3px"},
  cardFooter:{},
  expiryTag:{fontSize:11,color:"var(--text3)",fontWeight:500},
  howSection:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,padding:"36px",marginBottom:32},
  howTitle:{fontSize:22,fontWeight:800,color:"var(--text)",margin:"0 0 28px",fontFamily:"var(--font-display)"},
  howGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24},
  howCard:{textAlign:"center"},
  howNum:{display:"inline-block",background:"rgba(255,87,34,0.1)",color:"var(--orange)",fontWeight:900,fontSize:10,letterSpacing:2,padding:"4px 10px",borderRadius:6,marginBottom:14},
  howIcon:{fontSize:34,marginBottom:12},
  howCardTitle:{fontSize:14,fontWeight:800,color:"var(--text)",margin:"0 0 8px"},
  howCardDesc:{fontSize:12,color:"var(--text3)",lineHeight:1.6,margin:0},
  terms:{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,padding:"24px 28px"},
  termsList:{paddingLeft:20,display:"flex",flexDirection:"column",gap:8},
  termItem:{fontSize:12,color:"var(--text3)",lineHeight:1.6},
};
