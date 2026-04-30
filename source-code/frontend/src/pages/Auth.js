import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import toast from "react-hot-toast";

export function Login(){
  const [form,setForm]=useState({email:"",password:""});
  const [loading,setLoading]=useState(false);
  const {login}=useAuth();
  const navigate=useNavigate();
  const submit=async e=>{
    e.preventDefault();setLoading(true);
    try{await login(form.email,form.password);toast.success("Welcome back! 👋");navigate("/");}
    catch(err){toast.error(err.response?.data?.message||"Login failed");}
    finally{setLoading(false);}
  };
  return(
    <div style={s.page}>
      <div style={s.bgGlow}/>
      <div style={s.left}>
        <div style={s.brandWrap}>
          <div style={s.brandIcon}>⚡</div>
          <h2 style={s.brandName}>RapidRush</h2>
          <p style={s.brandTagline}>On-Demand Delivery</p>
        </div>
        <div style={s.featureList}>
          {[["🛵","30-minute delivery","Hot food at your door, faster than ever"],["📍","Live tracking","Watch your rider in real-time on the map"],["🏷️","Exclusive deals","Save big with daily offers and coupons"],["⭐","Loyalty rewards","Earn points on every order you place"]].map(([icon,title,desc])=>(
            <div key={title} style={s.featureItem}>
              <span style={s.featureIcon}>{icon}</span>
              <div><p style={s.featureTitle}>{title}</p><p style={s.featureDesc}>{desc}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h1 style={s.title}>Sign in</h1>
            <p style={s.sub}>Welcome back! Order your favourites.</p>
          </div>
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" value={form.email} placeholder="you@example.com" required onChange={e=>setForm({...form,email:e.target.value})}/>
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" value={form.password} placeholder="Your password" required onChange={e=>setForm({...form,password:e.target.value})}/>
            </div>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading?<span style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}><span style={s.spinner}/>Signing in...</span>:"Sign In →"}
            </button>
          </form>
          <div style={s.divider}><span style={s.dividerText}>or</span></div>
          <div style={s.socialRow}>
            {["🔵 Continue with Google","⚫ Continue with Apple"].map(l=>(
              <button key={l} style={s.socialBtn} onClick={()=>toast("Coming soon!")}>{l}</button>
            ))}
          </div>
          <p style={s.footer}>Don't have an account? <Link to="/register" style={s.link}>Create one free →</Link></p>
        </div>
      </div>
    </div>
  );
}

export function Register(){
  const [form,setForm]=useState({name:"",email:"",password:"",phone:"",address:""});
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(1);
  const {register}=useAuth();
  const navigate=useNavigate();
  const submit=async e=>{
    e.preventDefault();
    if(form.password.length<6){toast.error("Password must be 6+ chars");return;}
    setLoading(true);
    try{await register(form);toast.success("Account created! Let's eat 🍔");navigate("/");}
    catch(err){toast.error(err.response?.data?.message||"Registration failed");}
    finally{setLoading(false);}
  };
  return(
    <div style={s.page}>
      <div style={s.bgGlow}/>
      <div style={s.left}>
        <div style={s.brandWrap}>
          <div style={s.brandIcon}>⚡</div>
          <h2 style={s.brandName}>RapidRush</h2>
          <p style={s.brandTagline}>On-Demand Delivery</p>
        </div>
        <div style={s.statsGrid}>
          {[["500+","Restaurants"],["30 min","Avg Delivery"],["50K+","Happy Users"],["4.8★","App Rating"]].map(([v,l])=>(
            <div key={l} style={s.statBox}><p style={s.statVal}>{v}</p><p style={s.statLabel}>{l}</p></div>
          ))}
        </div>
        <p style={s.testimonial}>"RapidRush delivers faster than I can decide what to eat. Love it!" — Priya K.</p>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h1 style={s.title}>Create account</h1>
            <p style={s.sub}>Join 50,000+ happy food lovers.</p>
          </div>
          <div style={s.stepIndicator}>
            {[1,2].map(n=>(
              <div key={n} style={{...s.stepDot,background:step>=n?"var(--orange)":"var(--border2)",transform:step===n?"scale(1.2)":"scale(1)"}}/>
            ))}
            <span style={{fontSize:11,color:"var(--text3)"}}>Step {step} of 2</span>
          </div>
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
            {step===1?(
              <>
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input style={s.input} type="text" value={form.name} placeholder="Rahul Sharma" required onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input style={s.input} type="email" value={form.email} placeholder="you@example.com" required onChange={e=>setForm({...form,email:e.target.value})}/>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <input style={s.input} type="password" value={form.password} placeholder="Min 6 characters" required onChange={e=>setForm({...form,password:e.target.value})}/>
                </div>
                <button type="button" style={s.btn} onClick={()=>{if(!form.name||!form.email||!form.password){toast.error("Fill all fields");return;}setStep(2);}}>Continue →</button>
              </>
            ):(
              <>
                <div style={s.field}>
                  <label style={s.label}>Phone Number</label>
                  <input style={s.input} type="tel" value={form.phone} placeholder="+91 98765 43210" onChange={e=>setForm({...form,phone:e.target.value})}/>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Default Delivery Address</label>
                  <textarea style={{...s.input,height:80,resize:"none"}} value={form.address} placeholder="123 Main St, Sector 17, Chandigarh" onChange={e=>setForm({...form,address:e.target.value})}/>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button type="button" style={{...s.btn,background:"var(--bg3)",color:"var(--text2)",boxShadow:"none",flex:1}} onClick={()=>setStep(1)}>← Back</button>
                  <button style={{...s.btn,flex:2}} type="submit" disabled={loading}>
                    {loading?<span style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}><span style={s.spinner}/>Creating...</span>:"Create Account 🎉"}
                  </button>
                </div>
              </>
            )}
          </form>
          <p style={s.footer}>Already have an account? <Link to="/login" style={s.link}>Sign in →</Link></p>
        </div>
      </div>
    </div>
  );
}

