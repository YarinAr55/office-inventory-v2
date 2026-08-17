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

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'הכל' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = inventory.filter(item => item.quantity <= item.minThreshold).length;
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 p-6 md:p-10 font-sans selection:bg-indigo-500 selection:text-white" dir="rtl">
      
       {/* Background ambient lighting */}
       <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none"></div>
       <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"></span>
              <span className="text-xs font-medium tracking-widest uppercase text-slate-400">Inventory Management System</span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white mt-2">
              ניהול <span className="font-semibold text-indigo-400">מלאי ראשי</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">סטטוס תפעולי</div>
              <div className={`text-xs font-medium mt-0.5 ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lowStockCount > 0 ? `${lowStockCount} מוצרים דורשים השלמה` : 'כל המלאי תקין'}
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-medium transition backdrop-blur-md"
            >
              ייצוא נתונים
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl backdrop-blur-xl">
            <div className="text-xs font-medium text-slate-400">סה״כ מוצרים במערכת</div>
            <div className="text-2xl font-light text-white mt-2">{inventory.length}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl backdrop-blur-xl">
            <div className="text-xs font-medium text-slate-400">סך יחידות במלאי</div>
            <div className="text-2xl font-light text-indigo-400 mt-2">{totalItems}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl backdrop-blur-xl">
            <div className="text-xs font-medium text-slate-400">מוצרים בחוסר</div>
            <div className={`text-2xl font-light mt-2 ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl backdrop-blur-xl">
          <div className="text-sm font-medium text-slate-300 mb-4">הוספת פריט חדש</div>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="שם המוצר"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-black/40 border border-white/10 text-slate-200 placeholder-slate-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-black/40 border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition cursor-pointer"
            >
              {categories.filter(c => c !== 'הכל').map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="כמות נוכחית"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="bg-black/40 border border-white/10 text-slate-200 placeholder-slate-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition"
            />
            <input
              type="number"
              placeholder="מינימום נדרש"
              value={form.minThreshold}
              onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
              className="bg-black/40 border border-white/10 text-slate-200 placeholder-slate-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="צריכה יומית"
                value={form.dailyUsage}
                onChange={(e) => setForm({ ...form, dailyUsage: e.target.value })}
                className="w-full bg-black/40 border border-white/10 text-slate-200 placeholder-slate-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition text-xs shrink-0 shadow-lg shadow-indigo-950"
              >
                הוסף
              </button>
            </div>
          </form>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="חיפוש מהיר..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.06] text-slate-200 placeholder-slate-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${selectedCategory === cat ? 'bg-white text-slate-950' : 'bg-white/[0.02] text-slate-400 hover:text-white border border-white/[0.06]'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-white/[0.02] p-1 rounded-xl flex gap-1 border border-white/[0.06]">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
            >
              כרטיסיות
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
            >
              טבלה
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const isLow = item.quantity <= item.minThreshold;
              const daysLeft = item.dailyUsage > 0 ? Math.floor(item.quantity / item.dailyUsage) : '—';

              return (
                <div 
                  key={item.id} 
                  className={`bg-white/[0.02] border p-5 rounded-2xl backdrop-blur-xl transition flex flex-col justify-between ${
                    isLow ? 'border-rose-500/30 bg-rose-950/[0.03]' : 'border-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                          {item.category}
                        </span>
                        <h3 className="text-base font-medium text-white mt-0.5">{item.name}</h3>
                      </div>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="text-slate-600 hover:text-rose-400 text-xs transition p-1"
                      >
                        הסר
                      </button>
                    </div>

                    <div className="space-y-3 my-4">
                      <div className="flex justify-between items-baseline bg-black/30 px-4 py-3 rounded-xl border border-white/[0.04]">
                        <span className="text-xs text-slate-400">כמות נוכחית</span>
                        <span className={`text-xl font-light ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.quantity}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                          <div className="text-[10px] text-slate-500">מינימום</div>
                          <div className="text-xs font-medium text-slate-300 mt-1">{item.minThreshold}</div>
                        </div>
                        <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                          <div className="text-[10px] text-slate-500">יומי</div>
                          <div className="text-xs font-medium text-slate-300 mt-1">{item.dailyUsage}</div>
                        </div>
                        <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                          <div className="text-[10px] text-slate-500">ימים נותרו</div>
                          <div className={`text-xs font-medium mt-1 ${typeof daysLeft === 'number' && daysLeft <= 3 ? 'text-rose-400' : 'text-slate-300'}`}>
                            {daysLeft}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <span className="text-[11px] text-slate-500">עדכון מהיר</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg flex items-center justify-center transition text-xs border border-white/[0.06]"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg flex items-center justify-center transition text-xs border border-white/[0.06]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-xl">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 text-xs font-medium">
                  <th className="p-4">שם המוצר</th>
                  <th className="p-4">קטגוריה</th>
                  <th className="p-4">כמות</th>
                  <th className="p-4">מינימום</th>
                  <th className="p-4">צריכה יומית</th>
                  <th className="p-4">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filteredInventory.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition">
                      <td className="p-4 font-medium text-white">{item.name}</td>
                      <td className="p-4 text-slate-400">{item.category}</td>
                      <td className="p-4">
                        <span className={`font-medium ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{item.minThreshold}</td>
                      <td className="p-4 text-slate-400">{item.dailyUsage}</td>
                      <td className="p-4 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg flex items-center justify-center transition border border-white/[0.06]"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg flex items-center justify-center transition border border-white/[0.06]"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="text-slate-600 hover:text-rose-400 mr-2 transition"
                        >
                          מחק
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
          <div className="bg-white/[0.02] border border-white/[0.06] p-12 rounded-2xl text-center text-slate-500 text-xs">
            לא נמצאו נתונים תואמים
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#12141C] border border-white/10 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
              <div className="text-sm font-medium text-white">האם למחוק את הפריט?</div>
              <p className="text-xs text-slate-400">פעולה זו תסיר את המוצר מהמערכת לצמיתות.</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-1/2 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs font-medium transition"
                >
                  ביטול
                </button>
                <button
                  onClick={() => deleteItem(deleteConfirmId)}
                  className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-xl text-xs font-medium transition"
                >
                  אישור מחיקה
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
