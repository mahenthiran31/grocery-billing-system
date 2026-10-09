import {useEffect,useState} from "react";
import {api} from "../services/api";

const emptyForm={name:"",categoryId:"",price:"",stock:20,available:true,image:""};
const defaultImages={
  "Chicken Biryani":"/food/chicken-biryani.svg","Mutton Biryani":"/food/mutton-biryani.svg","Veg Meals":"/food/veg-meals.svg","Parotta":"/food/parotta.svg","Chicken 65":"/food/chicken-65.svg","Paneer 65":"/food/paneer-65.svg","Veg Fried Rice":"/food/veg-fried-rice.svg","Chicken Fried Rice":"/food/chicken-fried-rice.svg","Fresh Lime":"/food/fresh-lime.svg","Gulab Jamun":"/food/gulab-jamun.svg"
};
function imageFor(item){return item?.image||defaultImages[item?.name]||"/food/veg-meals.svg"}
function resizeImage(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=1000,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.84))};img.onerror=reject;img.src=reader.result};reader.onerror=reject;reader.readAsDataURL(file)})}

export default function Menu(){
  const[items,setItems]=useState([]),[cats,setCats]=useState([]),[form,setForm]=useState(emptyForm),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false);
  async function load(){const[a,b]=await Promise.all([api("/menu"),api("/menu/categories")]);setItems(a.items);setCats(b.categories)}
  useEffect(()=>{load()},[]);
  function updateForm(key,value){setForm(f=>({...f,[key]:value}))}
  async function pickImage(e){const file=e.target.files?.[0];if(!file)return;if(file.size>6*1024*1024){alert("Please choose an image below 6 MB.");return}try{updateForm("image",await resizeImage(file))}catch{alert("Could not read this image.")}}
  async function add(e){e.preventDefault();setSaving(true);try{await api("/menu",{method:"POST",body:JSON.stringify({...form,price:Number(form.price),stock:Number(form.stock),image:form.image||defaultImages[form.name]||null})});setForm(emptyForm);await load()}catch(e){alert(e.message)}finally{setSaving(false)}}
  function startEdit(item){setEditing(item.id);setForm({name:item.name,categoryId:item.category_id?String(item.category_id):"",price:item.price,stock:item.stock,available:Boolean(item.available),image:item.image||defaultImages[item.name]||""});window.scrollTo({top:0,behavior:"smooth"})}
  function cancelEdit(){setEditing(null);setForm(emptyForm)}
  async function saveEdit(e){e.preventDefault();setSaving(true);try{await api(`/menu/${editing}`,{method:"PUT",body:JSON.stringify({...form,price:Number(form.price),stock:Number(form.stock),image:form.image||null})});cancelEdit();await load()}catch(e){alert(e.message)}finally{setSaving(false)}}
  async function removeItem(item){if(!window.confirm(`Remove "${item.name}" from the menu?`))return;try{await api(`/menu/${item.id}`,{method:"DELETE"});await load()}catch(e){alert(e.message)}}
  async function toggleAvailability(item){try{await api(`/menu/${item.id}`,{method:"PUT",body:JSON.stringify({name:item.name,categoryId:item.category_id,price:item.price,stock:item.stock,available:!Boolean(item.available),image:item.image||defaultImages[item.name]||null})});await load()}catch(e){alert(e.message)}}
  return <div className="menu-page">
    <section className="panel menu-editor">
      <div className="panel-title"><div><div className="section-kicker">MENU MANAGEMENT</div><h2>{editing?"Edit Menu Item":"Build Your Menu"}</h2><p className="muted">Add attractive food photos, update prices and control availability.</p></div>{editing&&<button className="secondary" type="button" onClick={cancelEdit}>Cancel Edit</button>}</div>
      <form className="menu-form" onSubmit={editing?saveEdit:add}>
        <div className="menu-image-preview"><img src={form.image||defaultImages[form.name]||"/food/veg-meals.svg"} alt="Food preview"/><span>{form.image?"Custom image":"Menu preview"}</span></div>
        <div className="menu-fields">
          <label>Food name<input required value={form.name} onChange={e=>updateForm("name",e.target.value)} placeholder="e.g. Chicken Biryani"/></label>
          <label>Category<select value={form.categoryId} onChange={e=>updateForm("categoryId",e.target.value)}><option value="">Select category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Price (₹)<input required type="number" min="0" step="0.01" value={form.price} onChange={e=>updateForm("price",e.target.value)} placeholder="0.00"/></label>
          <label>Stock / Portions<input type="number" min="0" value={form.stock} onChange={e=>updateForm("stock",e.target.value)}/></label>
          <label className="image-upload">Food image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickImage}/><small>JPG, PNG or WebP · max 6 MB</small></label>
          <label className="checkbox-label"><input type="checkbox" checked={Boolean(form.available)} onChange={e=>updateForm("available",e.target.checked)}/> Available for ordering</label>
          <button className="primary" disabled={saving}>{saving?(editing?"Saving...":"Adding..."):(editing?"Save Changes":"Add to Menu")}</button>
        </div>
      </form>
    </section>

    <section className="panel menu-list-panel">
      <div className="panel-title"><div><div className="section-kicker">FOOD CATALOG</div><h2>Menu Items</h2></div><span className="count-pill">{items.length} items</span></div>
      <div className="table-wrap"><table className="menu-table"><thead><tr><th>Food</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{items.map(i=><tr key={i.id}>
          <td><div className="menu-food-cell"><img src={imageFor(i)} alt={i.name}/><div><strong>{i.name}</strong><small>Restaurant menu item</small></div></div></td><td>{i.category_name||"Uncategorized"}</td><td><strong>₹{Number(i.price).toFixed(2)}</strong></td><td>{i.stock}</td>
          <td><span className={i.available?"status-chip available-chip":"status-chip unavailable-chip"}><span/> {i.available?"Available":"Unavailable"}</span></td>
          <td><div className="action-buttons"><button className="action edit" onClick={()=>startEdit(i)}>✏️ Edit</button><button className="action toggle" onClick={()=>toggleAvailability(i)}>{i.available?"Disable":"Restore"}</button><button className="action delete" onClick={()=>removeItem(i)}>🗑️ Remove</button></div></td>
        </tr>)}</tbody></table></div>
    </section>
  </div>
}
