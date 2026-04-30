import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {AuthProvider} from "./context/AuthContext";
import {CartProvider} from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar         from "./components/Navbar";
import Home           from "./pages/Home";
import RestaurantPage from "./pages/RestaurantPage";
import Cart           from "./pages/Cart";
import {Orders}       from "./pages/Orders";
import OrderDetail    from "./pages/OrderDetail";
import {Login,Register} from "./pages/Auth";
import Profile        from "./pages/Profile";
import OffersPage     from "./pages/OffersPage";
import RidersPage     from "./pages/RidersPage";

export default function App(){
  return(
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              style:{background:"#16161E",border:"1px solid rgba(255,255,255,0.08)",color:"#F5F5F7",borderRadius:14,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500,fontSize:14,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"},
              success:{iconTheme:{primary:"#FF5722",secondary:"#fff"}},
              error:{iconTheme:{primary:"#FF1744",secondary:"#fff"}},
            }}
          />
          <Navbar/>
          <Routes>
            <Route path="/"              element={<Home/>}/>
            <Route path="/login"         element={<Login/>}/>
            <Route path="/register"      element={<Register/>}/>
            <Route path="/restaurant/:id" element={<RestaurantPage/>}/>
            <Route path="/offers"        element={<OffersPage/>}/>
            <Route path="/riders"        element={<RidersPage/>}/>
            <Route path="/cart"          element={<ProtectedRoute><Cart/></ProtectedRoute>}/>
            <Route path="/orders"        element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
            <Route path="/orders/:id"    element={<ProtectedRoute><OrderDetail/></ProtectedRoute>}/>
            <Route path="/profile"       element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
