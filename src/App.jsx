import { useState } from "react";

export default function App() {
  const [products, setProducts] = useState([
    { id: 1, name: "עטים", qty: 50 },
    { id: 2, name: "מחברות", qty: 25 },
    { id: 3, name: "טושים", qty: 12 },
  ]);

  const [productName, setProductName] = useState("");

  function addProduct() {
    if (!productName.trim()) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name: productName,
        qty: 0,
      },
    ]);

    setProductName("");
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
        p.id === id
          ? { ...p, qty: Math.max(0, p.qty - 1) }
          : p
      )
    );
  }

  function deleteProduct(id) {
    setProducts(products.filter((p) => p.id !== id));
  }

  const totalStock = products.reduce(
    (sum, p) => sum + p.qty,
    0
  );

  return (
    <div
      dir="rtl"
      style={{
        background: "#f1f5f9",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#1e3a8a",
            textAlign: "center",
          }}
        >
          📦 ניהול מלאי ציוד משרדי
        </h1>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <h3>הוספת מוצר חדש</h3>

          <input
            value={productName}
            onChange={(e) =>
              setProductName(e.target.value)
            }
            placeholder="שם מוצר"
            style={{
              padding: "10px",
              width: "70%",
              marginLeft: "10px",
            }}
          />

          <button
            onClick={addProduct}
            style={{
              padding: "10px 15px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            הוסף מוצר
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              flex: 1,
            }}
          >
            <h3>{products.length}</h3>
            <p>מוצרים</p>
          </div>

          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              flex: 1,
            }}
          >
            <h3>{totalStock}</h3>
            <p>יחידות במלאי</p>
          </div>
        </div>

        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "10px",
              border:
                product.qty < 5
                  ? "2px solid red"
                  : "1px solid #ddd",
            }}
          >
            <h3>{product.name}</h3>

            <p>
              כמות במלאי:
              <strong>
                {" "}
                {product.qty}
              </strong>
            </p>

            <button
              onClick={() =>
                addStock(product.id)
              }
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
              }}
            >
              ➕ הכנסה
            </button>

            <button
              onClick={() =>
                removeStock(product.id)
              }
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
              }}
            >
              ➖ הוצאה
            </button>

            <button
              onClick={() =>
                deleteProduct(product.id)
              }
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              מחיקה
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
