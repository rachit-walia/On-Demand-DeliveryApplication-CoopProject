import React,{createContext,useContext,useState} from "react";
const C=createContext();
export function CartProvider({children}){
  const [cart,setCart]=useState({restaurantId:null,restaurantName:"",restaurantImage:"",deliveryFee:0,items:[]});
  const addItem=(restaurantId,restaurantName,restaurantImage,deliveryFee,item)=>{
    setCart(prev=>{
      if(prev.restaurantId&&prev.restaurantId!==restaurantId){if(!window.confirm("Adding from a different restaurant clears your cart. Continue?"))return prev;return{restaurantId,restaurantName,restaurantImage,deliveryFee,items:[{...item,quantity:1}]};}
      const ex=prev.items.find(i=>i.id===item.id);
      if(ex)return{...prev,items:prev.items.map(i=>i.id===item.id?{...i,quantity:i.quantity+1}:i)};
      return{...prev,restaurantId,restaurantName,restaurantImage,deliveryFee,items:[...prev.items,{...item,quantity:1}]};
    });
  };
  const removeItem=id=>setCart(prev=>{const items=prev.items.filter(i=>i.id!==id);return items.length?{...prev,items}:{restaurantId:null,restaurantName:"",restaurantImage:"",deliveryFee:0,items:[]};});
  const updateQty=(id,qty)=>{if(qty<=0){removeItem(id);return;}setCart(prev=>({...prev,items:prev.items.map(i=>i.id===id?{...i,quantity:qty}:i)}));};
  const clearCart=()=>setCart({restaurantId:null,restaurantName:"",restaurantImage:"",deliveryFee:0,items:[]});
  const total=cart.items.reduce((s,i)=>s+i.price*i.quantity,0);
  const itemCount=cart.items.reduce((s,i)=>s+i.quantity,0);
  return <C.Provider value={{cart,addItem,removeItem,updateQty,clearCart,total,itemCount}}>{children}</C.Provider>;
}
export const useCart=()=>useContext(C);
