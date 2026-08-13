import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Archive, Box, Boxes, Download, Edit3, History, Minus, PackagePlus, Plus, Search, Trash2, X } from "lucide-react";

const seed = [
  { id: 1, name: "עט כדורי כחול", category: "כלי כתיבה", quantity: 120, minimum: 50, barcode: "729000001001", location: "מדף A1" },
  { id: 2, name: "מחברת משבצות A4", category: "מחברות", quantity: 14, minimum: 20, barcode: "729000001002", location: "מדף B2" },
  { id: 3, name: "עט הדגשה ורוד", category: "כלי כתיבה", quantity: 0, minimum: 40, barcode: "729000001003", location: "מדף A3" },
  { id: 4, name: "סיכות 26/6", category: "ציוד שולחני", quantity: 60, minimum: 30, barcode: "729000001004", location: "מדף C1" },
];

const blankProduct = { name: "", category: "", quantity: 0, minimum: 0, barcode: "", location: "" };

function load(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function App() {
  const [items, setItems] = useState(() => load("office_inventory_items_v3", seed));
  const [movements, setMovements] = useState(() => load("office_inventory_movements_v3", []));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [product, setProduct] = useState(blankProduct);
  const [movement, setMovement] = useState({ amount: 1, employee: "", note: "" });

  useEffect(() => localStorage.setItem("office_inventory_items_v3", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("office_inventory_movements_v3", JSON.stringify(movements)), [movements]);

  const status = (item) => item.quantity === 0
    ? { label: "חסר", cls: "missing" }
    : item.quantity <= item.minimum
      ? { label: "מלאי נמוך", cls: "low" }
      : { label: "תקין", cls: "ok" };

  const stats = useMemo(() => ({
    products: items.length,
    units: items.reduce((sum, item) => sum + Number(item.quantity), 0),
    low: items.filter((item) => item.quantity > 0 && item.quantity <= item.minimum).length,
    missing: items.filter((item) => item.quantity === 0).length,
  }), [items]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const text = [item.name, item.category, item.barcode, item.location].join(" ").toLowerCase();
      const matchesText = !term || text.includes(term);
      const matchesFilter = filter === "all" ||
        (filter === "ok" && item.quantity > item.minimum) ||
        (filter === "low" && item.quantity > 0 && item.quantity <= item.minimum) ||
        (filter === "missing" && item.quantity === 0);
      return matchesText && matchesFilter;
    });
  }, [items, search, filter]);

  const close = () => { setModal(null); setSelected(null); };

  const openProduct = (item = null) => {
    setSelected(item);
    setProduct(item ? { ...item } : { ...blankProduct });
    setModal("product");
  };

  const saveProduct = (event) => {
    event.preventDefault();
    if (!product.name.trim()) return;
    const clean = { ...product, quantity: Math.max(0, Number(product.quantity) || 0), minimum: Math.max(0, Number(product.minimum) || 0) };
    setItems((current) => selected
      ? current.map((item) => item.id === selected.id ? { ...clean, id: selected.id } : item)
      : [{ ...clean, id: Date.now() }, ...current]);
    close();
  };

  const openMovement = (type, item) => {
    setSelected(item);
    setMovement({ amount: 1, employee: "", note: "" });
    setModal(type);
  };

  const saveMovement = (event) => {
    event.preventDefault();
    const amount = Math.max(1, Number(movement.amount) || 1);
    const removing = modal === "remove";
    if (removing && amount > selected.quantity) return alert("אין מספיק מלאי לביצוע ההוצאה.");
    if (removing && !movement.employee.trim()) return alert("יש להזין את שם העובד שקיבל את הציוד.");
    const balance = removing ? selected.quantity - amount : selected.quantity + amount;
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, quantity: balance } : item));
    setMovements((current) => [{
      id: Date.now(), date: new Date().toLocaleString("he-IL"), itemName: selected.name,
      type: removing ? "הוצאה" : "קליטה", amount, employee: movement.employee || "מחסן",
      note: movement.note, balance,
    }, ...current]);
    close();
  };

  const removeProduct = (item) => {
    if (confirm(`למחוק את "${item.name}"?`)) setItems((current) => current.filter((x) => x.id !== item.id));
  };

  const exportExcel = () => {
    const headers = ["שם פריט", "קטגוריה", "כמות נוכחית", "כמות מינימום", "כמות להזמנה", "סטטוס", "ברקוד", "מיקום"];
    const rows = items.map((item) => [item.name, item.category, item.quantity, item.minimum,
      Math.max(item.minimum - item.quantity, 0), status(item).label, item.barcode, item.location]);
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `מלאי-ציוד-משרדי-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return <div className="app" dir="rtl">
    <style>{styles}</style>
    <header className="topbar">
      <div><p className="eyebrow">מערכת מחסן</p><h1>ניהול מלאי ציוד משרדי</h1><p>מעקב מלאי, קליטות, הוצאות והתראות מינימום</p></div>
      <div className="actions"><button className="btn white" onClick={exportExcel}><Download size={18}/>ייצוא לאקסל</button><button className="btn white" onClick={() => openProduct()}><Plus size={18}/>מוצר חדש</button></div>
    </header>

    <main>
      <section className="summary">
        <Stat icon={<Boxes/>} title="סוגי מוצרים" value={stats.products} tone="blue"/>
        <Stat icon={<Archive/>} title="יחידות במלאי" value={stats.units} tone="green"/>
        <Stat icon={<AlertTriangle/>} title="מלאי נמוך" value={stats.low} tone="orange"/>
        <Stat icon={<Box/>} title="חסר במלאי" value={stats.missing} tone="red"/>
      </section>

      <section className="toolbar">
        <label className="search"><Search size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש מוצר, ברקוד, קטגוריה או מיקום"/></label>
        <div className="filters">{[["all","הכול"],["ok","תקין"],["low","מלאי נמוך"],["missing","חסר"]].map(([key,label]) => <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}</button>)}</div>
      </section>

      <div className="heading"><div><h2>המלאי שלי</h2><p>{visible.length} מוצרים מוצגים</p></div></div>
      <section className="grid">
        {visible.map((item) => {
          const s = status(item); const order = Math.max(item.minimum - item.quantity, 0);
          return <article className="card" key={item.id}>
            <div className="cardTop"><span className="boxIcon"><Box/></span><span className={`status ${s.cls}`}>{s.label}</span></div>
            <p className="muted">{item.category || "ללא קטגוריה"}</p><h3>{item.name}</h3><p className="muted">{item.location || "לא הוגדר מיקום"}</p>
            <div className="numbers"><div><span>במלאי</span><b>{item.quantity}</b></div><div><span>מינימום</span><b>{item.minimum}</b></div><div><span>להזמנה</span><b className={order ? "danger" : ""}>{order}</b></div></div>
            <div className="bar"><i className={s.cls} style={{ width: `${Math.min(100, item.minimum ? item.quantity / item.minimum * 100 : 100)}%` }}/></div>
            <p className="muted barcode">ברקוד: {item.barcode || "לא הוגדר"}</p>
            <div className="cardActions">
              <button className="small receive" onClick={() => openMovement("receive", item)}><PackagePlus size={17}/>קליטה</button>
              <button className="small issue" disabled={!item.quantity} onClick={() => openMovement("remove", item)}><Minus size={17}/>הוצאה</button>
              <button className="icon" onClick={() => openProduct(item)}><Edit3 size={17}/></button>
              <button className="icon delete" onClick={() => removeProduct(item)}><Trash2 size={17}/></button>
            </div>
          </article>;
        })}
        {!visible.length && <div className="empty"><Search size={34}/><h3>לא נמצאו מוצרים</h3></div>}
      </section>

      <section className="history"><div className="heading"><div><h2><History size={21}/> היסטוריית תנועות</h2><p>קליטות והוצאות שבוצעו במערכת</p></div></div>
        <div className="historyBox">{movements.slice(0, 12).map((m) => <div className="row" key={m.id}><span className={`move ${m.type === "קליטה" ? "receive" : "issue"}`}>{m.type === "קליטה" ? <Plus/> : <Minus/>}</span><div><b>{m.itemName}</b><small>{m.type} של {m.amount} יחידות</small></div><div><b>{m.employee}</b><small>{m.date}</small></div><strong className="balance">יתרה: {m.balance}</strong></div>)}{!movements.length && <div className="empty">עדיין לא בוצעו תנועות מלאי.</div>}</div>
      </section>
    </main>

    {modal === "product" && <Modal title={selected ? "עריכת מוצר" : "הוספת מוצר חדש"} close={close}><form onSubmit={saveProduct}>
      <Field label="שם המוצר"><input required value={product.name} onChange={(e) => setProduct({...product, name:e.target.value})}/></Field>
      <div className="formGrid"><Field label="קטגוריה"><input value={product.category} onChange={(e) => setProduct({...product, category:e.target.value})}/></Field><Field label="מיקום"><input value={product.location} onChange={(e) => setProduct({...product, location:e.target.value})}/></Field><Field label="כמות נוכחית"><input type="number" min="0" value={product.quantity} onChange={(e) => setProduct({...product, quantity:e.target.value})}/></Field><Field label="כמות מינימום נדרשת"><input type="number" min="0" value={product.minimum} onChange={(e) => setProduct({...product, minimum:e.target.value})}/></Field></div>
      <Field label="ברקוד"><input value={product.barcode} onChange={(e) => setProduct({...product, barcode:e.target.value})}/></Field>
      <div className="modalActions"><button type="button" className="btn" onClick={close}>ביטול</button><button className="btn primary">שמירה</button></div>
    </form></Modal>}

    {(modal === "receive" || modal === "remove") && selected && <Modal title={`${modal === "receive" ? "קליטת" : "הוצאת"} מלאי: ${selected.name}`} close={close}><form onSubmit={saveMovement}>
      <div className="current">יתרה נוכחית: <b>{selected.quantity}</b></div>
      <Field label="כמות"><input autoFocus required type="number" min="1" max={modal === "remove" ? selected.quantity : undefined} value={movement.amount} onChange={(e) => setMovement({...movement, amount:e.target.value})}/></Field>
      <Field label={modal === "remove" ? "שם העובד שמקבל את הציוד" : "שם מבצע הקליטה"}><input required={modal === "remove"} value={movement.employee} onChange={(e) => setMovement({...movement, employee:e.target.value})}/></Field>
      <Field label="הערה"><textarea rows="3" value={movement.note} onChange={(e) => setMovement({...movement, note:e.target.value})}/></Field>
      <div className="modalActions"><button type="button" className="btn" onClick={close}>ביטול</button><button className="btn primary">אישור הפעולה</button></div>
    </form></Modal>}
  </div>;
}

function Stat({ icon, title, value, tone }) { return <div className={`stat ${tone}`}><span>{icon}</span><div><small>{title}</small><strong>{value}</strong></div></div>; }
function Field({ label, children }) { return <label className="field"><b>{label}</b>{children}</label>; }
function Modal({ title, close, children }) { return <div className="backdrop" onMouseDown={close}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modalHead"><h2>{title}</h2><button onClick={close}><X/></button></div>{children}</div></div>; }

const styles = `
*{box-sizing:border-box}body{margin:0;background:#f5f7fb;color:#172033}button,input,textarea{font:inherit}button{cursor:pointer}.app{min-height:100vh;font-family:Arial,"Segoe UI",sans-serif}.topbar{padding:30px clamp(18px,5vw,70px) 70px;background:linear-gradient(135deg,#102a56,#155eef);color:white;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.topbar h1{margin:0;font-size:clamp(27px,4vw,42px)}.topbar p{margin:8px 0 0;color:#dbe7ff}.eyebrow{font-weight:800}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:1px solid #d9e0ec;background:white;color:#25324b;padding:11px 16px;border-radius:11px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:700}.btn.white{color:#155eef}.btn.primary{background:#155eef;color:white;border-color:#155eef}main{max-width:1500px;margin:auto;padding:0 clamp(16px,5vw,70px) 60px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-top:-43px}.stat{background:white;border-radius:19px;padding:21px;box-shadow:0 12px 35px #20375c1c;display:flex;align-items:center;gap:15px}.stat>span{width:50px;height:50px;border-radius:15px;display:grid;place-items:center}.stat small{display:block;color:#6c7890;margin-bottom:6px}.stat strong{font-size:30px}.stat.blue>span{color:#1665d8;background:#e8f1ff}.stat.green>span{color:#07875b;background:#e6f8f1}.stat.orange>span{color:#c76800;background:#fff1dc}.stat.red>span{color:#d92d20;background:#ffebe9}.toolbar{margin:25px 0;background:white;border:1px solid #e3e8f0;border-radius:17px;padding:13px;display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap}.search{flex:1;min-width:260px;background:#f7f9fc;border-radius:11px;padding:0 12px;display:flex;align-items:center;gap:9px;color:#738098}.search input{width:100%;padding:12px 0;border:0;outline:0;background:transparent}.filters{display:flex;gap:6px;flex-wrap:wrap}.filters button{border:0;padding:9px 12px;border-radius:9px;background:#f0f3f8;color:#526079;font-weight:700}.filters .active{background:#155eef;color:white}.heading{margin:25px 0 13px}.heading h2{margin:0;display:flex;align-items:center;gap:6px}.heading p{margin:5px 0;color:#7a869b}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card{background:white;border:1px solid #e3e8f0;border-radius:19px;padding:18px;box-shadow:0 5px 18px #1e304e0d}.cardTop{display:flex;justify-content:space-between;align-items:center}.boxIcon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;color:#155eef;background:#edf4ff}.status{padding:7px 10px;border-radius:999px;font-size:13px;font-weight:800}.status.ok{color:#067647;background:#e8f7f0}.status.low{color:#a34d00;background:#fff0d7}.status.missing{color:#b42318;background:#fee9e7}.card h3{margin:4px 0;font-size:20px}.muted{color:#7a869b;font-size:14px;margin:10px 0}.numbers{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.numbers div{background:#f7f9fc;border-radius:11px;padding:9px;text-align:center}.numbers span{display:block;color:#7a869b;font-size:12px;margin-bottom:4px}.numbers b{font-size:20px}.danger{color:#d92d20}.bar{height:7px;background:#edf0f5;border-radius:99px;overflow:hidden;margin:13px 0}.bar i{display:block;height:100%;min-width:3px}.bar .ok{background:#14a673}.bar .low{background:#f79009}.bar .missing{background:#e5484d}.barcode{direction:ltr;text-align:right}.cardActions{border-top:1px solid #edf0f5;padding-top:13px;display:flex;gap:7px;flex-wrap:wrap}.small,.icon{border:0;border-radius:9px;min-height:37px;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-weight:700}.small{padding:8px 10px}.small.receive{color:#087955;background:#e9f8f2}.small.issue{color:#aa4f00;background:#fff1dc}.small:disabled{opacity:.4;cursor:not-allowed}.icon{width:37px;color:#526079;background:#eef2f7}.icon.delete{color:#c4322b;background:#feeeec}.history{margin-top:35px}.historyBox{background:white;border:1px solid #e3e8f0;border-radius:17px;overflow:hidden}.row{display:grid;grid-template-columns:42px 1fr 1fr auto;gap:13px;align-items:center;padding:14px 17px;border-bottom:1px solid #edf0f5}.row:last-child{border-bottom:0}.row small{display:block;color:#7a869b;margin-top:4px}.move{width:37px;height:37px;border-radius:10px;display:grid;place-items:center}.move.receive{color:#087955;background:#e9f8f2}.move.issue{color:#aa4f00;background:#fff1dc}.balance{background:#f2f5fa;padding:8px 10px;border-radius:9px}.empty{grid-column:1/-1;padding:35px;text-align:center;color:#7a869b;background:white;border-radius:17px}.backdrop{position:fixed;inset:0;background:#0b14238f;display:grid;place-items:center;padding:16px;z-index:50}.modal{width:min(580px,100%);max-height:92vh;overflow:auto;background:white;border-radius:19px;padding:20px}.modalHead{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #edf0f5;padding-bottom:13px;margin-bottom:16px}.modalHead h2{margin:0}.modalHead button{border:0;background:#eef2f7;width:37px;height:37px;border-radius:9px;display:grid;place-items:center}form,.field{display:grid;gap:8px}form{gap:14px}.formGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field input,.field textarea{width:100%;border:1px solid #ccd5e3;border-radius:10px;padding:11px;outline:0}.field input:focus,.field textarea:focus{border-color:#155eef;box-shadow:0 0 0 3px #e7efff}.modalActions{display:flex;justify-content:flex-end;gap:8px}.current{background:#edf4ff;color:#155eef;padding:12px;border-radius:10px}@media(max-width:1000px){.summary{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.topbar{padding:24px 17px 65px}.actions,.actions .btn{width:100%}.summary{grid-template-columns:1fr 1fr;gap:9px}.stat{padding:13px;gap:9px}.stat>span{width:39px;height:39px}.stat strong{font-size:24px}.grid{grid-template-columns:1fr}.search{min-width:100%}.formGrid{grid-template-columns:1fr}.row{grid-template-columns:38px 1fr}.row>div:nth-child(3),.balance{grid-column:2}}
`;
