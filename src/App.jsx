import { useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");

  function addProduct() {
    if (!name.trim()) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name,
      },
    ]);

    setName("");
  }

  return (
    <div dir="rtl" style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>ניהול מלאי ציוד משרדי</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="שם מוצר"
      />

      <button onClick={addProduct}>
        הוסף מוצר
      </button>

      <hr />

      {products.map((product) => (
        <div key={product.id}>
          ✅ {product.name}
        </div>
      ))}
    </div>
  );
}
