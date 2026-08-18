import React, { useState, useEffect } from 'react';

function App() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('office_inventory_empty_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('ציוד משרדי');
  const [newQuantity, setNewQuantity] = useState('');
  const [newMinStock, setNewMinStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    localStorage.setItem('office_inventory_empty_v1', JSON.stringify(inventory));
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
    if (inventory.length === 0) {
      alert('אין פריטים לייצוא');
      return;
    }
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
    <div style={inlineStyles.pageWrapper} dir="rtl">
      <style>{`
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #0f172a !important;
          color: #f8fafc !important;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        }
        * { box-sizing: border-box; }
        input:focus, select:focus {
          border-color: #6366f1 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
      `}</style>

      <header style={inlineStyles.header}>
        <div>
          <h1 style={inlineStyles.title}>📦 מערכת ניהול מלאי מתקדמת</h1>
          <p style={inlineStyles.subtitle}>שליטה חכמה בכמויות, מעקב צריכה וניהול מחירים</p>
        </div>
        <button onClick={exportToExcel} style={inlineStyles.exportBtn}>
          📥 ייצוא דוח לאקסל
        </button>
      </header>

      <div style={inlineStyles.container}>
        <div style={inlineStyles.statsGrid}>
          <div style={inlineStyles.statCard}>
            <span style={inlineStyles.statLabel}>סה"כ יחידות במלאי</span>
            <span style={inlineStyles.statValue}>{totalItemsCount}</span>
          </div>
          <div style={inlineStyles.statCard}>
            <span style={inlineStyles.statLabel}>פריטים במלאי נמוך</span>
            <span style={{ ...inlineStyles.statValue, color: lowStockCount > 0 ? '#f87171' : '#34d399' }}>{lowStockCount}</span>
          </div>
          <div style={inlineStyles.statCard}>
            <span style={inlineStyles.statLabel}>שווי מלאי מוערך</span>
            <span style={inlineStyles.statValue}>₪{totalValue.toLocaleString()}</span>
          </div>
        </div>

        <section style={inlineStyles.card}>
          <h2 style={inlineStyles.sectionTitle}>➕ הוספת פריט חדש למערכת</h2>
          <form onSubmit={handleAddItem} style={inlineStyles.form}>
            <div style={inlineStyles.inputGroup}>
              <label style={inlineStyles.label}>שם הפריט</label>
              <input type="text" placeholder="למשל: עטים כחולים" value={newName} onChange={e => setNewName(e.target.value)} style={inlineStyles.input} required />
            </div>
            <div style={inlineStyles.inputGroup}>
              <label style={inlineStyles.label}>קטגוריה</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={inlineStyles.input}>
                {categories.filter(c => c !== 'הכל').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={inlineStyles.inputGroup}>
              <label style={inlineStyles.label}>כמות התחלתית</label>
              <input type="number" placeholder="0" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} style={inlineStyles.input} min="0" required />
            </div>
            <div style={inlineStyles.inputGroup}>
              <label style={inlineStyles.label}>סף מינימום</label>
              <input type="number" placeholder="5" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} style={inlineStyles.input} min="0" />
            </div>
            <div style={inlineStyles.inputGroup}>
              <label style={inlineStyles.label}>מחיר אחרון (₪)</label>
              <input type="number" step="0.01" placeholder="0.00" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={inlineStyles.input} min="0" />
            </div>
            <div>
              <button type="submit" style={inlineStyles.primaryBtn}>הוסף למלאי</button>
            </div>
          </form>
        </section>

        <div style={inlineStyles.filterBar}>
          <input type="text" placeholder="🔍 חיפוש פריט מהיר..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inlineStyles.input, flex: 2, backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155' }} />
          <div style={inlineStyles.chipsContainer}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ ...inlineStyles.chip, ...(selectedCategory === cat ? inlineStyles.activeChip : inlineStyles.inactiveChip) }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section style={inlineStyles.card}>
          <h2 style={inlineStyles.sectionTitle}>📋 פריטים פעילים במלאי ({filteredItems.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={inlineStyles.table}>
              <thead>
                <tr style={inlineStyles.thRow}>
                  <th style={inlineStyles.th}>שם הפריט</th>
                  <th style={inlineStyles.th}>קטגוריה</th>
                  <th style={inlineStyles.th}>כמות נוכחית</th>
                  <th style={inlineStyles.th}>נמשך היום</th>
                  <th style={inlineStyles.th}>מחיר אחרון</th>
                  <th style={inlineStyles.th}>סטטוס מלאי</th>
                  <th style={inlineStyles.th}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={inlineStyles.empty}>
                      המערכת ריקה כרגע. השתמש בטופס למעלה כדי להוסיף את הפריט הראשון שלך!
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const isLow = item.quantity <= item.minStock;
                    return (
                      <tr key={item.id} style={inlineStyles.tr}>
                        <td style={inlineStyles.td}><strong style={{ color: '#fff' }}>{item.name}</strong></td>
                        <td style={inlineStyles.td}><span style={inlineStyles.badge}>{item.category}</span></td>
                        <td style={inlineStyles.td}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: isLow ? '#f87171' : '#34d399' }}>
                            {item.quantity}
                          </span>
                        </td>
                        <td style={inlineStyles.td}>
                          <input 
                            type="number" 
                            value={item.todayConsumed} 
                            onChange={(e) => handleUpdate(item.id, 'todayConsumed', e.target.value)} 
                            style={inlineStyles.tableInput} 
                            min="0" 
                          />
                        </td>
                        <td style={inlineStyles.td}>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={item.lastPrice} 
                            onChange={(e) => handleUpdate(item.id, 'lastPrice', e.target.value)} 
                            style={inlineStyles.tableInput} 
                            min="0" 
                          /> ₪
                        </td>
                        <td style={inlineStyles.td}>
                          {isLow ? (
                            <span style={inlineStyles.alertBadge}>⚠️ נמוך (מינימום: {item.minStock})</span>
                          ) : (
                            <span style={inlineStyles.okBadge}>✓ תקין</span>
                          )}
                        </td>
                        <td style={inlineStyles.td}>
                          <button onClick={() => handleDeleteItem(item.id)} style={inlineStyles.deleteBtn}>מחק</button>
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

const inlineStyles = {
  pageWrapper: { minHeight: '100vh', paddingBottom: '40px' },
  header: { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', borderBottom: '1px solid #3730a3' },
  title: { fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' },
  subtitle: { color: '#c7d2fe', fontSize: '0.95rem', margin: 0 },
  container: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' },
  statCard: { background: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  statLabel: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' },
  statValue: { fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc' },
  card: { background: '#1e293b', borderRadius: '14px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', marginBottom: '24px', border: '1px solid #334155' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '700', margin: '0 0 16px 0', color: '#f1f5f9' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) 120px', gap: '14px', alignItems: 'end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', fontSize: '0.95rem', background: '#0f172a', color: '#fff', width: '100%' },
  tableInput: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #475569', fontSize: '0.9rem', width: '75px', background: '#0f172a', color: '#fff', textAlign: 'center' },
  primaryBtn: { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 20px', fontWeight: '600', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' },
  exportBtn: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' },
  filterBar: { display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' },
  chipsContainer: { display: 'flex', gap: '8px', overflowX: 'auto', flex: '3', paddingBottom: '4px' },
  chip: { border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600', transition: 'all 0.2s' },
  activeChip: { background: '#6366f1', color: '#fff', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)' },
  inactiveChip: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  thRow: { background: '#0f172a', borderBottom: '2px solid #334155' },
  th: { padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '16px', fontSize: '0.95rem', verticalAlign: 'middle', color: '#cbd5e1' },
  badge: { background: '#312e81', color: '#c7d2fe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  okBadge: { background: '#064e3b', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  alertBadge: { background: '#7f1d1d', color: '#fca5a5', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  deleteBtn: { background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '40px', color: '#64748b' }
};

export default App;
