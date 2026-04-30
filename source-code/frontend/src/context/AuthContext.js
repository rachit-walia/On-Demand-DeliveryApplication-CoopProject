// AuthContext.js
import React,{createContext,useContext,useState,useEffect} from "react";
import {userAPI} from "../utils/api";
const A=createContext();
export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=localStorage.getItem("rr_token"),u=localStorage.getItem("rr_user");if(t&&u)try{setUser(JSON.parse(u));}catch(_){}setLoading(false);},[]);
  const login=async(email,password)=>{const r=await userAPI.login({email,password});localStorage.setItem("rr_token",r.data.token);localStorage.setItem("rr_user",JSON.stringify(r.data.user));setUser(r.data.user);return r.data;};
  const register=async(d)=>{const r=await userAPI.register(d);localStorage.setItem("rr_token",r.data.token);localStorage.setItem("rr_user",JSON.stringify(r.data.user));setUser(r.data.user);return r.data;};
  const logout=()=>{localStorage.removeItem("rr_token");localStorage.removeItem("rr_user");setUser(null);};
  const refreshUser=async()=>{try{const r=await userAPI.getProfile();setUser(r.data);localStorage.setItem("rr_user",JSON.stringify(r.data));}catch(_){}};
  return <A.Provider value={{user,login,register,logout,loading,refreshUser}}>{!loading&&children}</A.Provider>;
}
export const useAuth=()=>useContext(A);
