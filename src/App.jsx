import { useState } from "react";

export default function App() {
  const [items, setItems] = useState([
    { id: 1, name: "עט כדורי כחול", qty: 120, min: 50 },
    { id: 2, name: "מחברת A4", qty: 14, min: 20 },
    { id: 3, name: "עט הדגשה ורוד", qty: 0, min: 40 },
  ]);

  const totalItems = items.length;
  const lowStock = items.filter(
    (item) => item.qty > 0 && item.qty <= item.min
  ).length;
  const outOfStock = items.filter((item) => item.qty === 0).length;

  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: "Arial",
        background: "#f5f7fb",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <h1>📦 ניהול מלאי ציוד משרדי</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 15,
          marginTop: 20,
        }}
      >
        <div style={card}>
          <h3>מוצרים</h3>
          
