import React,{useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {userAPI} from "../utils/api";
import toast from "react-hot-toast";

const TIERS=[
  {name:"Bronze",min:0,max:199,color:"#CD7F32",icon:"🥉",perks:["Free delivery on 1st order","Birthday bonus points"]},
  {name:"Silver",min:200,max:499,color:"#C0C0C0",icon:"🥈",perks:["5% cashback on all orders","Priority support","Exclusive weekend deals"]},
  {name:"Gold",min:500,max:Infinity,color:"#FFD600",icon:"👑",perks:["10% cashback","Free delivery always","Early access to offers","Dedicated support"]},
];

export default function Profile(){
  const {user,logout,refreshUser}=useAuth();
  const navigate=useNavigate();
  const [form,setForm]=useState({name:user?.name||"",phone:user?.phone||"",address:user?.address||""});
  const [saving,setSaving]=useState(false);
  const [activeTab,setActiveTab]=useState("profile");
  const [newAddr,setNewAddr]=useState("");

  const save=async e=>{
    e.preventDefault();setSaving(true);
    try{await userAPI.updateProfile(form);await refreshUser();toast.success("Profile updated!");}
    catch{toast.error("Update failed");}
    finally{setSaving(false);}
  };

  const addAddress=async()=>{
    if(!newAddr.trim())return;
    const saved=[...(user?.savedAddresses||[]),newAddr];
    await userAPI.updateProfile({savedAddresses:saved});
    await refreshUser();
    setNewAddr("");
    toast.success("Address saved!");
  };

  const pts=user?.loyaltyPoints||0;
  const tier=TIERS.find(t=>pts>=t.min&&pts<=t.max)||TIERS[0];
  const nextTier=TIERS.find(t=>t.min>pts);
  const ptsToNext=nextTier?nextTier.min-pts:0;
  const pctToNext=nextTier?Math.min((pts-tier.min)/(nextTier.min-tier.min)*100,100):100;

  return(
    <div style={s.page}>
      <div style={s.container}>
        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroBg}/>
          <div style={s.heroContent}>
            <div style={s.avatarWrap}>
              <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
              <div style={{...s.tierBadgeAvatar,borderColor:tier.color,color:tier.color}}>{tier.icon}</div>
            </div>
            <div style={s.heroInfo}>
              <h1 style={s.heroName}>{user?.name}</h1>
              <p style={s.heroEmail}>{user?.email}</p>
              <div style={s.heroBadges}>
                <span style={{...s.heroBadge,background:tier.color+"18",borderColor:tier.color+"50",color:tier.color}}>{tier.icon} {tier.name} Member</span>
                <span style={s.heroBadge}>📦 {user?.totalOrders||0} orders</span>
                <span style={s.heroBadge}>💰 ₹{user?.totalSpent||0} spent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty card */}
        <div style={s.loyaltyCard}>
          <div style={s.loyaltyL}>
            <p style={{fontSize:12,color:tier.color,fontWeight:800,marginBottom:4}}>⭐ LOYALTY POINTS</p>
            <p style={s.loyaltyPts}>{pts.toLocaleString()}</p>
            <p style={{fontSize:12,color:"var(--text3)"}}>1 point = ₹0.10 cashback</p>
          </div>
          <div style={s.loyaltyR}>
            <div style={s.tierTrack}>
              {TIERS.map((t,i)=>(
                <React.Fragment key={t.name}>
                  <div style={s.tierStop}>
                    <div style={{...s.tierDot,background:pts>=t.min?t.color:"var(--bg3)",borderColor:t.color,boxShadow:tier.name===t.name?`0 0 0 3px ${t.color}30`:"none"}}/>
                    <span style={{fontSize:9,color:t.color,fontWeight:700,marginTop:4}}>{t.name}</span>
                    <span style={{fontSize:8,color:"var(--text3)"}}>{t.min}+</span>
                  </div>
                  {i<TIERS.length-1&&<div style={{...s.tierLine,flex:1,background:pts>=TIERS[i+1].min?tier.color:"var(--border)"}}/>}
                </React.Fragment>
              ))}
            </div>
            <div style={s.progressBar}>
              <div style={{...s.progressFill,width:pctToNext+"%",background:`linear-gradient(90deg,${tier.color},${tier.color}cc)`}}/>
            </div>
            {nextTier?(
              <p style={{fontSize:11,color:"var(--text3)",marginTop:6}}>{ptsToNext} more points to reach <span style={{color:nextTier.color,fontWeight:700}}>{nextTier.name}</span></p>
            ):(
              <p style={{fontSize:11,color:"var(--gold)",marginTop:6,fontWeight:700}}>🏆 Maximum tier reached!</p>
            )}
            <div style={s.perksWrap}>
              <p style={{fontSize:10,color:"var(--text3)",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Your perks:</p>
              {tier.perks.map(p=><span key={p} style={s.perk}>✓ {p}</span>)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          {[{key:"profile",label:"👤 Profile"},{key:"addresses",label:"📍 Addresses"},{key:"account",label:"🔒 Account"}].map(t=>(
            <button key={t.key} style={{...s.tab,...(activeTab===t.key?s.tabActive:{})}} onClick={()=>setActiveTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {activeTab==="profile"&&(
          <div style={s.card}>
            <h2 style={s.cardTitle}>Edit Profile</h2>
            <form onSubmit={save} style={s.formGrid}>
              {[{name:"name",label:"Full Name",type:"text"},{name:"phone",label:"Phone Number",type:"tel"}].map(f=>(
                <div key={f.name} style={s.field}>
                  <label style={s.label}>{f.label}</label>
                  <input style={s.input} type={f.type} value={form[f.name]} onChange={e=>setForm({...form,[f.name]:e.target.value})}/>
                </div>
              ))}
              <div style={{...s.field,gridColumn:"1/-1"}}>
                <label style={s.label}>Default Address</label>
                <textarea style={{...s.input,height:90,resize:"none"}} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Your delivery address"/>
              </div>
              <button style={s.saveBtn} type="submit" disabled={saving}>{saving?"Saving...":"💾 Save Changes"}</button>
            </form>
          </div>
        )}

        {activeTab==="addresses"&&(
          <div style={s.card}>
            <h2 style={s.cardTitle}>Saved Addresses</h2>
            <div style={s.addrList}>
              {(user?.savedAddresses||[]).length===0&&<p style={{color:"var(--text3)",fontSize:13}}>No saved addresses yet.</p>}
              {(user?.savedAddresses||[]).map((addr,i)=>(
                <div key={i} style={s.addrItem}>
                  <span style={{fontSize:18}}>📍</span>
                  <span style={{flex:1,fontSize:13,color:"var(--text)"}}>{addr}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <input style={{...s.input,flex:1}} value={newAddr} onChange={e=>setNewAddr(e.target.value)} placeholder="Add new address..."/>
              <button style={{...s.saveBtn,padding:"12px 20px",margin:0}} onClick={addAddress}>Add</button>
            </div>
          </div>
        )}

        {activeTab==="account"&&(
          <div style={s.card}>
            <h2 style={s.cardTitle}>Account Information</h2>
            <div style={s.infoGrid}>
              {[["Email",user?.email],["Member Since",user?.createdAt?new Date(user.createdAt).toLocaleDateString("en-IN",{month:"long",year:"numeric"}):"—"],["Account ID",user?.id?.slice(0,16)+"..."],["Role",user?.role||"Customer"]].map(([l,v])=>(
                <div key={l} style={s.infoRow}>
                  <span style={s.infoLabel}>{l}</span>
                  <span style={s.infoVal}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:24,display:"flex",gap:12}}>
              <Link to="/orders" style={s.actionBtn}>📦 View Orders</Link>
              <button style={{...s.actionBtn,background:"rgba(255,23,68,0.08)",borderColor:"rgba(255,23,68,0.2)",color:"var(--red)"}} onClick={()=>{logout();navigate("/login");}}>🚪 Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s={
  page:{background:"var(--bg)",minHeight:"100vh",padding:"32px 40px"},
  container:{maxWidth:900,margin:"0 auto"},
  hero:{position:"relative",borderRadius:20,overflow:"hidden",marginBottom:16},
  heroBg:{position:"absolute",inset:0,background:"linear-gradient(135deg,#1A0B0A,#110818)"},
  heroContent:{position:"relative",zIndex:1,padding:"36px 32px",display:"flex",alignItems:"center",gap:24},
  avatarWrap:{position:"relative",flexShrink:0},
  avatar:{width:84,height:84,borderRadius:"50%",background:"linear-gradient(135deg,var(--orange),var(--orange2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:800,color:"#fff",boxShadow:"0 8px 28px rgba(255,87,34,0.4)"},
  tierBadgeAvatar:{position:"absolute",bottom:-4,right:-4,width:26,height:26,borderRadius:"50%",background:"var(--bg)",border:"2px solid",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13},
  heroInfo:{flex:1},
  heroName:{fontSize:26,fontWeight:800,color:"var(--text)",margin:"0 0 4px",fontFamily:"var(--font-display)"},
  heroEmail:{color:"var(--text3)",fontSize:14,margin:"0 0 12px"},
  heroBadges:{display:"flex",gap:8,flexWrap:"wrap"},
  heroBadge:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"var(--text2)",padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:600},
  loyaltyCard:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"24px 28px",marginBottom:16,display:"flex",gap:32,alignItems:"flex-start"},
  loyaltyL:{flexShrink:0},
  loyaltyPts:{fontSize:52,fontWeight:800,color:"var(--text)",margin:"0 0 4px",fontFamily:"var(--font-display)",lineHeight:1},
  loyaltyR:{flex:1},
  tierTrack:{display:"flex",alignItems:"center",marginBottom:10},
  tierStop:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},
  tierDot:{width:14,height:14,borderRadius:"50%",border:"2px solid",transition:"all 0.3s"},
  tierLine:{height:2,transition:"background 0.3s"},
  progressBar:{height:6,background:"var(--bg3)",borderRadius:3,overflow:"hidden"},
  progressFill:{height:"100%",borderRadius:3,transition:"width 0.5s ease"},
  perksWrap:{marginTop:12,display:"flex",flexWrap:"wrap",gap:6},
  perk:{background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text3)",padding:"3px 10px",borderRadius:6,fontSize:11},
  tabRow:{display:"flex",gap:8,marginBottom:16},
  tab:{padding:"9px 20px",borderRadius:50,border:"1px solid var(--border)",background:"transparent",color:"var(--text3)",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s"},
  tabActive:{background:"rgba(255,87,34,0.1)",border:"1px solid rgba(255,87,34,0.3)",color:"var(--orange)"},
  card:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"24px"},
  cardTitle:{fontSize:17,fontWeight:800,color:"var(--text)",margin:"0 0 20px",fontFamily:"var(--font-display)"},
  formGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
  field:{display:"flex",flexDirection:"column",gap:7},
  label:{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.6px"},
  input:{background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:12,padding:"12px 14px",fontSize:14,color:"var(--text)",outline:"none",boxSizing:"border-box",width:"100%",fontFamily:"inherit"},
  saveBtn:{background:"rgba(255,87,34,0.12)",border:"1px solid rgba(255,87,34,0.3)",color:"var(--orange)",padding:"12px 24px",borderRadius:10,fontWeight:800,fontSize:14,cursor:"pointer"},
  addrList:{display:"flex",flexDirection:"column",gap:10},
  addrItem:{display:"flex",alignItems:"center",gap:12,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 16px"},
  infoGrid:{display:"flex",flexDirection:"column",gap:0},
  infoRow:{display:"flex",justifyContent:"space-between",padding:"13px 0",borderBottom:"1px solid var(--border)"},
  infoLabel:{fontSize:13,color:"var(--text3)"},
  infoVal:{fontSize:13,fontWeight:600,color:"var(--text)",fontFamily:"monospace",maxWidth:260,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis"},
  actionBtn:{display:"inline-block",textDecoration:"none",background:"rgba(255,87,34,0.08)",border:"1px solid rgba(255,87,34,0.2)",color:"var(--orange)",padding:"11px 22px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"},
};