const s={
  page:{minHeight:"100vh",background:"var(--bg)",display:"flex",overflow:"hidden"},
  bgGlow:{position:"fixed",top:"30%",left:"25%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,87,34,0.07) 0%,transparent 70%)",pointerEvents:"none"},
  left:{flex:1,background:"linear-gradient(160deg,#0F0A18,#090912)",borderRight:"1px solid var(--border)",padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"center",gap:40},
  brandWrap:{},
  brandIcon:{display:"inline-flex",width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,var(--orange),var(--orange2))",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 8px 24px rgba(255,87,34,0.4)",marginBottom:16},
  brandName:{fontSize:28,fontWeight:800,color:"var(--text)",margin:"0 0 4px",fontFamily:"var(--font-display)"},
  brandTagline:{fontSize:14,color:"var(--text3)",margin:0},
  featureList:{display:"flex",flexDirection:"column",gap:20},
  featureItem:{display:"flex",alignItems:"flex-start",gap:14},
  featureIcon:{fontSize:24,flexShrink:0,marginTop:2},
  featureTitle:{fontSize:14,fontWeight:700,color:"var(--text)",margin:"0 0 3px"},
  featureDesc:{fontSize:12,color:"var(--text3)",margin:0,lineHeight:1.5},
  statsGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
  statBox:{background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px"},
  statVal:{fontSize:22,fontWeight:800,color:"var(--text)",margin:"0 0 3px",fontFamily:"var(--font-display)"},
  statLabel:{fontSize:11,color:"var(--text3)",margin:0},
  testimonial:{background:"rgba(255,87,34,0.06)",border:"1px solid rgba(255,87,34,0.15)",borderRadius:14,padding:"16px 20px",fontSize:13,color:"var(--text2)",lineHeight:1.6,fontStyle:"italic"},
  right:{width:480,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 40px"},
  card:{width:"100%",maxWidth:420},
  cardHeader:{marginBottom:28},
  title:{fontSize:28,fontWeight:800,color:"var(--text)",margin:"0 0 8px",fontFamily:"var(--font-display)"},
  sub:{color:"var(--text3)",fontSize:14,margin:0},
  stepIndicator:{display:"flex",alignItems:"center",gap:8,marginBottom:20},
  stepDot:{width:8,height:8,borderRadius:"50%",transition:"all 0.3s"},
  field:{display:"flex",flexDirection:"column",gap:7},
  label:{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.6px"},
  input:{background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:12,padding:"13px 16px",fontSize:15,color:"var(--text)",outline:"none",boxSizing:"border-box",width:"100%",fontFamily:"inherit"},
  btn:{padding:"15px",background:"linear-gradient(135deg,var(--orange),var(--orange2))",border:"none",borderRadius:12,fontSize:16,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:"0 8px 24px rgba(255,87,34,0.35)",fontFamily:"var(--font-body)"},
  spinner:{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"},
  divider:{position:"relative",textAlign:"center",margin:"20px 0",borderTop:"1px solid var(--border)"},
  dividerText:{position:"relative",top:-10,background:"var(--bg)",padding:"0 12px",fontSize:12,color:"var(--text3)"},
  socialRow:{display:"flex",flexDirection:"column",gap:10,marginBottom:20},
  socialBtn:{padding:"13px",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:12,color:"var(--text2)",fontSize:14,fontWeight:600,cursor:"pointer"},
  footer:{textAlign:"center",color:"var(--text3)",fontSize:13,marginTop:20},
  link:{color:"var(--orange)",fontWeight:700,textDecoration:"none"},
};
