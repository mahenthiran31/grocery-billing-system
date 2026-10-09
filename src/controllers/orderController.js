import {db} from "../db.js";
import {createOrder,getOrder,updateStatus,pay} from "../services/orderService.js";
export function create(req,res){res.status(201).json({order:createOrder(req.body)})}
export function one(req,res){const order=getOrder(Number(req.params.id));if(!order)return res.status(404).json({message:"Order not found"});res.json({order})}
export function status(req,res){res.json({order:updateStatus(Number(req.params.id),req.body.status)})}
export function payment(req,res){res.json({order:pay(Number(req.params.id),req.body.method)})}
export function list(req,res){const status=String(req.query.status||"");const rows=db.prepare(`SELECT o.*,t.table_number,c.name customer_name FROM orders o LEFT JOIN restaurant_tables t ON t.id=o.table_id LEFT JOIN customers c ON c.id=o.customer_id WHERE (?='' OR o.status=?) ORDER BY o.id DESC LIMIT 200`).all(status,status);res.json({orders:rows.map(o=>({...o,items:db.prepare(`SELECT oi.*,m.name item_name FROM order_items oi JOIN menu_items m ON m.id=oi.menu_item_id WHERE oi.order_id=?`).all(o.id)}))})}
