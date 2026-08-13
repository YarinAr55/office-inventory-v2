import { useState } from "react";

export default function App() {
  const [products, setProducts] = useState(["עט", "מחברת"]);
  const [name, setName] = useState("");

  return (
    <div dir="rtl" style={{ padding: 20 }}>
      <h1>ניהול מלאי ציוד משרדי</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="שם מוצר"
      />

      <button
        onClick={() => {
          if (!name) return;
          setProducts([...products, name]);
          setName("");
        }}
      >
        הוסף מוצר
      </button>

      <hr />

      {products.map((product, index) => (
        <div key={index}>
          ✅ {product}
        </div>
      ))}
    </div>
  );
}
