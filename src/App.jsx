import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "office-inventory-products-v1";
const MOVEMENTS_KEY = "office-inventory-movements-v1";

const todayKey = () => new Date().toLocaleDateString("en-CA");

const formatNumber = (value) =>
  new Intl.NumberFormat("he-IL").format(value || 0);

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

  const [showAddProduct, setShowAddProduct] = useState(false);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    minimum: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const summary = useMemo(() => {
    const totalItems = products.length;

    const lowStock = products.filter(
      (p) => p.quantity <= p.minimum
    ).length;

    return {
      totalItems,
      lowStock,
    };
  }, [products]);

  function addProduct(e) {
    e.preventDefault();

    const product = {
      id: Date.now(),
      name: form.name,
      quantity: Number(form.quantity),
      minimum: Number(form.minimum),
    };

    setProducts([product, ...products]);

    setForm({
      name: "",
      quantity: "",
      minimum: "",
    });

    setShowAddProduct(false);
  } 
  function removeStock(product) {
    const amount = Number(prompt("כמה יחידות להוציא?", "1"));

    if (!amount || amount <= 0) return;

    if (amount > product.quantity) {
      alert("אין מספיק מלאי");
      return;
    }

    setProducts(
      products.map((p) =>
        p.id === product.id
          ? { ...p, quantity: p.quantity - amount }
          : p
      )
    );
  }

  function addStock(product) {
    const amount = Number(prompt("כמה יחידות להכניס?", "1"));

    if (!amount || amount <= 0) return;

    setProducts(
      products.map((p) =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + amount }
          : p
      )
    );
  }

  function deleteProduct(id) {
    setProducts(products.filter((p) => p.id !== id));
  }

  return (
    <div
      dir="rtl"
      style={{
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>ניהול מלאי ציוד משרדי</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setShowAddProduct(true)}>
          הוספת מוצר
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>סה״כ מוצרים:</strong>{" "}
        {summary.totalItems}
        <br />
        <strong>מלאי נמוך:</strong>{" "}
        {summary.lowStock}
      </div>

      {showAddProduct && (
        <form onSubmit={addProduct}>
          <input
            placeholder="שם מוצר"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="כמות"
            value={form.quantity}
            onChange={(e) =>
              setForm({
                ...form,
                quantity: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="מינימום"
            value={form.minimum}
            onChange={(e) =>
              setForm({
                ...form,
                minimum: e.target.value,
              })
            }
          />

          <button type="submit">
            שמירה
          </button>
        </form>
      )}
            <div
        style={{
          display: "grid",
          gap: "12px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <h3>{product.name}</h3>

            <p>
              מלאי נוכחי: <b>{product.quantity}</b>
            </p>

            <p>
              מינימום: <b>{product.minimum}</b>
            </p>

            {product.quantity <= product.minimum && (
              <p style={{ color: "red" }}>
                ⚠ מלאי נמוך
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                onClick={() => addStock(product)}
              >
                הכנסה
              </button>

              <button
                onClick={() =>
                  removeStock(product)
