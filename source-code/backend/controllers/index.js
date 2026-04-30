// ─── userController ──────────────────────────────────────────────────────────
const { v4:uuid } = require("uuid");
const db = require("../middleware/localDB");

const register = (req,res)=>{
  const {name,email,password,phone,address}=req.body;
  if(!name||!email||!password) return res.status(400).json({message:"name,email,password required"});
  if(db.findOne("users","email",email)) return res.status(409).json({message:"Email already registered"});
  const user={id:uuid(),name,email,password,phone:phone||"",address:address||"",role:"customer",loyaltyPoints:0,totalOrders:0,totalSpent:0,savedAddresses:[],createdAt:new Date().toISOString()};
  db.insertOne("users",user);
  const {password:_,...safe}=user;
  res.status(201).json({message:"Registered",user:safe,token:user.id});
};

const login = (req,res)=>{
  const {email,password}=req.body;
  if(!email||!password) return res.status(400).json({message:"email,password required"});
  const user=db.findOne("users","email",email);
  if(!user||user.password!==password) return res.status(401).json({message:"Invalid credentials"});
  const {password:_,...safe}=user;
  res.json({message:"Login successful",user:safe,token:user.id});
};

const getProfile    = (req,res)=>{ const {password:_,...s}=req.user; res.json(s); };
const updateProfile = (req,res)=>{
  const {name,phone,address,savedAddresses}=req.body;
  const updates={};
  if(name!==undefined) updates.name=name;
  if(phone!==undefined) updates.phone=phone;
  if(address!==undefined) updates.address=address;
  if(savedAddresses!==undefined) updates.savedAddresses=savedAddresses;
  const u=db.updateOne("users",req.user.id,updates);
  const {password:_,...s}=u;
  res.json({message:"Updated",user:s});
};

// ─── restaurantController ────────────────────────────────────────────────────
const getRestaurants=(req,res)=>{
  const {cuisine,search,veg,category,sort}=req.query;
  let list=db.read("restaurants");
  if(cuisine) list=list.filter(r=>r.cuisine.toLowerCase()===cuisine.toLowerCase());
  if(search)  list=list.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())||r.cuisine.toLowerCase().includes(search.toLowerCase()));
  if(veg==="true") list=list.filter(r=>r.isPureVeg||r.menu.some(m=>m.isVeg));
  if(category) list=list.filter(r=>r.categories&&r.categories.includes(category));
  if(sort==="rating")   list.sort((a,b)=>b.rating-a.rating);
  if(sort==="delivery") list.sort((a,b)=>parseInt(a.deliveryTime)-parseInt(b.deliveryTime));
  if(sort==="cost_asc") list.sort((a,b)=>a.minOrder-b.minOrder);
  res.json(list.map(({menu,...r})=>({...r,itemCount:menu.length})));
};
const getRestaurant=(req,res)=>{ const r=db.findOne("restaurants","id",req.params.id); if(!r) return res.status(404).json({message:"Not found"}); res.json(r); };
const getCuisines=(req,res)=>res.json([...new Set(db.read("restaurants").map(r=>r.cuisine))]);
const getCategories=(req,res)=>res.json(db.read("categories"));
const search=(req,res)=>{
  const q=(req.query.q||"").toLowerCase();
  if(!q) return res.json({restaurants:[],items:[]});
  const rests=db.read("restaurants");
  const matchedRests=rests.filter(r=>r.name.toLowerCase().includes(q)||r.cuisine.toLowerCase().includes(q)||r.tags.some(t=>t.toLowerCase().includes(q))).map(({menu,...r})=>({...r,itemCount:menu.length}));
  const matchedItems=[];
  rests.forEach(r=>{ r.menu.filter(m=>m.name.toLowerCase().includes(q)||m.description.toLowerCase().includes(q)).forEach(m=>matchedItems.push({...m,restaurantId:r.id,restaurantName:r.name,restaurantImage:r.image})); });
  res.json({restaurants:matchedRests,items:matchedItems.slice(0,10)});
};

