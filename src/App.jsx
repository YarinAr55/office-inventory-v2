import { useState } from "react";

export default function App() {
  const [products, setProducts] = useState([
    { id: 1, name: "עט", qty: 50 },
    { id: 2, name: "מחברת", qty: 25 }
  ]);

  const [name, setName] = useState("");

  function addProduct() {
    if (!name.trim()) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name,
        qty: 0,
      },
    ]);

    setName("");
  }

  function addStock(id) {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, qty: p.qty + 1 } : p
      )
    );
  }

  function removeStock(id) {
    setProducts(
      products.map((p) =>
        p.id === id && p.qty > 0
          ? { ...p, qty: p.qty - 1 }
          : p
      )
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        padding: 20,
        fontFamily: "Arial",
        maxWidth: 800,
        margin: "auto",
      }}
    >
      <h1>📦 ניהול מלאי ציוד משרדי</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם מוצר חדש"
          style={{ padding: 8, marginLeft: 10 }}
        />

        <button onClick={addProduct}>
          ➕ הוסף מוצר
        </button>
      </div>

      <h3>סה״כ מוצרים: {products.length}</h3>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 15,
            marginBottom: 10,
            background: "#f8fafc",
          }}
        >
          <h3>{product.name}</h3>

          <p>
            כמות במלאי: <b>{product.qty}</b>
          </p>

          <button
            onClick={() => addStock(product.id)}
            style={{ marginLeft: 10 }}
          >
            ➕
          </button>

          <button
            onClick={() => removeStock(product.id)}
          >
            ➖
          </button>
        </div>
      ))}
    </div>
  );
}
