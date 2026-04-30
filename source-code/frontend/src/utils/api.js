import axios from "axios";
const API = axios.create({baseURL:"http://localhost:5000/api"});
API.interceptors.request.use(cfg=>{const t=localStorage.getItem("rr_token");if(t)cfg.headers.Authorization="Bearer "+t;return cfg;});

export const userAPI    = { register:(d)=>API.post("/users/register",d), login:(d)=>API.post("/users/login",d), getProfile:()=>API.get("/users/profile"), updateProfile:(d)=>API.put("/users/profile",d) };
export const restAPI    = { getAll:(p)=>API.get("/restaurants",{params:p}), getOne:(id)=>API.get("/restaurants/"+id), getCuisines:()=>API.get("/restaurants/cuisines"), getCategories:()=>API.get("/restaurants/categories"), search:(q)=>API.get("/restaurants/search",{params:{q}}) };
export const orderAPI   = { place:(d)=>API.post("/orders",d), getAll:()=>API.get("/orders"), getOne:(id)=>API.get("/orders/"+id), cancel:(id)=>API.put("/orders/"+id+"/cancel"), reorder:(id)=>API.get("/orders/"+id+"/reorder") };
export const offerAPI   = { getAll:()=>API.get("/offers"), validate:(d)=>API.post("/offers/validate",d) };
export const riderAPI   = { getAll:()=>API.get("/riders"), getRoute:(p)=>API.get("/riders/route",{params:p}) };
export const reviewAPI  = { getFor:(id)=>API.get("/reviews/"+id), add:(d)=>API.post("/reviews",d) };
export default API;
