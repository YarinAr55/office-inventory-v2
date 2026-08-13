import { useState } from "react";

export default function App() {
  const [items, setItems] = useState([
    { id: 1, name: "עט כחול", qty: 120 },
    { id: 2, name: "מחברת שורות", qty: 45 },
    { id: 3, name: "טוש מחיק", qty: 18 },
  ]);

  const addItem = () => {
    const name = prompt("שם המוצר");
    if (!name) return;

    setItems([
      ...items,
      {
        id: Date.now(),
        name,
        qty: 1,
      },
    ]);
  };

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "Arial",
        padding: "24px",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#1e3a8a" }}>📦 ניהול מלאי ציוד משרדי</h1>

      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h3>סה״כ פריטים במחסן: {items.length}</h3>

        <button
          onClick={addItem}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ➕ הוסף מוצר
        </button>
      </div>

      <table
        style={{
          width: "100%",
          background: "white",
          borderCollapse: "collapse",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ background: "#2563eb", color: "white" }}>
            <th style={{ padding: "12px" }}>#</th>
            <th style={{ padding: "12px" }}>מוצר</th>
            <th style={{ padding: "12px" }}>כמות</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {item.id}
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {item.name}
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {item.qty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
