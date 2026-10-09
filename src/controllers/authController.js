import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { signToken } from "../utils/auth.js";
export async function login(req,res){const {mobile,password}=req.body;const user=db.prepare("SELECT * FROM users WHERE mobile=?").get(mobile);if(!user||!(await bcrypt.compare(password,user.password_hash)))return res.status(401).json({message:"Invalid mobile or password"});res.json({token:signToken(user),user:{id:user.id,name:user.name,mobile:user.mobile,role:user.role}})}
export function me(req,res){const u=db.prepare("SELECT id,name,mobile,role FROM users WHERE id=?").get(req.user.id);res.json({user:u})}
