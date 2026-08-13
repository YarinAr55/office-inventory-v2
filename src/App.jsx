import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Box,
  Boxes,
  Download,
  Edit3,
  History,
  Minus,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const initialItems = [
  {
    id: 1,
    name: "עט כדורי כחול",
    category: "כלי כתיבה",
    quantity: 120,
    minimum: 50,
    barcode: "729000001001",
    location: "מדף A1",
  },
  {
    id: 2,
    name: "מחברת משבצות A4",
    category: "מחברות",
    quantity: 14,
    minimum: 20,
    barcode: "729000001002",
    location: "מדף B2",
  },
  {
    id: 3,
    name: "עט הדגשה ורוד",
    category: "כלי כתיבה",
    quantity: 0,
    minimum: 40,
    barcode: "729000001003",
    location: "מדף A3",
  },
  {
    id: 4,
    name: "סיכות 26/6",
    category: "ציוד שולחני",
    quantity: 60,
    minimum: 30,
    barcode: "729000001004",
    location: "מדף C1",
  },
];

const emptyProduct = {
  name: "",
  category: "",
  quantity: 0,
  minimum: 0,
  barcode: "",
  location: "",
};

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function App() {
  const [items, setItems] = useState(() =>
    loadData("office_inventory_items_v2", initialItems)
  );
  const [movements, setMovements] = useState(() =>
    loadData("office_inventory_movements_v2", [])
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [movementForm, setMovementForm] = useState({
    amount: 1,
    employee: "",
    note: "",
  });

  useEffect(() => {
    localStorage.setItem("office_inventory_items_v2", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      "office_inventory_movements_v2",
      JSON.stringify(movements)
    );
  }, [movements]);

  const stats = useMemo(() => {
    const low = items.filter(
      (item) => item.quantity > 0 && item.quantity <= item.minimum
    ).length;
    const missing = items.filter((item) => item.quantity === 0).length;
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      products: items.length,
      totalUnits,
      low,
      missing,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.barcode.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term);

      const matchesFilter =
        filter === "all" ||
        (filter === "ok" && item.quantity > item.minimum) ||
        (filter === "low" &&
          item.quantity > 0 &&
          item.quantity <= item.minimum) ||
        (filter === "missing" && item.quantity === 0);

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  function statusOf(item) {
    if (item.quantity === 0) {
      return { label: "חסר", className: "status missing" };
    }
    if (item.quantity <= item.minimum) {
      return { label: "מלאי נמוך", className: "status low" };
    }
    return { label: "תקין", className: "status ok" };
  }

  function openAddProduct() {
    setProductForm(emptyProduct);
    setSelectedItem(null);
    setModal("product");
  }

  function openEditProduct(item) {
    setProductForm(item);
    setSelectedItem(item);
    setModal("product");
  }

  function saveProduct(event) {
    event.preventDefault();

    const normalized = {
      ...productForm,
      quantity: Math.max(0, Number(productForm.quantity) || 0),
      minimum: Math.max(0, Number(productForm.minimum) || 0),
    };

    if (!normalized.name.trim()) return;

    if (selectedItem) {
      setItems((current) =>
        current.map((item) =>
          item.id === selectedItem.id
            ? { ...normalized, id: selectedItem.id }
            : item
        )
      );
    } else {
      setItems((current) => [
        { ...normalized, id: Date.now() },
        ...current,
      ]);
    }

    closeModal();
  }

  function openMovement(type, item) {
    setSelectedItem(item);
    setMovementForm({ amount: 1, employee: "", note: "" });
    setModal(type);
  }

  function saveMovement(event) {
    event.preventDefault();

    const amount = Math.max(1, Number(movementForm.amount) || 1);
    const isRemove = modal === "remove";

    if (isRemove && amount > selectedItem.quantity) {
      alert("אין מספיק מלאי לביצוע ההוצאה.");
      return;
    }

    if (isRemove && !movementForm.employee.trim()) {
      alert("יש להזין את שם העובד שקיבל את הציוד.");
      return;
    }

    const newQuantity = isRemove
      ? selectedItem.quantity - amount
      : selectedItem.quantity + amount;

    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    setMovements((current) => [
      {
        id: Date.now(),
        date: new Date().toLocaleString("he-IL"),
        itemName: selectedItem.name,
        type: isRemove ? "הוצאה" : "קליטה",
        amount,
        employee: movementForm.employee || "מחסן",
        note: movementForm.note,
        balance: newQuantity,
      },
      ...current,
    ]);

    closeModal();
  }

  function deleteItem(item) {
    if (!window.confirm(`למחוק את "${item.name}"?`)) return;
    setItems((current) => current.filter((x) => x.id !== item.id));
  }

  function closeModal() {
    setModal(null);
    setSelectedItem(null);
  }

  function exportToExcel() {
    const headers = [
      "שם פריט",
      "קטגוריה",
      "כמות נוכחית",
      "כמות מינימום",
      "כמות להזמנה",
      "סטטוס",
      "ברקוד",
      "מיקום",
    ];

    const rows = items.map((item) => [
      item.name,
      item.category,
      item.quantity,
      item.minimum,
      Math.max(item.minimum - item.quantity, 0),
      statusOf(item).label,
      item.barcode,
      item.location,
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map(csvCell).join(","))
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `מלאי-ציוד-משרדי-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app" dir="rtl">
      <style>{styles}</style>

      <header className="topbar">
        <div>
          <p className="eyebrow">מערכת מחסן</p>
          <h1>ניהול מלאי ציוד משרדי</h1>
          <p className="subtitle">
            מעקב מלאי, קליטות, הוצאות והתראות מינימום
          </p>
        </div>

        <div className="headerActions">
          <button className="button secondary" onClick={exportToExcel}>
            <Download size={19} />
            ייצוא לאקסל
          </button>
          <button className="button primary" onClick={openAddProduct}>
            <Plus size={19} />
            מוצר חדש
          </button>
        </div>
      </header>

      <main className="content">
        <section className="summaryGrid">
          <SummaryCard
            title="סוגי מוצרים"
            value={stats.products}
            icon={<Boxes />}
            tone="blue"
          />
          <SummaryCard
            title="יחידות במלאי"
            value={stats.totalUnits}
            icon={<Archive />}
            tone="green"
          />
          <SummaryCard
            title="מלאי נמוך"
            value={stats.low}
            icon={<AlertTriangle />}
            tone="orange"
          />
          <SummaryCard
            title="חסר במלאי"
            value={stats.missing}
            icon={<Box />}
            tone="red"
          />
        </section>

        <section className="toolbar">
          <div className="searchBox">
            <Search size={20} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="חיפוש לפי מוצר, ברקוד, קטגוריה או מיקום"
            />
          </div>

          <div className="filters">
            {[
              ["all", "הכול"],
              ["ok", "תקין"],
              ["low", "מלאי נמוך"],
              ["missing", "חסר"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? "filter active" : "filter"}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="sectionHeading">
          <div>
            <h2>המלאי שלי</h2>
            <p>{filteredItems.length} מוצרים מוצגים</p>
          </div>
        </div>

        <section className="productGrid">
          {filteredItems.map((item) => {
            const status = statusOf(item);
            const orderAmount = Math.max(item.minimum - item.quantity, 0);

            return (
              <article className="productCard" key={item.id}>
                <div className="cardTop">
                  <div className="productIcon">
                    <Box size={24} />
                  </div>
                  <span className={status.className}>{status.label}</span>
                </div>

                <div className="productInfo">
                  <p className="category">{item.category || "ללא קטגוריה"}</p>
                  <h3>{item.name}</h3>
                  <p className="location">
                    {item.location || "לא הוגדר מיקום"}
                  </p>
                </div>

                <div className="stockNumbers">
                  <div>
                    <span>במלאי</span>
                    <strong>{item.quantity}</strong>
                  </div>
                  <div>
                    <span>מינימום</span>
                    <strong>{item.minimum}</strong>
                  </div>
                  <div>
                    <span>להזמנה</span>
                    <strong className={orderAmount ? "dangerText" : ""}>
                      {orderAmount}
                    </strong>
                  </div>
                </div>

                <div className="progress">
                  <div
                    className={
                      item.quantity === 0
                        ? "progressFill red"
                        : item.quantity <= item.minimum
                        ? "progressFill orange"
                        : "progressFill green"
                    }
                    style={{
                      width: `${Math.min(
                        100,
                        item.minimum
                          ? (item.quantity / item.minimum) * 100
                          : 100
                      )}%`,
                    }}
                  />
                </div>

                <p className="barcode">
                  ברקוד: {item.barcode || "לא הוגדר"}
                </p>

                <div className="cardActions">
                  <button
                    className="iconButton receive"
                    title="קליטת מלאי"
                    onClick={() => openMovement("receive", item)}
                  >
                    <PackagePlus size={18} />
                    קליטה
                  </button>

                  <button
                    className="iconButton remove"
                    title="הוצאת מלאי"
                    disabled={item.quantity === 0}
                    onClick={() => openMovement("remove", item)}
                  >
                    <Minus size={18} />
                    הוצאה
                  </button>

                  <button
                    className="squareButton"
                    title="עריכת מוצר"
                    onClick={() => openEditProduct(item)}
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    className="squareButton delete"
                    title="מחיקת מוצר"
                    onClick={() => deleteItem(item)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            );
          })}

          {!filteredItems.length && (
            <div className="emptyState">
              <Search size={34} />
              <h3>לא נמצאו מוצרים</h3>
              <p>נסה לשנות את החיפוש או הסינון.</p>
            </div>
          )}
        </section>

        <section className="historySection">
          <div className="sectionHeading">
            <div>
              <h2>
                <History size={22} />
                היסטוריית תנועות
              </h2>
              <p>קליטות והוצאות שבוצעו במערכת</p>
            </div>
          </div>

          <div className="historyList">
            {movements.slice(0, 12).map((movement) => (
              <div className="historyRow" key={movement.id}>
                <div
                  className={
                    movement.type === "קליטה"
                      ? "movementIcon receive"
                      : "movementIcon remove"
                  }
                >
                  {movement.type === "קליטה" ? (
                    <Plus size={18} />
                  ) : (
                    <Minus size={18} />
                  )}
                </div>

                <div className="historyMain">
                  <strong>{movement.itemName}</strong>
                  <span>
                    {movement.type} של {movement.amount} יחידות
                  </span>
                </div>

                <div className="historyMeta">
                  <strong>{movement.employee}</strong>
                  <span>{movement.date}</span>
                </div>

                <div className="balance">יתרה: {movement.balance}</div>
              </div>
            ))}

            {!movements.length && (
              <div className="emptyHistory">
                עדיין לא בוצעו תנועות מלאי.
              </div>
            )}
          </div>
        </section>
      </main>

      {modal === "product" && (
        <Modal
          title={selectedItem ? "עריכת מוצר" : "הוספת מוצר חדש"}
          onClose={closeModal}
        >
          <form className="form" onSubmit={saveProduct}>
            <Field label="שם המוצר">
              <input
                required
                value={productForm.name}
                onChange={(event) =>
                  setProductForm({ ...productForm, name: event.target.value })
                }
              />
            </Field>

            <div className="formGrid">
              <Field label="קטגוריה">
                <input
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      category: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="מיקום">
                <input
                  value={productForm.location}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      location: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="כמות נוכחית">
                <input
                  type="number"
                  min="0"
                  value={productForm.quantity}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      quantity: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="כמות מינימום נדרשת">
                <input
                  type="number"
                  min="0"
                  value={productForm.minimum}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      minimum: event.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <Field label="ברקוד">
              <input
                value={productForm.barcode}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    barcode: event.target.value,
                  })
                }
              />
            </Field>

            <div className="modalActions">
              <button
                type="button"
                className="button secondary"
                onClick={closeModal}
              >
                ביטול
              </button>
              <button type="submit" className="button primary">
                שמירה
              </button>
            </div>
          </form>
        </Modal>
      )}

      {(modal === "receive" || modal === "remove") && selectedItem && (
        <Modal
          title={
            modal === "receive"
              ? `קליטת מלאי: ${selectedItem.name}`
              : `הוצאת מלאי: ${selectedItem.name}`
          }
          onClose={closeModal}
        >
          <form className="form" onSubmit={saveMovement}>
            <div className="currentStock">
              יתרה נוכחית: <strong>{selectedItem.quantity}</strong>
            </div>

            <Field label="כמות">
              <input
                autoFocus
                required
                type="number"
                min="1"
                max={modal === "remove" ? selectedItem.quantity : undefined}
                value={movementForm.amount}
                onChange={(event) =>
                  setMovementForm({
                    ...movementForm,
                    amount: event.target.value,
                  })
                }
              />
            </Field>

            <Field
              label={
                modal === "remove"
                  ? "שם העובד שמקבל את הציוד"
                  : "שם מקבל המשלוח / מבצע הקליטה"
              }
            >
              <input
                required={modal === "remove"}
                value={movementForm.employee}
                onChange={(event) =>
                  setMovementForm({
                    ...movementForm,
                    employee: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="הערה">
              <textarea
                rows="3"
                value={movementForm.note}
                onChange={(event) =>
                  setMovementForm({
                    ...movementForm,
                    note: event.target.value,
                  })
                }
              />
            </Field>

            <div className="modalActions">
              <button
                type="button"
                className="button secondary"
                onClick={closeModal}
              >
                ביטול
              </button>
              <button type="submit" className="button primary">
                אישור הפעולה
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, tone }) {
  return (
    <div className={`summaryCard ${tone}`}>
      <div className="summaryIcon">{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modalHeader">
          <h2>{title}</h2>
          <button className="closeButton" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f5f7fb; color: #172033; }
  button, input, textarea { font: inherit; }
  button { cursor: pointer; }
  .app { min-height: 100vh; font-family: Arial, "Segoe UI", sans-serif; }
  .topbar {
    padding: 30px clamp(18px, 5vw, 70px);
    background: linear-gradient(135deg, #102a56, #155eef);
    color: white; display: flex; justify-content: space-between;
    align-items: center; gap: 24px; flex-wrap: wrap;
  }
  .eyebrow { margin: 0 0 6px; color: #cfe0ff; font-weight: 700; }
  h1 { margin: 0; font-size: clamp(26px, 4vw, 42px); }
  .subtitle { margin: 8px 0 0; color: #dbe7ff; }
  .headerActions { display: flex; gap: 10px; flex-wrap: wrap; }
  .content { padding: 24px clamp(16px, 5vw, 70px) 60px; max-width: 1500px; margin: auto; }
  .button {
    border: 0; padding: 12px 17px; border-radius: 12px;
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px; font-weight: 700;
  }
  .button.primary { background: #1267e8; color: white; }
  .topbar .button.primary { background: white; color: #155eef; }
  .button.secondary { background: white; color: #25324b; border: 1px solid #d9e0ec; }
  .summaryGrid {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px; margin-top: -46px;
  }
  .summaryCard {
    background: white; min-height: 125px; border-radius: 20px;
    box-shadow: 0 12px 35px rgba(32,55,92,.11); padding: 22px;
    display: flex; align-items: center; gap: 18px;
  }
  .summaryCard span { display: block; color: #6c7890; margin-bottom: 8px; }
  .summaryCard strong { font-size: 32px; }
  .summaryIcon {
    width: 52px; height: 52px; border-radius: 16px;
    display: grid; place-items: center;
  }
  .summaryCard.blue .summaryIcon { color:#1665d8; background:#e8f1ff; }
  .summaryCard.green .summaryIcon { color:#07875b; background:#e6f8f1; }
  .summaryCard.orange .summaryIcon { color:#c76800; background:#fff1dc; }
  .summaryCard.red .summaryIcon { color:#d92d20; background:#ffebe9; }
  .toolbar {
    margin: 26px 0; background: white; border: 1px solid #e3e8f0;
    border-radius: 18px; padding: 14px; display: flex; gap: 14px;
    align-items: center; justify-content: space-between; flex-wrap: wrap;
  }
  .searchBox {
    flex: 1; min-width: 260px; display: flex; gap: 10px;
    align-items: center; background: #f7f9fc; border-radius: 12px;
    padding: 0 13px; color: #738098;
  }
  .searchBox input { border: 0; outline: 0; background: transparent; padding: 13px 0; width: 100%; }
  .filters { display: flex; gap: 7px; flex-wrap: wrap; }
  .filter { border: 0; background: #f0f3f8; color: #526079; padding: 9px 13px; border-radius: 10px; font-weight: 700; }
  .filter.active { color: white; background: #155eef; }
  .sectionHeading { display: flex; justify-content: space-between; align-items: end; margin: 25px 0 14px; }
  .sectionHeading h2 { margin: 0; display: flex; align-items: center; gap: 8px; }
  .sectionHeading p { margin: 5px 0 0; color: #7a869b; }
  .productGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 17px; }
  .productCard {
    background: white; border: 1px solid #e3e8f0; border-radius: 20px;
    padding: 19px; box-shadow: 0 5px 18px rgba(30,48,78,.05);
  }
  .cardTop, .cardActions { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .productIcon { width: 45px; height: 45px; border-radius: 14px; display: grid; place-items: center; color: #155eef; background: #edf4ff; }
  .status { padding: 7px 10px; border-radius: 999px; font-size: 13px; font-weight: 800; }
  .status.ok { color:#067647; background:#e8f7f0; }
  .status.low { color:#a34d00; background:#fff0d7; }
  .status.missing { color:#b42318; background:#fee9e7; }
  .productInfo { margin: 17px 0; }
  .productInfo h3 { margin: 4px 0; font-size: 20px; }
  .category, .location, .barcode { margin: 0; color: #7a869b; font-size: 14px; }
  .stockNumbers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stockNumbers div { background: #f7f9fc; border-radius: 12px; padding: 10px; text-align: center; }
  .stockNumbers span { display: block; color:#7a869b; font-size:12px; margin-bottom:5px; }
  .stockNumbers strong { font-size:21px; }
  .dangerText { color:#d92d20; }
  .progress { height: 7px; background: #edf0f5; border-radius: 99px; overflow: hidden; margin: 14px 0 10px; }
  .progressFill { height: 100%; border-radius: 99px; min-width: 3px; }
  .progressFill.green { background:#14a673; }
  .progressFill.orange { background:#f79009; }
  .progressFill.red { background:#e5484d; }
  .barcode { direction: ltr; text-align: right; }
  .cardActions { margin-top: 17px; border-top: 1px solid #edf0f5; padding-top: 14px; justify-content: flex-start; flex-wrap: wrap; }
  .iconButton, .squareButton {
    border: 0; border-radius: 10px; min-height: 38px; display: inline-flex;
    align-items: center; justify-content: center; gap: 6px; font-weight: 700;
  }
  .iconButton { padding: 8px 11px; }
  .iconButton.receive { color:#087955; background:#e9f8f2; }
  .iconButton.remove { color:#aa4f00; background:#fff1dc; }
  .iconButton:disabled { opacity:.45; cursor:not-allowed; }
  .squareButton { width:38px; color:#526079; background:#eef2f7; }
  .squareButton.delete { color:#c4322b; background:#feeeec; }
  .historySection { margin-top: 36px; }
  .historyList { background:white; border:1px solid #e3e8f0; border-radius:18px; overflow:hidden; }
  .historyRow { display:grid; grid-template-columns:45px 1fr 1fr auto; gap:14px; padding:15px 18px; align-items:center; border-bottom:1px solid #edf0f5; }
  .movementIcon { width:38px; height:38px; display:grid; place-items:center; border-radius:11px; }
  .movementIcon.receive { color:#087955; background:#e9f8f2; }
  .movementIcon.remove { color:#aa4f00; background:#fff1dc; }
  .historyMain span, .historyMeta span { display:block; margin-top:4px; color:#7a869b; font-size:13px; }
  .balance { background:#f2f5fa; padding:8px 10px; border-radius:9px; font-weight:700; }
  .emptyHistory, .emptyState { padding:35px; text-align:center; color:#7a869b; }
  .emptyState { background:white; grid-column:1/-1; border-radius:18px; border:1px dashed #ccd5e3; }
  .modalBackdrop { position:fixed; inset:0; background:rgba(11,20,35,.56); display:grid; place-items:center; padding:16px; z-index:100; }
  .modal { width:min(590px, 100%); max-height:92vh; overflow:auto; background:white; border-radius:20px; padding:21px; box-shadow:0 24px 70px rgba(0,0,0,.25); }
  .modalHeader { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #edf0f5; padding-bottom:14px; margin-bottom:18px; }
  .modalHeader h2 { margin:0; font-size:22px; }
  .closeButton { border:0; background:#eef2f7; width:38px; height:38px; border-radius:10px; display:grid; place-items:center; }
  .form, .field { display:grid; gap:8px; }
  .form { gap:15px; }
  .formGrid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
  .field span { font-weight:700; color:#3f4b61; }
  .field input, .field textarea { width:100%; border:1px solid #ccd5e3; border-radius:11px; padding:12px; outline:none; }
  .field input:focus, .field textarea:focus { border-color:#155eef; box-shadow:0 0 0 3px #e7efff; }
  .modalActions { display:flex; justify-content:flex-end; gap:9px; margin-top:7px; }
  .currentStock { background:#edf4ff; color:#155eef; padding:13px; border-radius:11px; }
  @media (max-width: 1000px) {
    .summaryGrid { grid-template-columns:repeat(2, 1fr); }
    .productGrid { grid-template-columns:repeat(2, 1fr); }
  }
  @media (max-width: 650px) {
    .topbar { padding:24px 17px 60px; align-items:stretch; }
    .headerActions, .headerActions .button { width:100%; }
    .summaryGrid { grid-template-columns:1fr 1fr; margin-top:-45px; gap:10px; }
    .summaryCard { min-height:105px; padding:14px; gap:10px; }
    .summaryIcon { width:40px; height:40px; }
    .summaryCard strong { font-size:25px; }
    .productGrid { grid-template-columns:1fr; }
    .toolbar { align-items:stretch; }
    .searchBox { min-width:100%; }
    .formGrid { grid-template-columns:1fr; }
    .historyRow { grid-template-columns:40px 1fr; }
    .historyMeta, .balance { grid-column:2; }
  }
`;
