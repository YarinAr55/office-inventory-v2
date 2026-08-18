import React, { useState, useEffect } from 'react';

function App() {
  const [inventory, setInventory] = useState(() => {
    // טעינה בטוחה של הנתונים הקיימים כדי לוודא ששום דבר לא נמחק
    const saved = localStorage.getItem('office_inventory_v1');
    if (!saved) {
      const oldKeys = ['office_inventory_pro_v3', 'office_inventory_pro_v4', 'office_inventory_pro_v5'];
      for(let key of oldKeys) {
        const oldData = localStorage.getItem(key);
        if (oldData) return JSON.parse(oldData);
      }
      return [];
    }
    try { return JSON.parse(saved); } catch (e) { return []; }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('ציוד משרדי');
  const [newQuantity, setNewQuantity] = useState('');
  const [newMinStock, setNewMinStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // מצב לניהול עריכת שם פריט קיים
  const [editingId, setEditingId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  useEffect(() => {
    localStorage.setItem('office_inventory_v1', JSON.stringify(inventory));
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
    setInventory(prev => [newItem, ...prev]);
    setNewName('');
    setNewQuantity('');
    setNewMinStock('');
    setNewPrice('');
  };

  const handleDeleteItem = (id) => setInventory(prev => prev.filter(item => item.id !== id));

  const handleUpdateField = (id, field, value) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value === '' ? 0 : parseFloat(value) || 0 };
      }
      return item;
    }));
  };

  const handleSaveEditName = (id) => {
    if (!editingNameValue.trim()) return;
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, name: editingNameValue.trim() };
      }
      return item;
    }));
    setEditingId(null);
    setEditingNameValue('');
  };

  const handleConsumeChange = (id, newConsumedVal) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const currentConsumed = item.todayConsumed || 0;
        const targetConsumed = Math.max(0, parseInt(newConsumedVal, 10) || 0);
        const diff = targetConsumed - currentConsumed;
        const updatedQuantity = Math.max(0, item.quantity - diff);

        return {
          ...item,
          todayConsumed: targetConsumed,
          quantity: updatedQuantity
        };
      }
      return item;
    }));
  };

  const exportToExcel = () => {
    if (inventory.length === 0) return alert('אין פריטים לייצוא');
    const headers = ["שם פריט", "קטגוריה", "כמות במלאי", "מינימום להתראה", "מחיר אחרון (₪)", "נמשך היום"];
    const csvContent = [headers.join(","), ...inventory.map(i => [`"${i.name}"`, `"${i.category}"`, i.quantity, i.minStock, i.lastPrice, i.todayConsumed].join(","))].join("\n");
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
          background: radial-gradient(circle at top, #1e1b4b 0%, #0f172a 60%) !important;
          color: #f8fafc !important;
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
          min-height: 100vh;
        }
        * { box-sizing: border-box; }
        input:focus, select:focus {
          border-color: #818cf8 !important;
          outline: none;
          box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.2) !important;
        }
      `}</style>

      <header style={inlineStyles.header}>
        <div style={inlineStyles.headerContent}>
          <div>
            <h1 style={inlineStyles.title}>📦 מערכת ניהול מלאי חכמה</h1>
            <p style={inlineStyles.subtitle}>הנתונים שלך נשמרים באופן אוטומטי ובטוח במכשיר</p>
          </div>
          <button onClick={exportToExcel} style={inlineStyles.exportBtn}>
            📥 ייצוא דוח לאקסל
          </button>
        </div>
      </header>

      <div style={inlineStyles.container}>
        <div style={inlineStyles.statsGrid}>
          <div style={inlineStyles.statCard}>
            <div style={inlineStyles.statIconBg}>📦</div>
            <div>
              <span style={inlineStyles.statLabel}>סה"כ יחידות במלאי</span>
              <div style={inlineStyles.statValue}>{totalItemsCount}</div>
            </div>
          </div>
          <div style={inlineStyles.statCard}>
            <div style={{ ...inlineStyles.statIconBg, background: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' }}>
              {lowStockCount > 0 ? '⚠️' : '✅'}
            </div>
            <div>
              <span style={inlineStyles.statLabel}>פריטים במלאי נמוך</span>
              <div style={{ ...inlineStyles.statValue, color: lowStockCount > 0 ? '#f87171' : '#34d399' }}>{lowStockCount}</div>
            </div>
          </div>
          <div style={inlineStyles.statCard}>
            <div style={inlineStyles.statIconBg}>💰</div>
            <div>
              <span style={inlineStyles.statLabel}>שווי מלאי מוערך</span>
              <div style={inlineStyles.statValue}>₪{totalValue.toLocaleString()}</div>
            </div>
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
          <input type="text" placeholder="🔍 חיפוש מהיר לפי שם פריט..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={inlineStyles.searchBox} />
          <div style={inlineStyles.chipsContainer}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ ...inlineStyles.chip, ...(selectedCategory === cat ? inlineStyles.activeChip : inlineStyles.inactiveChip) }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section>
          <h2 style={inlineStyles.sectionTitle}>📋 פריטים פעילים במלאי ({filteredItems.length})</h2>
          
          {filteredItems.length === 0 ? (
            <div style={{ ...inlineStyles.card, textAlign: 'center', padding: '40px', color: '#64748b' }}>
              ✨ המערכת ריקה כרגע. השתמש בטופס למעלה כדי להוסיף פריטים ראשונים!
            </div>
          ) : (
            <div style={inlineStyles.gridContainer}>
              {filteredItems.map(item => {
                const isLow = item.quantity <= item.minStock;
                const isEditing = editingId === item.id;

                return (
                  <div key={item.id} style={inlineStyles.itemCard}>
                    <div style={inlineStyles.cardHeader}>
                      <div style={{ flex: 1, marginLeft: '10px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={editingNameValue} 
                              onChange={(e) => setEditingNameValue(e.target.value)} 
                              style={{ ...inlineStyles.input, padding: '4px 8px', fontSize: '0.9rem' }} 
                            />
                            <button onClick={() => handleSaveEditName(item.id)} style={inlineStyles.saveEditBtn}>שמור</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{item.name}</strong>
                            <button onClick={() => { setEditingId(item.id); setEditingNameValue(item.name); }} style={inlineStyles.editBtn}>✏️ ערוך</button>
                          </div>
                        )}
                        <span style={{ ...inlineStyles.badge, marginTop: '4px', display: 'inline-block' }}>{item.category}</span>
                      </div>
                      {isLow ? (
                        <span style={inlineStyles.alertBadge}>⚠️ נמוך ({item.quantity})</span>
                      ) : (
                        <span style={inlineStyles.okBadge}>✓ תקין ({item.quantity})</span>
                      )}
                    </div>

                    <div style={inlineStyles.cardBody}>
                      <div style={inlineStyles.cardRow}>
                        <span style={inlineStyles.cardLabel}>כמות נוכחית במלאי:</span>
                        <span style={{ fontWeight: '800', fontSize: '1.2rem', color: isLow ? '#f87171' : '#34d399' }}>
                          {item.quantity}
                        </span>
                      </div>

                      <div style={inlineStyles.cardRow}>
                        <span style={inlineStyles.cardLabel}>נמשך היום:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => handleConsumeChange(item.id, (item.todayConsumed || 0) - 1)} style={inlineStyles.qtyBtn}>-</button>
                          <input 
                            type="number" 
                            value={item.todayConsumed || 0} 
                            onChange={(e) => handleConsumeChange(item.id, e.target.value)} 
                            style={inlineStyles.tableInput} 
                            min="0" 
                          />
                          <button onClick={() => handleConsumeChange(item.id, (item.todayConsumed || 0) + 1)} style={inlineStyles.qtyBtn}>+</button>
                        </div>
                      </div>

                      <div style={inlineStyles.cardRow}>
                        <span style={inlineStyles.cardLabel}>מחיר אחרון:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={item.lastPrice} 
                            onChange={(e) => handleUpdateField(item.id, 'lastPrice', e.target.value)} 
                            style={inlineStyles.tableInput} 
                            min="0" 
                          />
                          <span style={{ color: '#94a3b8' }}>₪</span>
                        </div>
                      </div>
                    </div>

                    <div style={inlineStyles.cardFooter}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>סף מינימום: {item.minStock}</span>
                      <button onClick={() => handleDeleteItem(item.id)} style={inlineStyles.deleteBtn}>מחק פריט</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const inlineStyles = {
  pageWrapper: { minHeight: '100vh', paddingBottom: '50px' },
  header: { 
    background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(49, 46, 129, 0.9) 100%)', 
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '24px 40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '1.7rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '-0.5px' },
  subtitle: { color: '#c7d2fe', fontSize: '0.9rem', margin: 0 },
  container: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' },
  statCard: { 
    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)', 
    backdropFilter: 'blur(8px)',
    borderRadius: '16px', 
    padding: '22px', 
    border: '1px solid rgba(51, 65, 85, 0.6)', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
  },
  statIconBg: { width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' },
  statLabel: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '4px' },
  statValue: { fontSize: '1.7rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' },
  card: { 
    background: 'rgba(30, 41, 59, 0.75)', 
    backdropFilter: 'blur(10px)',
    borderRadius: '18px', 
    padding: '28px', 
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)', 
    marginBottom: '24px', 
    border: '1px solid rgba(51, 65, 85, 0.7)' 
  },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '700', margin: '0 0 20px 0', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) 130px', gap: '16px', alignItems: 'end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' },
  input: { padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.8)', fontSize: '0.95rem', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', width: '100%' },
  searchBox: { flex: 2, padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.8)', fontSize: '0.95rem', background: 'rgba(30, 41, 59, 0.8)', color: '#fff' },
  
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  itemCard: {
    background: 'rgba(30, 41, 59, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(51, 65, 85, 0.8)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', paddingBottom: '12px' },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '10px' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(51, 65, 85, 0.6)', paddingTop: '10px' },
  
  tableInput: { padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(71, 85, 105, 0.8)', fontSize: '0.9rem', width: '60px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', textAlign: 'center' },
  qtyBtn: { background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '6px', width: '26px', height: '26px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  editBtn: { background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '0.75rem', cursor: 'pointer', padding: '2px 4px' },
  saveEditBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' },

  primaryBtn: { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 20px', fontWeight: '600', cursor: 'pointer', width: '100%', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' },
  exportBtn: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' },
  filterBar: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' },
  chipsContainer: { display: 'flex', gap: '8px', overflowX: 'auto', flex: '3', paddingBottom: '4px' },
  chip: { border: 'none', padding: '9px 18px', borderRadius: '25px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' },
  activeChip: { background: '#6366f1', color: '#fff', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' },
  inactiveChip: { background: 'rgba(30, 41, 59, 0.8)', color: '#94a3b8', border: '1px solid rgba(51, 65, 85, 0.8)' },
  
  badge: { background: 'rgba(49, 46, 129, 0.6)', color: '#c7d2fe', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(99, 102, 241, 0.3)' },
  okBadge: { background: 'rgba(6, 78, 59, 0.6)', color: '#34d399', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(52, 211, 153, 0.3)' },
  alertBadge: { background: 'rgba(127, 29, 29, 0.6)', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(248, 113, 113, 0.3)' },
  deleteBtn: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }
};

export default App;
