import React, { useState, useEffect } from 'react';

export default function App() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventory_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'חלב 3%', quantity: 12, minThreshold: 5, dailyUsage: 3 },
      { id: 2, name: 'לחם פרוס', quantity: 3, minThreshold: 4, dailyUsage: 2 },
      { id: 3, name: 'ביצים (ארגז)', quantity: 15, minThreshold: 6, dailyUsage: 1 },
    ];
  });

  const [viewMode, setViewMode] = useState('grid');
  const [form, setForm] = useState({ name: '', quantity: '', minThreshold: '', dailyUsage: '' });

  useEffect(() => {
    localStorage.setItem('inventory_data', JSON.stringify(inventory));
  }, [inventory]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!form.name || form.quantity === '' || form.minThreshold === '') return;

    const newItem = {
      id: Date.now(),
      name: form.name.trim(),
      quantity: parseInt(form.quantity, 10) || 0,
      minThreshold: parseInt(form.minThreshold, 10) || 0,
      dailyUsage: parseInt(form.dailyUsage, 10) || 0,
    };

    setInventory([...inventory, newItem]);
    setForm({ name: '', quantity: '', minThreshold: '', dailyUsage: '' });
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
  };

  const exportToExcel = () => {
    const headers = ['שם מוצר', 'כמות במלאי', 'מינימום נדרש', 'צריכה יומית'];
    const rows = inventory.map(item => [
      `"${item.name}"`,
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

  const lowStockCount = inventory.filter(item => item.quantity <= item.minThreshold).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header / Dashboard */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">מערכת ניהול מלאי חכמה</h1>
            <p className="text-slate-500 text-sm mt-1">מעקב מלאי יומי, צריכה והתראות חוסר בזמן אמת</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {lowStockCount > 0 ? (
              <div className="bg-rose-50 text-rose-700 px-4 py-2.5 rounded-2xl border border-rose-100 text-sm font-bold flex items-center gap-2 shadow-sm">
                <span>⚠️ {lowStockCount} מוצרים מתחת למינימום!</span>
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl border border-emerald-100 text-sm font-bold flex items-center gap-2 shadow-sm">
                <span>✅ כל המלאי תקין</span>
              </div>
            )}
            
            <button
              onClick={exportToExcel}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition shadow-sm flex items-center gap-2"
            >
              📥 ייצוא לאקסל
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">הוספת מוצר חדש למלאי</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="שם המוצר"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <input
              type="number"
              placeholder="כמות נוכחית"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <input
              type="number"
              placeholder="כמות מינימום"
              value={form.minThreshold}
              onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
              className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <input
              type="number"
              placeholder="צריכה יומית"
              value={form.dailyUsage}
              onChange={(e) => setForm({ ...form, dailyUsage: e.target.value })}
              className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-2xl transition text-sm shadow-md shadow-indigo-100"
            >
              + הוסף מוצר
            </button>
          </form>
        </div>

        {/* View Toggle Bar */}
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-black text-slate-900">רשימת המוצרים ({inventory.length})</h2>
          <div className="bg-slate-200/70 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🧩 קוביות
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              📋 טבלה
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const isLow = item.quantity <= item.minThreshold;
              return (
                <div 
                  key={item.id} 
                  className={`bg-white p-6 rounded-3xl shadow-sm border transition flex flex-col justify-between relative overflow-hidden ${
                    isLow ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-100 hover:shadow-md'
                  }`}
                >
                  {isLow && (
                    <div className="absolute top-0 right-0 left-0 bg-rose-500 text-white text-center text-xs py-1 font-black tracking-wide">
                      נדרשת השלמת מלאי!
                    </div>
                  )}
                  
                  <div className={`mt-2 ${isLow ? 'pt-2' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 transition"
                        title="מחק מוצר"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-2.5 text-sm text-slate-600 mb-6">
                      <div className="flex justify-between items-center bg-slate-50/80 px-4 py-2.5 rounded-2xl border border-slate-100">
                        <span className="text-slate-500 text-xs font-bold">כמות במלאי:</span>
                        <span className={`font-black text-lg ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{item.quantity}</span>
                      </div>
                      <div className="flex justify-between px-2 text-xs text-slate-500">
                        <span>מינימום נדרש:</span>
                        <span className="font-bold text-slate-700">{item.minThreshold}</span>
                      </div>
                      <div className="flex justify-between px-2 text-xs text-slate-500">
                        <span>צריכה יומית:</span>
                        <span className="font-bold text-slate-700">{item.dailyUsage} יחידות</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-2">
                    <span className="text-xs font-bold text-slate-400">עדכן כמות:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-10 h-10 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-700 font-black rounded-2xl flex items-center justify-center transition shadow-xs"
                        title="הסר יחידה"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-10 h-10 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black rounded-2xl flex items-center justify-center transition shadow-xs"
                        title="הוסף יחידה"
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
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
                  <th className="p-4">שם המוצר</th>
                  <th className="p-4">כמות נוכחית</th>
                  <th className="p-4">מינימום נדרש</th>
                  <th className="p-4">צריכה יומית</th>
                  <th className="p-4">פעולות מהירות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/80 transition ${isLow ? 'bg-rose-50/20' : ''}`}>
                      <td className="p-4 font-black text-slate-900">{item.name}</td>
                      <td className="p-4">
                        <span className={`font-black px-3 py-1 rounded-xl text-xs ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-800'}`}>
                          {item.quantity} {isLow && '⚠️'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{item.minThreshold}</td>
                      <td className="p-4 text-slate-600 font-medium">{item.dailyUsage}</td>
                      <td className="p-4 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl font-black text-slate-700 flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-black flex items-center justify-center transition"
                        >
                          +
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 mr-4 transition"
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

        {inventory.length === 0 && (
          <div className="bg-white p-12 rounded-3xl text-center text-slate-400 shadow-sm border border-slate-100 font-medium">
            אין פריטים במלאי כרגע. הוסף מוצר חדש דרך הטופס למעלה!
          </div>
        )}

      </div>
    </div>
  );
}
