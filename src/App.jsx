import React, { useState, useEffect } from 'react';
import './App.css'; // או עיצוב משالك

function App() {
  // טעינת נתונים ראשוניים מ-localStorage או ברירת מחדל
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('office_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse inventory from localStorage', e);
      }
    }
    return [
      { id: 1, name: 'עטים כחולים', category: 'ציוד משרדי', quantity: 45, minStock: 10 },
      { id: 2, name: 'דפים A4 (חבילה)', category: 'נייר ודפוס', quantity: 8, minStock: 15 },
      { id: 3, name: 'קלסרים רחבים', category: 'ארכיון', quantity: 12, minStock: 5 },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  
  // טפסים להוספת מוצר חדש
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('ציוד משרדי');
  const [newQuantity, setNewQuantity] = useState('');
  const [newMinStock, setNewMinStock] = useState('');

  // שמירה אוטומטית ב-localStorage
  useEffect(() => {
    localStorage.setItem('office_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // הוספת פריט חדש
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName.trim() || newQuantity === '') return;

    const newItem = {
      id: Date.now(),
      name: newName.trim(),
      category: newCategory,
      quantity: parseInt(newQuantity, 10) || 0,
      minStock: parseInt(newMinStock, 10) || 5,
    };

    setInventory([newItem, ...inventory]);
    setNewName('');
    setNewQuantity('');
    setNewMinStock('');
  };

  // מחיקת פריט
  const handleDeleteItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  // שינוי כמות מהיר (+ / -)
  const handleUpdateQuantity = (id, delta) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const updatedQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: updatedQty };
      }
      return item;
    }));
  };

  // סינון פריטים לפי חיפוש וקטגוריה
  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'הכל' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['הכל', 'ציוד משרדי', 'נייר ודפוס', 'ארכיון', 'אחזקה וניקיון', 'אחר'];

  return (
    <div style={styles.container} dir="rtl">
      {/* כותרת ראשית */}
      <header style={styles.header}>
        <h1 style={styles.title}>📦 ניהול מלאי משרדי</h1>
        <p style={styles.subtitle}>מעקב חכם ופשוט אחר הציוד במשרד</p>
      </header>

      {/* אזור הוספת פריט חדש */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>➕ הוספת פריט חדש למלאי</h2>
        <form onSubmit={handleAddItem} style={styles.formGrid}>
          <input
            type="text"
            placeholder="שם הפריט (למשל: דבק חם)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={styles.input}
            required
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            style={styles.input}
          >
            {categories.filter(c => c !== 'הכל').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="כמות התחלתית"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            style={styles.input}
            min="0"
            required
          />
          <input
            type="number"
            placeholder="מינימום להתראה"
            value={newMinStock}
            onChange={(e) => setNewMinStock(e.target.value)}
            style={styles.input}
            min="0"
          />
          <button type="submit" style={styles.primaryButton}>הוסף למלאי</button>
        </form>
      </section>

      {/* סרגל חיפוש וסינון */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 חיפוש פריט..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...styles.input, flex: 2, margin: 0 }}
        />
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 3 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryChip,
                backgroundColor: selectedCategory === cat ? '#007bff' : '#f1f3f5',
                color: selectedCategory === cat ? '#fff' : '#495057',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* טבלת המלאי */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📋 רשימת פריטים במלאי ({filteredItems.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>שם הפריט</th>
                <th style={styles.th}>קטגוריה</th>
                <th style={styles.th}>כמות</th>
                <th style={styles.th}>סטטוס</th>
                <th style={styles.th}>פעולות מהירות</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyRow}>לא נמצאו פריטים תואמים.</td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLowStock = item.quantity <= item.minStock;
                  return (
                    <tr key={item.id} style={styles.tableRow}>
                      <td style={styles.td}><strong>{item.name}</strong></td>
                      <td style={styles.td}>
                        <span style={styles.badge}>{item.category}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.quantityText, color: isLowStock ? '#d9534f' : '#2b2d42' }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {isLowStock ? (
                          <span style={styles.alertBadge}>⚠️ מלאי נמוך</span>
                        ) : (
                          <span style={styles.successBadge}>✓ תקין</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 1)} 
                            style={styles.actionButton}
                            title="הוסף יחידה"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, -1)} 
                            style={styles.actionButton}
                            title="הורד יחידה"
                          >
                            -
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)} 
                            style={styles.deleteButton}
                            title="מחק פריט"
                          >
                            מחק
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// עיצובים פנימיים (Inline Styles) נקיים ומודרניים למראה מושקע מיידית
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    color: '#333',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.2rem',
    color: '#212529',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    color: '#343a40',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    alignItems: 'center',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  primaryButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  categoryChip: {
    border: 'none',
    borderRadius: '20px',
    padding: '8px 14px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'right',
  },
  tableHeaderRow: {
    borderBottom: '2px solid #dee2e6',
    backgroundColor: '#f1f3f5',
  },
  th: {
    padding: '12px',
    color: '#495057',
    fontSize: '0.9rem',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e9ecef',
    fontSize: '0.95rem',
  },
  tableRow: {
    transition: 'background 0.1s',
  },
  emptyRow: {
    textAlign: 'center',
    padding: '24px',
    color: '#6c757d',
  },
  badge: {
    backgroundColor: '#e7f5ff',
    color: '#1c7ed6',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  successBadge: {
    color: '#2b8a3e',
    backgroundColor: '#ebfbee',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  alertBadge: {
    color: '#c92a2a',
    backgroundColor: '#fff5f5',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  quantityText: {
    fontWeight: 'bold',
    fontSize: '1.05rem',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    color: '#c92a2a',
    border: '1px solid #ffc9c9',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};

export default App;
