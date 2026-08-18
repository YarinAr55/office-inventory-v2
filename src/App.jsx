import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('office_inventory_v8');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'עטים כחולים (קופסה)', category: 'ציוד משרדי', quantity: 45, minStock: 10, lastPrice: 25.0, todayConsumed: 3 },
      { id: 2, name: 'דפים A4 (חבילת 500)', category: 'נייר ודפוס', quantity: 8, minStock: 15, lastPrice: 22.0, todayConsumed: 2 },
      { id: 3, name: 'קלסרים רחבים מפלסטיק', category: 'ארכיון', quantity: 12, minStock: 5, lastPrice: 6.5, todayConsumed: 0 },
      { id: 4, name: 'דבק שקוף סלוטייפ', category: 'ציוד משרדי', quantity: 3, minStock: 8, lastPrice: 4.0, todayConsumed: 1 },
      { id: 5, name: 'נוזל לניקוי מסכים', category: 'אחזקה וניקיון', quantity: 19, minStock: 5, lastPrice: 15.0, todayConsumed: 0 },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('ציוד משרדי');
  const [newQuantity, setNewQuantity] = useState('');
  const [newMinStock, setNewMinStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    localStorage.setItem('office_inventory_v8', JSON.stringify(inventory));
  }, [inventory]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName.trim() || newQuantity === '') return;
    const newItem = {
      id: Date.now(),
      name: newName.trim(),
      category: newCategory,
      quantity: parseInt(newQuantity, 10) || 0,
      minStock: parseInt(newMinStock, 10) || 5,
      lastPrice: parseFloat(newPrice) || 0,
      todayConsumed: 0,
    };
    setInventory([newItem, ...inventory]);
    setNewName('');
    setNewQuantity('');
    setNewMinStock('');
    setNewPrice('');
  };

  const handleDeleteItem = (id) => setInventory(inventory.filter(item => item.id !== id));

  const handleUpdate = (id, field, value) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const numVal = Math.max(0, parseFloat(value) || 0);
        return { ...item, [field]: numVal };
      }
      return item;
    }));
  };

  const exportToExcel = () => {
    const headers = ["שם פריט", "קטגוריה", "כמות במלאי", "מינימום להתראה", "מחיר אחרון (₪)", "נמשך היום"];
    const csvContent = [
      headers.join(","),
      ...inventory.map(i => [`"${i.name}"`, `"${i.category}"`, i.quantity, i.minStock, i.lastPrice, i.todayConsumed].join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "office_inventory.csv";
    link.click();
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'הכל' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItemsCount = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockCount = inventory.filter(item => item.quantity <= item.minStock).length;
  const totalValue = inventory.reduce((acc, item) => acc + (item.quantity * item.lastPrice), 0);

  const categories = ['הכל', 'ציוד משרדי', 'נייר ודפוס', 'ארכיון', 'אחזקה וניקיון', 'אחר'];

  return (
    <div className="dashboard-wrapper">
      <header className="main-header">
        <div>
          <h1>📦 מערכת ניהול מלאי מתקדמת</h1>
          <p>שליטה חכמה בכמויות, מעקב צריכה וניהול מחירים</p>
        </div>
        <button onClick={exportToExcel} className="btn-export">
          📥 ייצוא דוח לאקסל
        </button>
      </header>

      <div className="content-container">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">סה"כ יחידות במלאי</span>
            <span className="stat-value">{totalItemsCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">פריטים במלאי נמוך</span>
            <span className="stat-value" style={{ color: lowStockCount > 0 ? '#f87171' : '#34d399' }}>{lowStockCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">שווי מלאי מוערך</span>
            <span className="stat-value">₪{totalValue.toLocaleString()}</span>
          </div>
        </div>

        <section className="card-box">
          <h2 className="card-title">➕ הוספת פריט חדש למערכת</h2>
          <form onSubmit={handleAddItem} className="form-grid">
            <div className="input-group">
              <label className="input-label">שם הפריט</label>
              <input type="text" placeholder="למשל: דבק חם" value={newName} onChange={e => setNewName(e.target.value)} className="custom-input" required />
            </div>
            <div className="input-group">
              <label className="input-label">קטגוריה</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="custom-input">
                {categories.filter(c => c !== 'הכל').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">כמות התחלתית</label>
              <input type="number" placeholder="0" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} className="custom-input" min="0" required />
            </div>
            <div className="input-group">
              <label className="input-label">סף מינימום</label>
              <input type="number" placeholder="5" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} className="custom-input" min="0" />
            </div>
            <div className="input-group">
              <label className="input-label">מחיר אחרון (₪)</label>
              <input type="number" step="0.01" placeholder="0.00" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="custom-input" min="0" />
            </div>
            <div>
              <button type="submit" className="btn-primary">הוסף למלאי</button>
            </div>
          </form>
        </section>

        <div className="filter-bar">
          <input type="text" placeholder="🔍 חיפוש פריט מהיר..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="custom-input" style={{ flex: 2 }} />
          <div className="chips-container">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`chip-btn ${selectedCategory === cat ? 'active' : 'inactive'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section className="card-box">
          <h2 className="card-title">📋 פריטים פעילים במלאי ({filteredItems.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>שם הפריט</th>
                  <th>קטגוריה</th>
                  <th>כמות נוכחית</th>
                  <th>נמשך היום</th>
                  <th>מחיר אחרון</th>
                  <th>סטטוס מלאי</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr><td colSpan="7" className="empty-row">לא נמצאו פריטים תואמים לחיפוש.</td></tr>
                ) : (
                  filteredItems.map(item => {
                    const isLow = item.quantity <= item.minStock;
                    return (
                      <tr key={item.id}>
                        <td><strong style={{ color: '#fff' }}>{item.name}</strong></td>
                        <td><span className="badge-cat">{item.category}</span></td>
                        <td>
                          <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: isLow ? '#f87171' : '#34d399' }}>
                            {item.quantity}
                          </span>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={item.todayConsumed} 
                            onChange={(e) => handleUpdate(item.id, 'todayConsumed', e.target.value)} 
                            className="table-input" 
                            min="0" 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={item.lastPrice} 
                            onChange={(e) => handleUpdate(item.id, 'lastPrice', e.target.value)} 
                            className="table-input" 
                            min="0" 
                          /> ₪
                        </td>
                        <td>
                          {isLow ? (
                            <span className="badge-alert">⚠️ נמוך (מינימום: {item.minStock})</span>
                          ) : (
                            <span className="badge-ok">✓ תקין</span>
                          )}
                        </td>
                        <td>
                          <button onClick={() => handleDeleteItem(item.id)} className="btn-delete">מחק</button>
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
    </div>
  );
}

export default App;
