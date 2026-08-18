import React, { useState, useEffect } from 'react';

function App() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('office_inventory_v6');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'עטים כחולים', category: 'ציוד משרדי', quantity: 45, minStock: 10, lastPrice: 2.5, todayConsumed: 3 },
      { id: 2, name: 'דפים A4 (חבילה)', category: 'נייר ודפוס', quantity: 8, minStock: 15, lastPrice: 22.0, todayConsumed: 2 },
      { id: 3, name: 'קלסרים רחבים', category: 'ארכיון', quantity: 12, minStock: 5, lastPrice: 6.0, todayConsumed: 0 },
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
    localStorage.setItem('office_inventory_v6', JSON.stringify(inventory));
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

  const categories = ['הכל', 'ציוד משרדי', 'נייר ודפוס', 'ארכיון', 'אחזקה וניקיון', 'אחר'];

  return (
    <div style={styles.pageWrapper} dir="rtl">
      <style>{`
        body { margin: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc; }
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #6366f1 !important; outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25); }
      `}</style>

      {/* כותרת עליונה בסגנון מודרני */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 מערכת ניהול מלאי מתקדמת</h1>
          <p style={styles.subtitle}>שליטה חכמה בכמויות, מעקב צריכה וניהול מחירים</p>
        </div>
        <button onClick={exportToExcel} style={styles.exportBtn}>
          📥 ייצוא דוח לאקסל
        </button>
      </header>

      <div style={styles.container}>
        {/* טופס הוספה מעוצב */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>➕ הוספת פריט חדש למערכת</h2>
          <form onSubmit={handleAddItem} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>שם הפריט</label>
              <input type="text" placeholder="למשל: דイン A4" value={newName} onChange={e => setNewName(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>קטגוריה</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={styles.input}>
                {categories.filter(c => c !== 'הכל').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>כמות התחלתית</label>
              <input type="number" placeholder="0" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} style={styles.input} min="0" required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>סף מינימום</label>
              <input type="number" placeholder="5" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} style={styles.input} min="0" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>מחיר אחרון (₪)</label>
              <input type="number" step="0.01" placeholder="0.00" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={styles.input} min="0" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={styles.primaryBtn}>הוסף למלאי</button>
            </div>
          </form>
        </section>

        {/* סרגל חיפוש וסינון קטגוריות */}
        <div style={styles.filterBar}>
          <input type="text" placeholder="🔍 חיפוש פריט מהיר..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...styles.input, flex: 2, backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155' }} />
          <div style={styles.chipsContainer}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ ...styles.chip, ...(selectedCategory === cat ? styles.activeChip : styles.inactiveChip) }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* טבלה מעוצבת בסגנון כרטיס */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>📋 פריטים פעילים במלאי ({filteredItems.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>שם הפריט</th>
                  <th style={styles.th}>קטגוריה</th>
                  <th style={styles.th}>כמות נוכחית</th>
                  <th style={styles.th}>נמשך היום</th>
                  <th style={styles.th}>מחיר אחרון</th>
                  <th style={styles.th}>סטטוס מלאי</th>
                  <th style={styles.th}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr><td colSpan="7" style={styles.empty}>לא נמצאו פריטים תואמים לחיפוש.</td></tr>
                ) : (
                  filteredItems.map(item => {
                    const isLow = item.quantity <= item.minStock;
                    return (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}><strong style={{ color: '#fff' }}>{item.name}</strong></td>
                        <td style={styles.td}><span style={styles.badge}>{item.category}</span></td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: isLow ? '#f87171' : '#34d399' }}>
                            {item.quantity}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <input 
                            type="number" 
                            value={item.todayConsumed} 
                            onChange={(e) => handleUpdate(item.id, 'todayConsumed', e.target.value)} 
                            style={styles.tableInput} 
                            min="0" 
                          />
                        </td>
                        <td style={styles.td}>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={item.lastPrice} 
                            onChange={(e) => handleUpdate(item.id, 'lastPrice', e.target.value)} 
                            style={styles.tableInput} 
                            min="0" 
                          /> ₪
                        </td>
                        <td style={styles.td}>
                          {isLow ? (
                            <span style={styles.alertBadge}>⚠️ נמוך (נדרש מינימום: {item.minStock})</span>
                          ) : (
                            <span style={styles.okBadge}>✓ תקין</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleDeleteItem(item.id)} style={styles.deleteBtn}>מחק</button>
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

const styles = {
  pageWrapper: { minHeight: '100vh', paddingBottom: '40px' },
  header: { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', borderBottom: '1px solid #3730a3' },
  title: { fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' },
  subtitle: { color: '#c7d2fe', fontSize: '0.95rem', margin: 0 },
  container: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
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
  tr: { borderBottom: '1px solid #334155', transition: 'background 0.1s' },
  td: { padding: '16px', fontSize: '0.95rem', verticalAlign: 'middle', color: '#cbd5e1' },
  badge: { background: '#312e81', color: '#c7d2fe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  okBadge: { background: '#064e3b', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  alertBadge: { background: '#7f1d1d', color: '#fca5a5', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  deleteBtn: { background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '40px', color: '#64748b' }
};

export default App;
