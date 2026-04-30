const { findOne } = require("./localDB");
module.exports = (req,res,next)=>{
  const token=(req.headers.authorization||"").split(" ")[1];
  if(!token) return res.status(401).json({message:"No token"});
  const user=findOne("users","id",token);
  if(!user)  return res.status(401).json({message:"Invalid token"});
  req.user=user; next();
};
