import { useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");

  function addProduct() {
    if (!name) return;

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

  return (
    <div
      dir="rtl"
      style={{
        padding: 20,
        fontFamily: "Arial",
      }}
    >
      <h1>ניהול מלאי ציוד משרדי</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם מוצר"
        />

        <button onClick={addProduct}>
          הוסף מוצר
        </button>
      </div>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ddd",
