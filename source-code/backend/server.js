const express = require("express");
const cors    = require("cors");
const R       = require("./routes/index");
const app     = express();

app.use(cors({origin:"http://localhost:3000",credentials:true}));
app.use(express.json());
app.use((req,_,next)=>{ console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`); next(); });

app.use("/api/users",       R.user);
app.use("/api/restaurants", R.rest);
app.use("/api/orders",      R.order);
app.use("/api/offers",      R.offer);
app.use("/api/riders",      R.rider);
app.use("/api/reviews",     R.review);
app.get("/api/health", (_,res)=>res.json({status:"OK",time:new Date().toISOString()}));
app.use((_,res)=>res.status(404).json({message:"Not found"}));
app.use((err,_,res,__)=>res.status(500).json({message:err.message}));

const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{ console.log(`\n🚀 RapidRush API → http://localhost:${PORT}\n`); });
