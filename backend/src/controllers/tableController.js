import {db} from "../db.js";
export function list(req,res){res.json({tables:db.prepare("SELECT * FROM restaurant_tables ORDER BY table_number").all()})}
export function create(req,res){const {tableNumber,seats=4}=req.body;const r=db.prepare("INSERT INTO restaurant_tables(table_number,seats) VALUES(?,?)").run(Number(tableNumber),Number(seats));res.status(201).json({table:db.prepare("SELECT * FROM restaurant_tables WHERE id=?").get(r.lastInsertRowid)})}
export function setStatus(req,res){
  const id=Number(req.params.id), status=String(req.body.status||"").toUpperCase();
  if(!["AVAILABLE","OCCUPIED"].includes(status)) return res.status(400).json({message:"Invalid table status"});
  const table=db.prepare("SELECT * FROM restaurant_tables WHERE id=?").get(id);
  if(!table) return res.status(404).json({message:"Table not found"});
  if(status==="AVAILABLE"){
    const active=db.prepare("SELECT order_number,status FROM orders WHERE table_id=? AND status NOT IN ('PAID','CANCELLED') ORDER BY id DESC LIMIT 1").get(id);
    if(active) return res.status(409).json({message:`Table ${table.table_number} has active order ${active.order_number}. Complete payment or cancel the order first.`});
  }
  db.prepare("UPDATE restaurant_tables SET status=? WHERE id=?").run(status,id);
  res.json({table:db.prepare("SELECT * FROM restaurant_tables WHERE id=?").get(id)});
}
