import React,{useEffect,useState,useRef} from "react";
import {useParams,useNavigate} from "react-router-dom";
import {restAPI,reviewAPI} from "../utils/api";
import {useCart} from "../context/CartContext";
import {useAuth} from "../context/AuthContext";
import toast from "react-hot-toast";

export default function RestaurantPage(){
  const {id}=useParams();
  const [rest,setRest]=useState(null);
  const [reviews,setReviews]=useState([]);
  const [activecat,setActivecat]=useState("All");
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("menu");
  const {addItem,cart,updateQty}=useCart();
  const {user}=useAuth();
  const navigate=useNavigate();
  const menuRef=useRef();

  useEffect(()=>{
    Promise.all([restAPI.getOne(id),reviewAPI.getFor(id)])
      .then(([r,rv])=>{setRest(r.data);setReviews(rv.data);})
      .finally(()=>setLoading(false));
  },[id]);

  if(loading) return <Loader/>;
  if(!rest) return <div style={s.loader}>Restaurant not found</div>;

  const cats=["All",...new Set(rest.menu.map(m=>m.category))];
  const menuItems=activecat==="All"?rest.menu:rest.menu.filter(m=>m.category===activecat);
  const bestsellers=rest.menu.filter(m=>m.isBestseller);
  const getQty=id=>{const i=cart.items.find(x=>x.id===id);return i?i.quantity:0;};
  const handleAdd=item=>{
    if(!user){toast.error("Please login to order");navigate("/login");return;}
    addItem(rest.id,rest.name,rest.image,rest.deliveryFee,item);
    toast.success(item.name+" added!",{icon:"🛒"});
  };
  const cartTotal=cart.items.reduce((a,i)=>a+i.price*i.quantity,0);
  const cartCount=cart.items.reduce((a,i)=>a+i.quantity,0);

  return(
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerBg}/>
        <div style={s.headerContent}>
          <button style={s.backBtn} onClick={()=>navigate(-1)}>← Back</button>
          <div style={s.headerMain}>
            <div style={s.restEmoji}>{rest.image}</div>
            <div style={s.headerInfo}>
              <div style={s.headerRow1}>
                <h1 style={s.restName}>{rest.name}</h1>
                {rest.badge&&<span style={s.badge}>{rest.badge}</span>}
                {rest.isPureVeg&&<span style={s.vegBadge}>🌿 Pure Veg</span>}
              </div>
              <p style={s.restMeta}>{rest.cuisine} · {rest.address}</p>
              <div style={s.headerBadges}>
                <span style={s.infoBadge}><span style={{color:"var(--gold)"}}>★</span> {rest.rating} ({rest.totalReviews} reviews)</span>
                <span style={s.infoBadge}>🕒 {rest.deliveryTime}</span>
                <span style={s.infoBadge}>🛵 {rest.deliveryFee===0?"Free delivery":"₹"+rest.deliveryFee}</span>
                <span style={s.infoBadge}>🛍 Min ₹{rest.minOrder}</span>
                {rest.discount&&<span style={{...s.infoBadge,background:"rgba(0,200,83,0.1)",borderColor:"rgba(0,200,83,0.25)",color:"var(--green)"}}>{rest.discount}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <div style={s.tabsInner}>
          {["menu","reviews"].map(t=>(
            <button key={t} style={{...s.tabBtn,...(tab===t?s.tabBtnActive:{})}} onClick={()=>setTab(t)}>
              {t==="menu"?"🍽️ Menu":`⭐ Reviews (${reviews.length})`}
            </button>
          ))}
        </div>
      </div>

      {tab==="menu"?(
        <div style={s.menuLayout}>
          {/* Sidebar */}
          <div style={s.sidebar}>
            {cats.map(cat=>(
              <button key={cat} style={{...s.catBtn,...(activecat===cat?s.catBtnActive:{})}} onClick={()=>setActivecat(cat)}>
                {cat}
                <span style={s.catCount}>{cat==="All"?rest.menu.length:rest.menu.filter(m=>m.category===cat).length}</span>
              </button>
            ))}
          </div>

          {/* Menu */}
          <div style={s.menuArea} ref={menuRef}>
            {activecat==="All"&&bestsellers.length>0&&(
              <div>
                <h3 style={s.subHead}>🔥 Bestsellers</h3>
                <div style={s.menuList}>{bestsellers.map(item=><MenuItem key={item.id} item={item} qty={getQty(item.id)} onAdd={handleAdd} onUpdate={updateQty}/>)}</div>
                <div style={s.divider}/>
              </div>
            )}
            <h3 style={s.subHead}>{activecat==="All"?"Full Menu":activecat}</h3>
            <div style={s.menuList}>
              {(activecat==="All"?menuItems.filter(m=>!m.isBestseller):menuItems).map(item=>(
                <MenuItem key={item.id} item={item} qty={getQty(item.id)} onAdd={handleAdd} onUpdate={updateQty}/>
              ))}
            </div>
          </div>
        </div>
      ):(
        <div style={s.reviewsSection}>
          {reviews.length===0?(
            <p style={{color:"var(--text3)",textAlign:"center",padding:60}}>No reviews yet. Be the first!</p>
          ):(
            <div style={s.reviewList}>
              {reviews.map(r=>(
                <div key={r.id} style={s.reviewCard}>
                  <div style={s.reviewTop}>
                    <div style={s.reviewAvatar}>{r.userName[0]}</div>
                    <div><p style={s.reviewName}>{r.userName}</p><p style={s.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</p></div>
                    <div style={s.reviewStars}>{"★".repeat(r.rating)}<span style={{color:"var(--text3)"}}>{"★".repeat(5-r.rating)}</span></div>
                  </div>
                  {r.comment&&<p style={s.reviewText}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating cart */}
      {cart.items.length>0&&cart.restaurantId===rest.id&&(
        <button style={s.floatCart} onClick={()=>navigate("/cart")}>
          <div style={s.floatLeft}>
            <span style={s.floatCount}>{cartCount}</span>
            <span>View Cart</span>
          </div>
          <div style={s.floatRight}>
            <span>₹{cartTotal}</span>
            <span>→</span>
          </div>
        </button>
      )}
    </div>
  );
}

function MenuItem({item,qty,onAdd,onUpdate}){
  const [hov,setHov]=useState(false);
  return(
    <div style={{...s.menuCard,...(hov?s.menuCardHov:{})}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={s.menuLeft}>
        <div style={s.vegRow}>
          <div style={{...s.vegSquare,border:"1.5px solid"+(item.isVeg?"var(--green)":"var(--red)"),color:item.isVeg?"var(--green)":"var(--red)"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:item.isVeg?"var(--green)":"var(--red)"}}/>
          </div>
          {item.isBestseller&&<span style={s.bestTag}>⚡ Bestseller</span>}
        </div>
        <h4 style={s.menuName}>{item.name}</h4>
        <p style={s.menuPrice}>₹{item.price}</p>
        <p style={s.menuDesc}>{item.description}</p>
        {item.calories&&<div style={s.menuMeta}><span style={s.metaTag}>🔥 {item.calories} cal</span><span style={s.metaTag}>⏱ {item.prepTime}</span></div>}
      </div>
      <div style={s.menuRight}>
        <div style={s.menuImgBox}><span style={{fontSize:36}}>{item.isVeg?"🥗":"🍖"}</span></div>
        {qty===0?(
          <button style={s.addBtn} onClick={()=>onAdd(item)}>ADD +</button>
        ):(
          <div style={s.qtyCtrl}>
            <button style={s.qtyBtn} onClick={()=>onUpdate(item.id,qty-1)}>−</button>
            <span style={s.qtyNum}>{qty}</span>
            <button style={s.qtyBtn} onClick={()=>onUpdate(item.id,qty+1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Loader(){return <div style={s.loader}>Loading menu...</div>;}

const s={
  page:{background:"var(--bg)",minHeight:"100vh",paddingBottom:100},
  loader:{textAlign:"center",padding:80,color:"var(--text3)"},
  header:{position:"relative",overflow:"hidden",paddingBottom:28},
  headerBg:{position:"absolute",inset:0,background:"linear-gradient(180deg,#12091A 0%,var(--bg) 100%)"},
  headerContent:{position:"relative",zIndex:1,maxWidth:1280,margin:"0 auto",padding:"24px 40px 0"},
  backBtn:{background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",color:"var(--text2)",padding:"8px 16px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:22},
  headerMain:{display:"flex",gap:24,alignItems:"flex-start"},
  restEmoji:{fontSize:72,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:20,width:110,height:110,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  headerInfo:{flex:1},
  headerRow1:{display:"flex",alignItems:"center",gap:12,marginBottom:6,flexWrap:"wrap"},
  restName:{fontSize:30,fontWeight:800,color:"var(--text)",fontFamily:"var(--font-display)",margin:0},
  badge:{background:"rgba(255,214,0,0.1)",border:"1px solid rgba(255,214,0,0.3)",color:"var(--gold)",padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:800},
  vegBadge:{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.3)",color:"var(--green)",padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:700},
  restMeta:{color:"var(--text3)",fontSize:14,margin:"0 0 14px"},
  headerBadges:{display:"flex",gap:8,flexWrap:"wrap"},
  infoBadge:{background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",color:"var(--text2)",padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:500},
  tabs:{borderBottom:"1px solid var(--border)",background:"rgba(9,9,14,0.85)",backdropFilter:"blur(10px)",position:"sticky",top:96,zIndex:60},
  tabsInner:{maxWidth:1280,margin:"0 auto",padding:"0 40px",display:"flex",gap:4},
  tabBtn:{background:"none",border:"none",color:"var(--text3)",padding:"14px 20px",fontSize:14,fontWeight:700,cursor:"pointer",borderBottom:"2px solid transparent",transition:"all 0.2s"},
  tabBtnActive:{color:"var(--orange)",borderBottom:"2px solid var(--orange)"},
  menuLayout:{maxWidth:1280,margin:"0 auto",padding:"32px 40px",display:"flex",gap:24,alignItems:"flex-start"},
  sidebar:{width:180,flexShrink:0,position:"sticky",top:150,display:"flex",flexDirection:"column",gap:2},
  catBtn:{background:"none",border:"none",color:"var(--text3)",padding:"10px 14px",borderRadius:10,fontSize:13,fontWeight:600,textAlign:"left",cursor:"pointer",transition:"all 0.15s",display:"flex",justifyContent:"space-between",alignItems:"center"},
  catBtnActive:{background:"rgba(255,87,34,0.1)",color:"var(--orange)"},
  catCount:{fontSize:10,background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"1px 7px"},
  menuArea:{flex:1},
  subHead:{fontSize:16,fontWeight:800,color:"var(--text)",margin:"0 0 16px",fontFamily:"var(--font-display)"},
  menuList:{display:"flex",flexDirection:"column",gap:10},
  divider:{height:1,background:"var(--border)",margin:"24px 0"},
  menuCard:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"20px 22px",display:"flex",gap:18,transition:"all 0.2s"},
  menuCardHov:{border:"1px solid rgba(255,87,34,0.2)",background:"#131320"},
  menuLeft:{flex:1},
  vegRow:{display:"flex",alignItems:"center",gap:8,marginBottom:8},
  vegSquare:{width:14,height:14,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  bestTag:{background:"rgba(255,214,0,0.08)",color:"var(--gold)",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:4,border:"1px solid rgba(255,214,0,0.2)"},
  menuName:{fontSize:15,fontWeight:800,color:"var(--text)",margin:"0 0 4px"},
  menuPrice:{fontSize:16,fontWeight:800,color:"var(--text)",margin:"0 0 4px"},
  menuDesc:{fontSize:12,color:"var(--text3)",margin:"0 0 8px",lineHeight:1.5},
  menuMeta:{display:"flex",gap:8},
  metaTag:{background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text3)",padding:"2px 8px",borderRadius:5,fontSize:10},
  menuRight:{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flexShrink:0},
  menuImgBox:{width:90,height:90,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"},
  addBtn:{background:"rgba(255,87,34,0.1)",border:"1px solid rgba(255,87,34,0.35)",color:"var(--orange)",padding:"8px 20px",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:"0.5px"},
  qtyCtrl:{display:"flex",alignItems:"center",gap:8,background:"var(--bg3)",borderRadius:10,padding:"5px 10px",border:"1px solid var(--border2)"},
  qtyBtn:{background:"var(--orange)",border:"none",color:"#fff",width:26,height:26,borderRadius:7,fontWeight:800,fontSize:15,cursor:"pointer"},
  qtyNum:{fontSize:15,fontWeight:800,color:"var(--text)",minWidth:22,textAlign:"center"},
  reviewsSection:{maxWidth:900,margin:"32px auto",padding:"0 40px"},
  reviewList:{display:"flex",flexDirection:"column",gap:14},
  reviewCard:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"20px 24px"},
  reviewTop:{display:"flex",alignItems:"center",gap:12,marginBottom:10},
  reviewAvatar:{width:38,height:38,borderRadius:"50%",background:"rgba(255,87,34,0.15)",color:"var(--orange)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,flexShrink:0},
  reviewName:{fontSize:14,fontWeight:700,color:"var(--text)",margin:"0 0 2px"},
  reviewDate:{fontSize:11,color:"var(--text3)",margin:0},
  reviewStars:{color:"var(--gold)",fontSize:14,marginLeft:"auto"},
  reviewText:{color:"var(--text2)",fontSize:14,lineHeight:1.6,margin:0},
  floatCart:{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,var(--orange),var(--orange2))",border:"none",color:"#fff",padding:"16px 28px",borderRadius:16,display:"flex",justifyContent:"space-between",alignItems:"center",gap:40,fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 8px 36px rgba(255,87,34,0.5)",zIndex:100,minWidth:300,fontFamily:"var(--font-body)"},
  floatLeft:{display:"flex",alignItems:"center",gap:12},
  floatCount:{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"3px 10px",fontSize:14},
  floatRight:{display:"flex",alignItems:"center",gap:8},
};
