import React, { useState, useEffect } from 'react';

export default function App() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventory_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'חלב 3%', category: 'מוצרי חלב', quantity: 12, minThreshold: 5, dailyUsage: 3 },
      { id: 2, name: 'לחם פרוס', category: 'מאפים', quantity: 3, minThreshold: 4, dailyUsage: 2 },
      { id: 3, name: 'ביצים (ארגז)', category: 'בסיסי', quantity: 15, minThreshold: 6, dailyUsage: 1 },
      { id: 4, name: 'קפה שחור', category: 'משאות', quantity: 8, minThreshold: 3, dailyUsage: 1 },
    ];
  });

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const [form, setForm] = useState({ name: '', category: 'כללי', quantity: '', minThreshold: '', dailyUsage: '' });

  useEffect(() => {
    localStorage.setItem('inventory_data', JSON.stringify(inventory));
  }, [inventory]);

  const categories = ['הכל', 'מוצרי חלב', 'מאפים', 'בסיסי', 'משאות', 'כללי'];

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!form.name || form.quantity === '' || form.minThreshold === '') return;

    const newItem = {
      id: Date.now(),
      name: form.name.trim(),
      category: form.category,
      quantity: parseInt(form.quantity, 10) || 0,
      minThreshold: parseInt(form.minThreshold, 10) || 0,
      dailyUsage: parseInt(form.dailyUsage, 10) || 0,
    };

    setInventory([...inventory, newItem]);
    setForm({ name: '', category: 'כללי', quantity: '', minThreshold: '', dailyUsage: '' });
  };

  const updateQuantity = (id, delta) => {
    setInventory(
      inventory.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const deleteItem = (id) => {
    setInventory(inventory.filter((item) => item.id !== id));
    setDeleteConfirmId(null);
  };

  const exportToExcel = () => {
    const headers = ['שם מוצר', 'קטגוריה', 'כמות במלאי', 'מינימום נדרש', 'צריכה יומית'];
    const rows = inventory.map(item => [
      `"${item.name}"`,
      `"${item.category}"`,
      item.quantity,
      item.minThreshold,
      item.dailyUsage
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'הכל' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = inventory.filter(item => item.quantity <= item.minThreshold).length;
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-slate-950" dir="rtl">
      
      {/* Background glow elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header / Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-cyan-400"></div>
            <div>
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">מערכת ניהול חכמה v2.0</span>
              <h1 className="text-2xl md:text-4xl font-black mt-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                שליטה ובקרה למלאי
              </h1>
              <p className="text-slate-400 text-sm mt-1">מעקב מדויק, חיזוי צריכה והתראות חוסר בזמן אמת</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-800/80">
              <div className="text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300">
                סה״כ סוגי מוצרים: <strong className="text-cyan-400">{inventory.length}</strong>
              </div>
              <div className="text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300">
                סה״כ יחידות פיזיות: <strong className="text-indigo-400">{totalItems}</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400">סטטוס תפעולי</h3>
              {lowStockCount > 0 ? (
                <div className="mt-3 bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 shadow-lg shadow-rose-950/30 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <div className="font-black text-base">{lowStockCount} מוצרים מתחת למינימום!</div>
                    <div className="text-xs text-rose-300/80 mt-0.5">יש לבצע הזמנת רכש דחופה.</div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-950/30 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <div className="font-black text-base">הכל תקין במלאי</div>
                    <div className="text-xs text-emerald-300/80 mt-0.5">אין חוסרים קריטיים כרגע.</div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={exportToExcel}
              className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-2xl text-sm font-bold transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 border border-emerald-500/30"
            >
              📥 ייצוא דוח מלא (Excel/CSV)
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80">
          <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            הוספת מוצר חדש למלאי
          </h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="שם המוצר"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-slate-950 border border-slate-800 text-slate-300 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition cursor-pointer"
            >
              {categories.filter(c => c !== 'הכל').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="כמות נוכחית"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition"
            />
            <input
              type="number"
              placeholder="כמות מינימום"
              value={form.minThreshold}
              onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="צריכה/יום"
                value={form.dailyUsage}
                onChange={(e) => setForm({ ...form, dailyUsage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-slate-950 font-black px-5 py-3 rounded-2xl transition text-sm shadow-lg shadow-cyan-950 flex items-center justify-center shrink-0"
              >
                +
              </button>
            </div>
          </form>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80">
          
          {/* Search Bar */}
          <div className="w-full md:w-72 relative">
            <span className="absolute right-3.5 top-3 text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="חיפוש לפי שם מוצר..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800/80 text-slate-100 placeholder-slate-500 pr-10 pl-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs transition"
            />
          </div>

          {/* Categories Pill Bar */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${selectedCategory === cat ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Toggles */}
          <div className="bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              🧩 קוביות
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              📋 טבלה
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const isLow = item.quantity <= item.minThreshold;
              const daysLeft = item.dailyUsage > 0 ? Math.floor(item.quantity / item.dailyUsage) : '∞';

              return (
                <div 
                  key={item.id} 
                  className={`bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl border transition flex flex-col justify-between relative overflow-hidden group ${
                    isLow ? 'border-rose-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isLow && (
                    <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-rose-600 to-red-600 text-white text-center text-xs py-1 font-black tracking-wider shadow-md">
                      ⚠️ מלאי נמוך מהנדרש!
                    </div>
                  )}
                  
                  <div className={`mt-1 ${isLow ? 'pt-4' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                          {item.category || 'כללי'}
                        </span>
                        <h3 className="text-lg font-black text-slate-100 mt-1">{item.name}</h3>
                      </div>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition"
                        title="מחק מוצר"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-slate-400 mb-5">
                      <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800/80">
                        <span className="text-slate-400 text-xs font-bold">כמות במלאי:</span>
                        <span className={`font-black text-2xl ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>{item.quantity}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                          <div className="text-[10px] text-slate-500">מינימום</div>
                          <div className="text-xs font-bold text-slate-300 mt-0.5">{item.minThreshold}</div>
                        </div>
                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                          <div className="text-[10px] text-slate-500">צריכה/יום</div>
                          <div className="text-xs font-bold text-slate-300 mt-0.5">{item.dailyUsage}</div>
                        </div>
                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                          <div className="text-[10px] text-slate-500">ימים למלאי</div>
                          <div className={`text-xs font-black mt-0.5 ${Number(daysLeft) <= 3 ? 'text-rose-400' : 'text-cyan-400'}`}>{daysLeft} ימים</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Quantity adjusters */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 gap-2">
                    <span className="text-xs font-bold text-slate-500">עדכון מהיר:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -5)}
                        className="px-2.5 h-9 bg-slate-950 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-black rounded-xl transition border border-slate-800"
                        title="הסר 5"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-9 h-9 bg-slate-950 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 font-black rounded-xl flex items-center justify-center transition border border-slate-800"
                        title="הסר 1"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-9 h-9 bg-slate-950 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 font-black rounded-xl flex items-center justify-center transition border border-slate-800"
                        title="הוסף 1"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, 10)}
                        className="px-2.5 h-9 bg-slate-950 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 text-xs font-black rounded-xl transition border border-slate-800"
                        title="הוסף 10"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-slate-800/80">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-xs font-bold border-b border-slate-800">
                  <th className="p-4">שם המוצר</th>
                  <th className="p-4">קטגוריה</th>
                  <th className="p-4">כמות נוכחית</th>
                  <th className="p-4">מינימום נדרש</th>
                  <th className="p-4">צריכה יומית</th>
                  <th className="p-4">פעולות מהירות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredInventory.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-800/40 transition ${isLow ? 'bg-rose-500/5' : ''}`}>
                      <td className="p-4 font-black text-slate-200">{item.name}</td>
                      <td className="p-4">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                          {item.category || 'כללי'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-black px-3 py-1 rounded-xl text-xs ${isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {item.quantity} {isLow && '⚠️'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">{item.minThreshold}</td>
                      <td className="p-4 text-slate-400 font-medium">{item.dailyUsage} יח'</td>
                      <td className="p-4 flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 bg-slate-950 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl font-black text-slate-300 flex items-center justify-center transition border border-slate-800"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 bg-slate-950 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl font-black text-slate-300 flex items-center justify-center transition border border-slate-800"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="text-slate-500 hover:text-rose-400 mr-4 transition p-1"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredInventory.length === 0 && (
          <div className="bg-slate-900/90 backdrop-blur-xl p-12 rounded-3xl text-center text-slate-500 shadow-xl border border-slate-800 font-medium">
            לא נמצאו מוצרים תואמים לחיפוש או לקטגוריה הנבחרת.
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="text-3xl">⚠️</div>
              <h3 className="text-lg font-bold text-white">האם למחוק את המוצר?</h3>
              <p className="text-xs text-slate-400">פעולה זו תסיר את המוצר מהמלאי לצמיתות.</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs transition"
                >
                  ביטול
                </button>
                <button
                  onClick={() => deleteItem(deleteConfirmId)}
                  className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-lg shadow-rose-950"
                >
                  מחק לצמיתות
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
