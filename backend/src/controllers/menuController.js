import {db} from "../db.js";
export function list(req,res){const q=String(req.query.q||"").trim();const category=String(req.query.category||"").trim();const rows=db.prepare(`SELECT m.*,c.name category_name FROM menu_items m LEFT JOIN categories c ON c.id=m.category_id WHERE (m.name LIKE ? OR COALESCE(c.name,'') LIKE ?) AND (?='' OR c.name=?) ORDER BY c.name,m.name`).all(`%${q}%`,`%${q}%`,category,category);res.json({items:rows})}
export function categories(req,res){res.json({categories:db.prepare("SELECT * FROM categories ORDER BY name").all()})}
export function create(req,res){const {name,categoryId,price,available=1,stock=0,image=null}=req.body;const r=db.prepare("INSERT INTO menu_items(name,category_id,price,available,stock,image) VALUES(?,?,?,?,?,?)").run(name,categoryId||null,Number(price),available?1:0,Number(stock),image||null);res.status(201).json({item:db.prepare("SELECT * FROM menu_items WHERE id=?").get(r.lastInsertRowid)})}
export function update(req,res){const {name,categoryId,price,available,stock,image}=req.body;const id=Number(req.params.id);db.prepare("UPDATE menu_items SET name=?,category_id=?,price=?,available=?,stock=?,image=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(name,categoryId||null,Number(price),available?1:0,Number(stock),image||null,id);res.json({item:db.prepare("SELECT * FROM menu_items WHERE id=?").get(id)})}

export function remove(req,res){
  const id=Number(req.params.id);
  const item=db.prepare("SELECT * FROM menu_items WHERE id=?").get(id);
  if(!item)return res.status(404).json({message:"Menu item not found"});
  const used=db.prepare("SELECT COUNT(*) count FROM order_items WHERE menu_item_id=?").get(id).count;
  if(used>0){
    db.prepare("UPDATE menu_items SET available=0,stock=0,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
    return res.json({message:"Item has previous orders, so it was disabled instead of permanently deleted."});
  }
  db.prepare("DELETE FROM menu_items WHERE id=?").run(id);
  res.json({message:"Menu item removed"});
}