// ─── orderController ─────────────────────────────────────────────────────────
const placeOrder=(req,res)=>{
  try{
    const {restaurantId,items,deliveryAddress,paymentMethod,couponCode,deliveryInstructions}=req.body;
    if(!restaurantId||!items||!items.length||!deliveryAddress) return res.status(400).json({message:"restaurantId,items,deliveryAddress required"});
    const restaurant=db.findOne("restaurants","id",restaurantId);
    if(!restaurant) return res.status(404).json({message:"Restaurant not found"});
    let subtotal=0;
    const orderItems=items.map(item=>{
      const mi=restaurant.menu.find(m=>m.id===item.menuItemId);
      if(!mi) throw new Error("Menu item not found: "+item.menuItemId);
      const itemTotal=mi.price*item.quantity;
      subtotal+=itemTotal;
      return {...mi,quantity:item.quantity,itemTotal};
    });
    let discount=0;
    if(couponCode){
      const offer=db.read("offers").find(o=>o.code===couponCode.toUpperCase());
      if(offer&&subtotal>=offer.minOrder){
        if(offer.type==="percent") discount=Math.min(Math.round(subtotal*offer.discount/100),offer.maxDiscount||9999);
        else if(offer.type==="flat") discount=offer.discount;
      }
    }
    const deliveryFee=restaurant.deliveryFee;
    const tax=Math.round(subtotal*0.05);
    const platformFee=10;
    const total=subtotal+deliveryFee+tax+platformFee-discount;
    const loyaltyEarned=Math.floor(total/10);
    const availableRiders=db.read("riders").filter(r=>r.status==="available");
    const assignedRider=availableRiders.length>0?availableRiders[0]:null;
    const order={
      id:uuid(),userId:req.user.id,
      restaurantId,restaurantName:restaurant.name,restaurantImage:restaurant.image,
      items:orderItems,deliveryAddress,deliveryInstructions:deliveryInstructions||"",
      paymentMethod:paymentMethod||"cash",
      status:"pending",couponCode:couponCode||null,
      subtotal,deliveryFee,tax,platformFee,discount,total,
      loyaltyEarned,estimatedTime:restaurant.deliveryTime,
      assignedRider:assignedRider?{id:assignedRider.id,name:assignedRider.name,phone:assignedRider.phone,rating:assignedRider.rating,vehicle:assignedRider.vehicle}:null,
      timeline:[{status:"pending",time:new Date().toISOString(),message:"Order placed successfully"}],
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    };
    db.insertOne("orders",order);
    db.updateOne("users",req.user.id,{loyaltyPoints:(req.user.loyaltyPoints||0)+loyaltyEarned,totalOrders:(req.user.totalOrders||0)+1,totalSpent:(req.user.totalSpent||0)+total});
    const steps=["confirmed","preparing","out_for_delivery","delivered"];
    const delays=[3000,8000,15000,25000];
    const msgs=["Restaurant confirmed your order","Chef is preparing your meal","Rider picked up your order","Order delivered!"];
    steps.forEach((s,i)=>setTimeout(()=>{ const o=db.findOne("orders","id",order.id); if(!o||o.status==="cancelled")return; const tl=[...o.timeline,{status:s,time:new Date().toISOString(),message:msgs[i]}]; db.updateOne("orders",order.id,{status:s,timeline:tl,updatedAt:new Date().toISOString()}); },delays[i]));
    res.status(201).json({message:"Order placed",order});
  }catch(e){ res.status(500).json({message:e.message}); }
};
const getUserOrders=(req,res)=>{ const orders=db.findMany("orders",o=>o.userId===req.user.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); res.json(orders); };
const getOrder=(req,res)=>{ const o=db.findOne("orders","id",req.params.id); if(!o) return res.status(404).json({message:"Not found"}); if(o.userId!==req.user.id) return res.status(403).json({message:"Unauthorized"}); res.json(o); };
const cancelOrder=(req,res)=>{ const o=db.findOne("orders","id",req.params.id); if(!o) return res.status(404).json({message:"Not found"}); if(o.userId!==req.user.id) return res.status(403).json({message:"Unauthorized"}); if(!["pending","confirmed"].includes(o.status)) return res.status(400).json({message:"Cannot cancel now"}); const tl=[...o.timeline,{status:"cancelled",time:new Date().toISOString(),message:"Order cancelled by customer"}]; res.json({message:"Cancelled",order:db.updateOne("orders",o.id,{status:"cancelled",timeline:tl,updatedAt:new Date().toISOString()})}); };
const reorder=(req,res)=>{ const o=db.findOne("orders","id",req.params.id); if(!o) return res.status(404).json({message:"Not found"}); if(o.userId!==req.user.id) return res.status(403).json({message:"Unauthorized"}); res.json({restaurantId:o.restaurantId,items:o.items.map(i=>({menuItemId:i.id,quantity:i.quantity}))}); };

