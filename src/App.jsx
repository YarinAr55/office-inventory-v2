from pathlib import Path

code = r'''import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "office-inventory-products-v1";
const MOVEMENTS_KEY = "office-inventory-movements-v1";

const todayKey = () => new Date().toLocaleDateString("en-CA");
const formatNumber = (value) => new Intl.NumberFormat("he-IL").format(value || 0);

function loadLocalStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [products, setProducts] = useState(() =>
    loadLocalStorage(STORAGE_KEY, [])
  );
  const [movements, setMovements] = useState(() =>
    loadLocalStorage(MOVEMENTS_KEY, [])
  );
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    minimum: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2400);
    return () => clearTimeout(timer);
  }, [message]);

  const takenTodayByProduct = useMemo(() => {
    return movements.reduce((acc, movement) => {
      if (movement.type === "out" && movement.date === todayKey()) {
        acc[movement.productId] =
          (acc[movement.productId] || 0) + movement.quantity;
      }
      return acc;
    }, {});
  }, [movements]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
  }, [products, search]);

  const summary = useMemo(() => {
    const units = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStock = products.filter(
      (product) => product.quantity <= product.minimum
    ).length;
    const takenToday = Object.values(takenTodayByProduct).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
    return { units, lowStock, takenToday };
  }, [products, takenTodayByProduct]);

  function addProduct(event) {
    event.preventDefault();
    const name = form.name.trim();
    const category = form.category.trim();
    const quantity = Number(form.quantity);
    const minimum = Number(form.minimum);

    if (!name) {
      setMessage("יש להזין שם מוצר");
      return;
    }

    if (quantity < 0 || minimum < 0 || !Number.isFinite(quantity) || !Number.isFinite(minimum)) {
      setMessage("כמות ומינימום חייבים להיות מספרים חיוביים");
      return;
    }

    const product = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      name,
      category: category || "ללא קטגוריה",
      quantity,
      minimum,
      createdAt: new Date().toISOString(),
    };

    setProducts((current) => [product, ...current]);
    setMovements((current) =>
      quantity > 0
        ? [
            {
              id: `${Date.now()}-initial`,
              productId: product.id,
              productName: product.name,
              type: "in",
              quantity,
              date: todayKey(),
              createdAt: new Date().toISOString(),
            },
            ...current,
          ]
        : current
    );
    setForm({ name: "", category: "", quantity: "", minimum: "" });
    setShowAddProduct(false);
    setMessage("המוצר נוסף בהצלחה");
  }

  function updateStock(product, type) {
    const label = type === "out" ? "להוציא" : "להכניס";
    const answer = window.prompt(`כמה יחידות ${label} עבור ${product.name}?`, "1");
    if (answer === null) return;

    const quantity = Number(answer);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setMessage("יש להזין מספר שלם גדול מאפס");
      return;
    }

    if (type === "out" && quantity > product.quantity) {
      setMessage("אין מספיק מלאי לביצוע ההוצאה");
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity:
                type === "out"
                  ? item.quantity - quantity
                  : item.quantity + quantity,
            }
          : item
      )
    );

    setMovements((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        productId: product.id,
        productName: product.name,
        type,
        quantity,
        date: todayKey(),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setMessage(type === "out" ? "המלאי הוצא בהצלחה" : "המלאי עודכן בהצלחה");
  }

  function deleteProduct(product) {
    const approved = window.confirm(`למחוק את ${product.name}?`);
    if (!approved) return;
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setMovements((current) =>
      current.filter((movement) => movement.productId !== product.id)
    );
    setMessage("המוצר נמחק");
  }

  function exportToExcel() {
    if (!products.length) {
      setMessage("אין מוצרים לייצוא");
      return;
    }

    const headers = [
      "שם מוצר",
      "קטגוריה",
      "מלאי נוכחי",
      "מינימום",
      "נלקח היום",
      "סטטוס",
    ];

    const rows = products.map((product) => [
      product.name,
      product.category,
      product.quantity,
      product.minimum,
      takenTodayByProduct[product.id] || 0,
      product.quantity <= product.minimum ? "מלאי נמוך" : "תקין",
    ]);

    const escapeCell = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory-${todayKey()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("קובץ האקסל הורד בהצלחה");
  }

  return (
    <div className="app" dir="rtl">
      <style>{`
        :root {
          font-family: Inter, Arial, sans-serif;
          color: #162033;
          background: #f4f7fb;
          font-synthesis: none;
        }
        * { box-sizing: border-box; }
        body { margin: 0; min-width: 320px; background: #f4f7fb; }
        button, input { font: inherit; }
        button { cursor: pointer; }
        .app { min-height: 100vh; background: radial-gradient(circle at top right, #e8f1ff 0, #f4f7fb 35%, #f4f7fb 100%); }
        .header {
          background: linear-gradient(120deg, #102a56, #1769d2);
          color: white;
          padding: 28px clamp(18px, 5vw, 70px) 72px;
        }
        .header-row, .toolbar, .modal-actions, .card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-row { justify-content: space-between; flex-wrap: wrap; }
        h1 { margin: 0 0 7px; font-size: clamp(27px, 4vw, 42px); }
        .subtitle { margin: 0; color: #dceaff; }
        .primary, .secondary, .stock-button, .delete-button {
          border: 0;
          border-radius: 12px;
          padding: 11px 17px;
          font-weight: 700;
          transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
        }
        button:hover { transform: translateY(-1px); }
        .primary { background: #2f80ed; color: white; box-shadow: 0 8px 22px rgba(47, 128, 237, .28); }
        .header .primary { background: white; color: #1559ad; }
        .secondary { background: #edf3fb; color: #27415f; }
        .container { width: min(1180px, calc(100% - 32px)); margin: -43px auto 0; padding-bottom: 50px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .stat, .product-card, .empty, .modal {
          background: rgba(255,255,255,.96);
          border: 1px solid #e4ebf5;
          box-shadow: 0 12px 32px rgba(26, 55, 90, .08);
        }
        .stat { border-radius: 18px; padding: 20px; }
        .stat-label { color: #6b7890; font-size: 14px; }
        .stat-value { display: block; margin-top: 7px; font-size: 28px; font-weight: 800; }
        .warning-text { color: #d35d24; }
        .toolbar { justify-content: space-between; margin: 28px 0 18px; flex-wrap: wrap; }
        .search { flex: 1; min-width: 220px; max-width: 430px; border: 1px solid #dae3ef; background: white; border-radius: 13px; padding: 12px 15px; outline: none; }
        .search:focus, .field input:focus { border-color: #2f80ed; box-shadow: 0 0 0 3px rgba(47,128,237,.12); }
        .toolbar-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 17px; }
        .product-card { border-radius: 18px; padding: 19px; position: relative; overflow: hidden; }
        .product-card.low { border-color: #ffc8a9; background: linear-gradient(145deg, #fff, #fff8f3); }
        .card-top { display: flex; justify-content: space-between; gap: 12px; }
        .product-name { margin: 0; font-size: 20px; }
        .category { margin: 6px 0 0; color: #77849a; font-size: 14px; }
        .badge { align-self: flex-start; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 800; white-space: nowrap; background: #e7f6ed; color: #23834e; }
        .badge.low { background: #fff0e7; color: #c85119; }
        .stock { margin: 23px 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .stock-cell { padding: 10px 4px; text-align: center; background: #f5f8fc; border-radius: 11px; }
        .stock-cell small { display: block; color: #79879b; margin-bottom: 5px; }
        .stock-cell strong { font-size: 18px; }
        .card-actions { border-top: 1px solid #edf1f6; padding-top: 15px; }
        .stock-button { flex: 1; background: #eaf3ff; color: #1764c0; }
        .stock-button.out { background: #fff2e9; color: #b94f1e; }
        .delete-button { background: transparent; color: #8995a7; padding-inline: 10px; }
        .empty { text-align: center; border-radius: 22px; padding: 65px 20px; }
        .empty-icon { width: 70px; height: 70px; margin: 0 auto 17px; display: grid; place-items: center; border-radius: 20px; background: #eaf3ff; color: #1d6dcc; font-size: 34px; }
        .empty h2 { margin: 0 0 9px; }
        .empty p { color: #718097; margin: 0 0 20px; }
        .overlay { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; padding: 18px; background: rgba(9, 24, 46, .55); backdrop-filter: blur(4px); }
        .modal { width: min(520px, 100%); border-radius: 22px; padding: 25px; }
        .modal h2 { margin: 0 0 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .field.full { grid-column: 1 / -1; }
        .field label { display: block; font-size: 14px; font-weight: 700; margin-bottom: 7px; }
        .field input { width: 100%; border: 1px solid #dce4ef; border-radius: 12px; padding: 11px 12px; outline: none; }
        .modal-actions { justify-content: flex-start; margin-top: 22px; }
        .toast { position: fixed; z-index: 20; bottom: 22px; left: 50%; transform: translateX(-50%); background: #17243a; color: white; padding: 12px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
        @media (max-width: 760px) {
          .header { padding-bottom: 62px; }
          .stats { grid-template-columns: 1fr 1fr; }
          .toolbar { align-items: stretch; }
          .search { max-width: none; width: 100%; flex-basis: 100%; }
          .toolbar-buttons { width: 100%; }
          .toolbar-buttons button { flex: 1; }
        }
        @media (max-width: 460px) {
          .container { width: min(100% - 20px, 1180px); }
          .stats { gap: 9px; }
          .stat { padding: 15px; }
          .stat-value { font-size: 23px; }
          .form-grid { grid-template-columns: 1fr; }
          .field.full { grid-column: auto; }
          .stock { gap: 5px; }
          .card-actions { flex-wrap: wrap; }
        }
      `}</style>

      <header className="header">
        <div className="header-row">
          <div>
            <h1>ניהול מלאי ציוד משרדי</h1>
            <p className="subtitle">מעקב פשוט, מהיר ונוח אחר מלאי המחסן</p>
          </div>
          <button className="primary" onClick={() => setShowAddProduct(true)}>
            ＋ הוספת מוצר
          </button>
        </div>
      </header>

      <main className="container">
        <section className="stats">
          <div className="stat">
            <span className="stat-label">מוצרים במערכת</span>
            <strong className="stat-value">{formatNumber(products.length)}</strong>
          </div>
          <div className="stat">
            <span className="stat-label">יחידות במלאי</span>
            <strong className="stat-value">{formatNumber(summary.units)}</strong>
          </div>
          <div className="stat">
            <span className="stat-label">נלקח היום</span>
            <strong className="stat-value">{formatNumber(summary.takenToday)}</strong>
          </div>
          <div className="stat">
            <span className="stat-label">מלאי נמוך</span>
            <strong className="stat-value warning-text">{formatNumber(summary.lowStock)}</strong>
          </div>
        </section>

        <section className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="חיפוש לפי מוצר או קטגוריה..."
            aria-label="חיפוש מוצרים"
          />
          <div className="toolbar-buttons">
            <button className="secondary" onClick={exportToExcel}>
              ⇩ ייצוא לאקסל
            </button>
            <button className="primary" onClick={() => setShowAddProduct(true)}>
              ＋ מוצר חדש
            </button>
          </div>
        </section>

        {products.length === 0 ? (
          <section className="empty">
            <div className="empty-icon">□</div>
            <h2>המחסן עדיין ריק</h2>
            <p>הוסף את המוצר הראשון כדי להתחיל לנהל את המלאי.</p>
            <button className="primary" onClick={() => setShowAddProduct(true)}>
              הוספת מוצר ראשון
            </button>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="empty">
            <h2>לא נמצאו מוצרים</h2>
            <p>נסה לחפש שם או קטגוריה אחרים.</p>
          </section>
        ) : (
          <section className="grid">
            {filteredProducts.map((product) => {
              const isLow = product.quantity <= product.minimum;
              const takenToday = takenTodayByProduct[product.id] || 0;
              return (
                <article className={`product-card ${isLow ? "low" : ""}`} key={product.id}>
                  <div className="card-top">
                    <div>
                      <h2 className="product-name">{product.name}</h2>
                      <p className="category">{product.category}</p>
                    </div>
                    <span className={`badge ${isLow ? "low" : ""}`}>
                      {isLow ? "מלאי נמוך" : "תקין"}
                    </span>
                  </div>

                  <div className="stock">
                    <div className="stock-cell">
                      <small>במלאי</small>
                      <strong>{formatNumber(product.quantity)}</strong>
                    </div>
                    <div className="stock-cell">
                      <small>מינימום</small>
                      <strong>{formatNumber(product.minimum)}</strong>
                    </div>
                    <div className="stock-cell">
                      <small>נלקח היום</small>
                      <strong>{formatNumber(takenToday)}</strong>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="stock-button" onClick={() => updateStock(product, "in")}>
                      ＋ הכנסה
                    </button>
                    <button className="stock-button out" onClick={() => updateStock(product, "out")}>
                      − הוצאה
                    </button>
                    <button className="delete-button" onClick={() => deleteProduct(product)} title="מחיקת מוצר">
                      מחיקה
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {showAddProduct && (
        <div className="overlay" onMouseDown={() => setShowAddProduct(false)}>
          <form className="modal" onSubmit={addProduct} onMouseDown={(event) => event.stopPropagation()}>
            <h2>הוספת מוצר חדש</h2>
            <div className="form-grid">
              <div className="field full">
                <label>שם המוצר</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="לדוגמה: מחברת משבצות"
                />
              </div>
              <div className="field full">
                <label>קטגוריה</label>
                <input
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  placeholder="לדוגמה: כלי כתיבה"
                />
              </div>
              <div className="field">
                <label>כמות התחלתית</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="field">
                <label>מינימום למוצר</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.minimum}
                  onChange={(event) => setForm({ ...form, minimum: event.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="submit" className="primary">שמירת מוצר</button>
              <button type="button" className="secondary" onClick={() => setShowAddProduct(false)}>
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {message && <div className="toast">{message}</div>}
    </div>
  );
}
'''

path = Path('/mnt/data/App.jsx')
path.write_text(code, encoding='utf-8')
print(path)
print('lines:', len(code.splitlines()), 'bytes:', path.stat().st_size)

