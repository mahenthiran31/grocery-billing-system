import {useEffect,useState} from "react";
import {api} from "../services/api";

const statusMeta={
  AVAILABLE:{icon:"✓",label:"Available",className:"available"},
  OCCUPIED:{icon:"👥",label:"Occupied",className:"occupied"}
};

export default function Tables(){
  const [tables,setTables]=useState([]),[num,setNum]=useState(""),[seats,setSeats]=useState(4),[busy,setBusy]=useState(false);
  async function load(){try{setTables((await api("/tables")).tables)}catch(e){alert(e.message)}}
  useEffect(()=>{load()},[]);
  async function add(e){
    e.preventDefault();
    try{await api("/tables",{method:"POST",body:JSON.stringify({tableNumber:Number(num),seats:Number(seats)})});setNum("");setSeats(4);load()}
    catch(e){alert(e.message)}
  }
  async function clearTable(id){
    if(!confirm("Mark this table as available? Make sure its active order is completed or cancelled."))return;
    setBusy(true);
    try{await api(`/tables/${id}/status`,{method:"PATCH",body:JSON.stringify({status:"AVAILABLE"})});await load()}
    catch(e){alert(e.message)}
    finally{setBusy(false)}
  }
  const available=tables.filter(t=>t.status==="AVAILABLE").length;
  const occupied=tables.filter(t=>t.status==="OCCUPIED").length;
  return <div className="tables-page">
    <div className="panel table-hero">
      <div className="panel-title">
        <div><p className="eyebrow">RESTAURANT POS & BILLING</p><h2>Table Management</h2><p className="muted">Manage seating at a glance. Green means ready for the next customer.</p></div>
        <form className="inline-form" onSubmit={add}><input value={num} onChange={e=>setNum(e.target.value)} placeholder="Table no." type="number" min="1" required/><input value={seats} onChange={e=>setSeats(e.target.value)} type="number" min="1" max="20" aria-label="Seats"/><button className="primary">+ Add Table</button></form>
      </div>
      <div className="table-summary">
        <div className="table-summary-card"><span className="summary-icon">🪑</span><div><small>Total Tables</small><strong>{tables.length}</strong></div></div>
        <div className="table-summary-card ready"><span className="summary-icon">✓</span><div><small>Available</small><strong>{available}</strong></div></div>
        <div className="table-summary-card busy"><span className="summary-icon">👥</span><div><small>Occupied</small><strong>{occupied}</strong></div></div>
      </div>
    </div>
    <div className="panel">
      <div className="section-heading"><div><h2>Restaurant Tables</h2><p className="muted">Click <b>Make Available</b> after an order is completed or cancelled.</p></div><button className="secondary" onClick={load}>↻ Refresh</button></div>
      <div className="table-grid">{tables.map(t=>{
        const meta=statusMeta[t.status]||statusMeta.AVAILABLE;
        return <div className={`table-card ${meta.className}`} key={t.id}>
          <div className="table-graphic"><span className="table-number">{t.table_number}</span><span className="chair chair-a">♿</span><span className="chair chair-b">♿</span><span className="chair chair-c">♿</span><span className="chair chair-d">♿</span><span className="table-shape">TABLE</span></div>
          <div className="table-info"><div><strong>Table {t.table_number}</strong><span>{t.seats} seats</span></div><span className="badge table-status">{meta.icon} {meta.label}</span></div>
          {t.status==="OCCUPIED" && <button disabled={busy} className="table-action" onClick={()=>clearTable(t.id)}>✓ Make Available</button>}
          {t.status==="AVAILABLE" && <div className="table-ready-note">Ready for next order</div>}
        </div>
      })}</div>
    </div>
  </div>
}