// ─── offersController ────────────────────────────────────────────────────────
const getOffers=(req,res)=>res.json(db.read("offers"));
const validateCoupon=(req,res)=>{
  const {code,orderTotal}=req.body;
  if(!code) return res.status(400).json({message:"code required"});
  const offer=db.read("offers").find(o=>o.code===code.toUpperCase());
  if(!offer) return res.status(404).json({message:"Invalid coupon code"});
  if(orderTotal<offer.minOrder) return res.status(400).json({message:`Minimum order ₹${offer.minOrder} required`});
  let discountAmount=0;
  if(offer.type==="percent") discountAmount=Math.min(Math.round(orderTotal*offer.discount/100),offer.maxDiscount||9999);
  else if(offer.type==="flat") discountAmount=offer.discount;
  res.json({valid:true,offer,discountAmount});
};

// ─── riderController ─────────────────────────────────────────────────────────
const toRad=d=>d*Math.PI/180;
function haversine(a,b,c,d){ const R=6371,dL=toRad(c-a),dN=toRad(d-b); const x=Math.sin(dL/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dN/2)**2; return parseFloat((R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(2)); }
const getRiders=(req,res)=>res.json(db.read("riders"));
const getRider=(req,res)=>{ const r=db.findOne("riders","id",req.params.id); if(!r) return res.status(404).json({message:"Not found"}); res.json(r); };
const getRoute=(req,res)=>{ const {fromLat,fromLng,toLat,toLng}=req.query; if(!fromLat||!fromLng||!toLat||!toLng) return res.status(400).json({message:"coords required"}); const fLat=parseFloat(fromLat),fLng=parseFloat(fromLng),tLat=parseFloat(toLat),tLng=parseFloat(toLng); const distanceKm=haversine(fLat,fLng,tLat,tLng); const estimatedMinutes=Math.round(distanceKm*4+5); const steps=10; const waypoints=Array.from({length:steps+2},(_,i)=>{ const t=i/(steps+1),curve=Math.sin(t*Math.PI)*0.005; return {lat:fLat+(tLat-fLat)*t+curve,lng:fLng+(tLng-fLng)*t}; }); res.json({from:{lat:fLat,lng:fLng},to:{lat:tLat,lng:tLng},distanceKm,estimatedMinutes,waypoints}); };

// ─── reviewsController ────────────────────────────────────────────────────────
const getReviews=(req,res)=>res.json(db.findMany("reviews",r=>r.restaurantId===req.params.restaurantId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
const addReview=(req,res)=>{ const {restaurantId,rating,comment,orderId}=req.body; if(!restaurantId||!rating) return res.status(400).json({message:"restaurantId,rating required"}); const review={id:uuid(),userId:req.user.id,userName:req.user.name,restaurantId,rating:parseInt(rating),comment:comment||"",orderId:orderId||null,createdAt:new Date().toISOString()}; db.insertOne("reviews",review); res.status(201).json({message:"Review added",review}); };

module.exports = { register,login,getProfile,updateProfile, getRestaurants,getRestaurant,getCuisines,getCategories,search, placeOrder,getUserOrders,getOrder,cancelOrder,reorder, getOffers,validateCoupon, getRiders,getRider,getRoute, getReviews,addReview };
