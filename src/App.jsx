import React, { useState, useEffect } from 'react';

function App() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('office_inventory_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'עטים כחולים', category: 'ציוד משרדי', quantity: 45, minStock: 10 },
      { id: 2, name: 'דפים A4 (חבילה)', category: 'נייר ודפוס', quantity: 8, minStock: 15 },
      { id: 3, name: 'קלסרים רחבים', category: 'ארכיון', quantity: 12, minStock: 5 },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('ציוד משרדי');
  const [newQuantity, setNewQuantity] = useState('');
  const [newMinStock, setNewMinStock] = useState('');

  useEffect(() => {
    localStorage.setItem('office_inventory_v3', JSON.stringify(inventory));
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
    };
    setInventory([newItem, ...inventory]);
    setNewName('');
    setNewQuantity('');
    setNewMinStock('');
  };

  const handleDeleteItem = (id) => setInventory(inventory.filter(item => item.id !== id));
  
  const handleUpdateQuantity = (id, delta) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item));
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'הכל' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['הכל', 'ציוד משרדי', 'נייר ודפוס', 'ארכיון', 'אחזקה וניקיון', 'אחר'];

  return (
    <div style={styles.container} dir="rtl">
      {/* סגנונות גלובליים ועיצוב מובנה */}
      <style>{`
        body { margin: 0; background-color: #f4f6f8; font-family: system-ui, -apple-system, sans-serif; color: #1f2937; }
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #4f46e5 !important; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
      `}</style>

      <header style={styles.header}>
        <h1 style={styles.title}>📦 ניהול מלאי משרדי</h1>
        <p style={styles.subtitle}>מערכת חלקה, מהירה וקומפקטית לשליטה בציוד</p>
      </header>

      {/* טופס הוספה קומפקטי בשורה אחת */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>➕ הוספת פריט חדש</h2>
        <form onSubmit={handleAddItem} style={styles.form}>
          <input type="text" placeholder="שם הפריט..." value={newName} onChange={e => setNewName(e.target.value)} style={styles.input} required />
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={styles.input}>
            {categories.filter(c => c !== 'הכל').map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="number" placeholder="כמות" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} style={styles.input} min="0" required />
          <input type="number" placeholder="מינימום" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} style={styles.input} min="0" />
          <button type="submit" style={styles.primaryBtn}>הוסף</button>
        </form>
      </section>

      {/* סרגל חיפוש וקטגוריות */}
      <div style={styles.filterBar}>
        <input type="text" placeholder="🔍 חיפוש פריט..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...styles.input, flex: 2 }} />
        <div style={styles.chipsContainer}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ ...styles.chip, ...(selectedCategory === cat ? styles.activeChip : {}) }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* טבלה מרווחת ומצומצמת שורות */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📋 פריטים במלאי ({filteredItems.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>שם הפריט</th>
                <th style={styles.th}>קטגוריה</th>
                <th style={styles.th}>כמות</th>
                <th style={styles.th}>סטטוס</th>
                <th style={styles.th}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan="5" style={styles.empty}>לא נמצאו פריטים תואמים.</td></tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.quantity <= item.minStock;
                  return (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}><strong>{item.name}</strong></td>
                      <td style={styles.td}><span style={styles.badge}>{item.category}</span></td>
                      <td style={{ ...styles.td, fontWeight: 'bold', color: isLow ? '#ef4444' : 'inherit' }}>{item.quantity}</td>
                      <td style={styles.td}>
                        {isLow ? <span style={styles.alertBadge}>⚠️ מלאי נמוך</span> : <span style={styles.okBadge}>✓ תקין</span>}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button onClick={() => handleUpdateQuantity(item.id, 1)} style={styles.actionBtn}>+</button>
                          <button onClick={() => handleUpdateQuantity(item.id, -1)} style={styles.actionBtn}>-</button>
                          <button onClick={() => handleDeleteItem(item.id)} style={styles.deleteBtn}>מחק</button>
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

const styles = {
  container: { maxWidth: '1000px', margin: '30px auto', padding: '0 16px' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '2rem', fontWeight: '800', margin: '0 0 6px 0', color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.95rem', margin: 0 },
  card: { background: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #e5e7eb' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', margin: '0 0 14px 0', color: '#374151' },
  form: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', gap: '10px' },
  input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem', background: '#fff', width: '100%' },
  primaryBtn: { background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  chipsContainer: { display: 'flex', gap: '6px', overflowX: 'auto', flex: '3', paddingBottom: '4px' },
  chip: { border: '1px solid #d1d5db', background: '#fff', padding: '6px 12px', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', color: '#4b5563' },
  activeChip: { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  thRow: { background: '#f9fafb', borderBottom: '2px solid #e5e7eb' },
  th: { padding: '10px 12px', color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '10px 12px', fontSize: '0.9rem' },
  badge: { background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' },
  okBadge: { background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  alertBadge: { background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  actions: { display: 'flex', gap: '4px', alignItems: 'center' },
  actionBtn: { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' },
  deleteBtn: { background: '#fff5f5', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '30px', color: '#9ca3af' }
};

export default App;
