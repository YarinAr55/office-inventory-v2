import React, { useState } from 'react';
import { 
  Package, Plus, Minus, Search, Trash2, AlertTriangle, 
  CheckCircle, BarChart3, X
} from 'lucide-react';

export default function App() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'נייר צילום A4', category: 'ציוד משרדי', quantity: 45, minStock: 10, price: 25, location: 'מחסן ראשי' },
    { id: 2, name: 'עטים כחולים (קופסה)', category: 'כתיבה', quantity: 8, minStock: 15, price: 12, location: 'ארון אספקה' },
    { id: 3, name: 'טונר למדפסת HP', category: 'טכנולוגיה', quantity: 3, minStock: 5, price: 220, location: 'חדר שרתים' },
    { id: 4, name: 'כוסות קרטון חד פעמיות', category: 'מטבח', quantity: 120, minStock: 50, price: 35, location: 'מטבח קומה 2' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'ציוד משרדי',
    quantity: 10,
    minStock: 5,
    price: 10,
    location: 'מחסן ראשי'
  });

  const updateQuantity = (id, delta) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const deleteProduct = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name) return;

    const productToAdd = {
      ...newProduct,
      id: Date.now(),
      quantity: Number(newProduct.quantity),
      minStock: Number(newProduct.minStock),
      price: Number(newProduct.price)
    };

    setInventory([productToAdd, ...inventory]);
    setNewProduct({ name: '', category: 'ציוד משרדי', quantity: 10, minStock: 5, price: 10, location: 'מחסן ראשי' });
    setIsAddModalOpen(false);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'הכל' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-200" />
            <div>
              <h1 className="text-xl font-bold">ניהול מלאי משרדי</h1>
              <p className="text-xs text-indigo-200">מערכת בקרה ואספקה חכמה</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" /> הוסף מוצר חדש
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">סה"כ פריטים במלאי</p>
              <p className="text-2xl font-bold text-slate-800">{totalItems}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">מוצרים במלאי נמוך</p>
              <p className="text-2xl font-bold text-amber-600">{lowStockItems}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">שווי מלאי מוערך</p>
              <p className="text-2xl font-bold text-emerald-600">₪{totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="חפש לפי שם מוצר או מיקום..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {['הכל', 'ציוד משרדי', 'כתיבה', 'טכנולוגיה', 'מטבח'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === category 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3 px-4">שם המוצר</th>
                  <th className="py-3 px-4">קטגוריה</th>
                  <th className="py-3 px-4">מיקום</th>
                  <th className="py-3 px-4">כמות</th>
                  <th className="py-3 px-4">מחיר ליחידה</th>
                  <th className="py-3 px-4">סטטוס</th>
                  <th className="py-3 px-4 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map(item => {
                    const isLow = item.quantity <= item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.location}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">₪{item.price}</td>
                        <td className="py-3 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" /> מלאי נמוך
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> תקין
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => deleteProduct(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="מחק מוצר"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      לא נמצאו מוצרים תואמים לחיפוש
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center bg-slate-100 px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800 text-lg">הוספת מוצר חדש למלאי</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">שם המוצר</label>
                <input 
                  type="text" 
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="לדוגמה: מרקרים זוהרים"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">קטגוריה</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="ציוד משרדי">ציוד משרדי</option>
                    <option value="כתיבה">כתיבה</option>
                    <option value="טכנולוגיה">טכנולוגיה</option>
                    <option value="מטבח">מטבח</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">מיקום במשרד</label>
                  <input 
                    type="text" 
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">כמות התחלתית</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">סף התראה</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">מחיר (₪)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  ביטול
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition shadow cursor-pointer"
                >
                  שמור מוצר
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
