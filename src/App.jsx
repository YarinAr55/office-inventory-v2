import React, { useState, useEffect } from 'react';

export default function App() {
  // טעינת נתונים מ-localStorage אם קיימים, או שימוש בנתוני ברירת מחדל
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

  const [viewMode, setViewMode] = useState('grid'); // 'grid' או 'table'
  const [form, setForm] = useState({ name: '', quantity: '', minThreshold: '', dailyUsage: '' });

  // שמירה אוטומטית ל-localStorage בכל שינוי במלאי
  useEffect(() => {
    localStorage.setItem('inventory_data', JSON.stringify(inventory));
  }, [inventory]);

  // הוספת פריט חדש
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

  // עדכון כמות הצריכה או המלאי
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

  // מחיקת פריט
  const deleteItem = (id) => {
    setInventory(inventory.filter((item) => item.id !== id));
  };

  // ייצוא לאקסל (קבצי CSV נפתחים ישירות באקסל)
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

  // חישוב פריטים שמתחת למינימום לצורך התראה בראש העמוד
  const lowStockCount = inventory.filter(item => item.quantity <= item.minThreshold).length;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* כותרת ונתוני סיכום (Dashboard) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">מערכת ניהול מלאי חכמה</h1>
            <p className="text-gray-500 mt-1">מעקב מלאי יומי, צריכה והתראות חוסר</p>
          </div>
          
          <div className="flex items-center gap-4">
            {lowStockCount > 0 ? (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200 text-sm font-semibold flex items-center gap-2">
                <span>⚠️ {lowStockCount} מוצרים מתחת לכמות המינימום!</span>
              </div>
            ) : (
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 text-sm font-semibold">
                <span>✅ כל המלאי תקין</span>
              </div>
            )}
            
            <button
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-2"
            >
              📥 ייצוא לאקסל
            </button>
          </div>
        </div>

        {/* טופס הוספת מוצר */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-700 mb-4">הוספת מוצר חדש למלאי</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="שם המוצר"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="number"
              placeholder="כמות נוכחית"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="number"
              placeholder="כמות מינימום נדרשת"
              value={form.minThreshold}
              onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="number"
              placeholder="צריכה יומית ממוצעת"
              value={form.dailyUsage}
              onChange={(e) => setForm({ ...form, dailyUsage: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-xl transition text-sm shadow-sm"
            >
              הוסף מוצר
            </button>
          </form>
        </div>

        {/* בורר תצוגה (קוביות / טבלה) */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">רשימת המוצרים ({inventory.length})</h2>
          <div className="bg-gray-200 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              🧩 קוביות
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              📋 טבלה
            </button>
          </div>
        </div>

        {/* תצוגת קוביות (כרטיסים) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const isLow = item.quantity <= item.minThreshold;
              return (
                <div 
                  key={item.id} 
                  className={`bg-white p-5 rounded-2xl shadow-sm border transition flex flex-col justify-between relative overflow-hidden ${
                    isLow ? 'border-red-300 bg-gradient-to-br from-white to-red-50/50' : 'border-gray-200'
                  }`}
                >
                  {isLow && (
                    <div className="absolute top-0 right-0 left-0 bg-red-500 text-white text-center text-xs py-1 font-bold">
                      נדרשת השלמת מלאי!
                    </div>
                  )}
                  
                  <div className={`mt-2 ${isLow ? 'pt-2' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-400 hover:text-red-600 text-sm p-1 transition"
                        title="מחק מוצר"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                        <span>כמות במלאי:</span>
                        <span className={`font-bold text-base ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{item.quantity}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>מינימום נדרש:</span>
                        <span className="font-semibold">{item.minThreshold}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>צריכה יומית:</span>
                        <span className="font-semibold">{item.dailyUsage} יחידות</span>
                      </div>
                    </div>
                  </div>

                  {/* כפתורי עדכון מהיר של כמות */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-2">
                    <span className="text-xs text-gray-500 font-medium">עדכן כמות:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg flex items-center justify-center transition"
                        title="הסר יחידה (נלקח היום)"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg flex items-center justify-center transition"
                        title="הוסף יחידה למלאי"
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
          /* תצוגת טבלה */
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4">שם המוצר</th>
                  <th className="p-4">כמות נוכחית</th>
                  <th className="p-4">מינימום נדרש</th>
                  <th className="p-4">צריכה יומית</th>
                  <th className="p-4">פעולות מהירות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition ${isLow ? 'bg-red-50/30' : ''}`}>
                      <td className="p-4 font-bold text-gray-800">{item.name}</td>
                      <td className="p-4">
                        <span className={`font-bold px-2 py-1 rounded-lg ${isLow ? 'bg-red-100 text-red-700' : 'text-gray-800'}`}>
                          {item.quantity} {isLow && '⚠️'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{item.minThreshold}</td>
                      <td className="p-4 text-gray-600">{item.dailyUsage}</td>
                      <td className="p-4 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold text-blue-600"
                        >
                          +
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-gray-400 hover:text-red-600 mr-4"
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
          <div className="bg-white p-12 rounded-2xl text-center text-gray-400 shadow-sm">
            אין פריטים במלאי כרגע. הוסף מוצר חדש דרך הטופס למעלה!
          </div>
        )}

      </div>
    </div>
  );
}
