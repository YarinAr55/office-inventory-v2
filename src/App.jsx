import { useEffect, useMemo, useState } from "react";

const PRODUCTS_KEY = "office-inventory-products";
const HISTORY_KEY = "office-inventory-history";

function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function today() {
  return new Date().toLocaleDateString("en-CA");
}

function formatDate(date) {
  return new Date(date).toLocaleString("he-IL");
}

export default function App() {
  const [products, setProducts] = useState(() =>
    loadData(PRODUCTS_KEY)
  );

  const [history, setHistory] = useState(() =>
    loadData(HISTORY_KEY)
  );

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    minimum: "",
  });

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const filteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text)
    );
  }, [products, search]);

  const takenToday = useMemo(() => {
    return history
      .filter(
        (item) =>
          item.type === "out" &&
          item.day === today()
      )
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [history]);

  const takenTodayByProduct = useMemo(() => {
    return history.reduce((result, item) => {
      if (
        item.type === "out" &&
        item.day === today()
      ) {
        result[item.productId] =
          (result[item.productId] || 0) +
          item.quantity;
      }

      return result;
    }, {});
  }, [history]);

  const totalUnits = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const lowStockCount = products.filter(
    (product) => product.quantity <= product.minimum
  ).length;

  function addProduct(event) {
    event.preventDefault();

    const name = form.name.trim();
    const category =
      form.category.trim() || "ללא קטגוריה";
    const quantity = Number(form.quantity) || 0;
    const minimum = Number(form.minimum) || 0;

    if (!name) {
      alert("יש להזין שם מוצר");
      return;
    }

    if (quantity < 0 || minimum < 0) {
      alert("הכמות והמינימום לא יכולים להיות שליליים");
      return;
    }

    const product = {
      id: Date.now(),
      name,
      category,
      quantity,
      minimum,
    };

    setProducts((current) => [
      product,
      ...current,
    ]);

    if (quantity > 0) {
      setHistory((current) => [
        {
          id: Date.now() + 1,
          productId: product.id,
          productName: product.name,
          type: "in",
          quantity,
          employee: "מלאי התחלתי",
          day: today(),
          date: new Date().toISOString(),
        },
        ...current,
      ]);
    }

    setForm({
      name: "",
      category: "",
      quantity: "",
      minimum: "",
    });

    setShowForm(false);
  }

  function changeStock(product, type) {
    const action =
      type === "in" ? "להכניס" : "להוציא";

    const amountInput = prompt(
      `כמה יחידות ${action}?`,
      "1"
    );

    if (amountInput === null) return;

    const quantity = Number(amountInput);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      alert("יש להזין מספר שלם גדול מאפס");
      return;
    }

    if (
      type === "out" &&
      quantity > product.quantity
    ) {
      alert("אין מספיק מלאי");
      return;
    }

    const employeeInput = prompt(
      type === "out"
        ? "מי לקח את הציוד?"
        : "מי הכניס את הציוד?",
      ""
    );

    if (employeeInput === null) return;

    const employee =
      employeeInput.trim() || "לא צוין";

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity:
                type === "in"
                  ? item.quantity + quantity
                  : item.quantity - quantity,
            }
          : item
      )
    );

    setHistory((current) => [
      {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        type,
        quantity,
        employee,
        day: today(),
        date: new Date().toISOString(),
      },
      ...current,
    ]);
  }

  function deleteProduct(product) {
    const approved = confirm(
      `למחוק את המוצר "${product.name}"?`
    );

    if (!approved) return;

    setProducts((current) =>
      current.filter(
        (item) => item.id !== product.id
      )
    );
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #eef4ff 0%, #f8fafc 55%, #eef2f7 100%)",
      color: "#172033",
      fontFamily: "Arial, sans-serif",
    },

    header: {
      background:
        "linear-gradient(120deg, #123b72, #2674d9)",
      color: "white",
      padding: "28px 20px 70px",
    },

    content: {
      width: "min(1100px, calc(100% - 28px))",
      margin: "-44px auto 0",
      paddingBottom: "50px",
    },

    card: {
      background: "white",
      borderRadius: "18px",
      padding: "18px",
      boxShadow:
        "0 10px 30px rgba(22, 45, 80, 0.09)",
      border: "1px solid #e6edf6",
    },

    button: {
      border: "none",
      borderRadius: "10px",
      padding: "10px 16px",
      cursor: "pointer",
      fontWeight: "bold",
    },

    input: {
      width: "100%",
      padding: "11px",
      borderRadius: "10px",
      border: "1px solid #d7e0ec",
      boxSizing: "border-box",
      fontSize: "16px",
    },
  };

  return (
    <div dir="rtl" style={styles.page}>
      <header style={styles.header}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
  
