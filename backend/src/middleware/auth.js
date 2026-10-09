import { verifyToken } from "../utils/auth.js";
export function auth(req,res,next){try{const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))return res.status(401).json({message:"Authentication required"});req.user=verifyToken(h.slice(7));next()}catch{res.status(401).json({message:"Invalid or expired session"})}}
