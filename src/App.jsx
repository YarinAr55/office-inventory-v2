import React, { useState, useEffect, useMemo } from 'react';

// --- SYSTEM DESIGN CONSTANTS & CONFIGURATION ---
const SYSTEM_CONFIG = {
  appName: "NEXUS // Enterprise Logistics & Inventory Core",
  version: "4.2.0-STABLE",
  refreshRate: 30000,
};

const INITIAL_INVENTORY = [
  { id: 101, sku: "MLK-3PCT-01", name: "חלב תנובה 3% טרי", category: "מוצרי חלב", warehouse: "מחסן מרכזי - תל אביב", quantity: 24, minThreshold: 10, dailyUsage: 6, unitCost: 6.80, lastRestock: "2026-08-10", status: "NORMAL" },
  { id: 102, sku: "BRD-WHT-02", name: "לחם פרוס אחיד מלא", category: "מאפים", warehouse: "מחסן מרכזי - תל אביב", quantity: 4, minThreshold: 8, dailyUsage: 4, unitCost: 8.50, lastRestock: "2026-08-14", status: "CRITICAL" },
  { id: 103, sku: "EGG-LGR-03", name: "ביצים חופש גודל L (ארגז 30)", category: "בסיסי", warehouse: "לוגיסטיקה צפון - חיפה", quantity: 18, minThreshold: 5, dailyUsage: 3, unitCost: 32.00, lastRestock: "2026-08-12", status: "NORMAL" },
  { id: 104, sku: "COF-BLK-04", name: "קפה שחור עלית פרימיום 500ג", category: "משאות", warehouse: "מחסן מרכזי - תל אביב", quantity: 12, minThreshold: 6, dailyUsage: 2, unitCost: 24.90, lastRestock: "2026-08-01", status: "NORMAL" },
  { id: 105, sku: "OIL-OLV-05", name: "שמן זית כתית מעולה 1L", category: "בסיסי", warehouse: "לוגיסטיקה דרום - באר שבע", quantity: 2, minThreshold: 5, dailyUsage: 1, unitCost: 38.00, lastRestock: "2026-07-20", status: "CRITICAL" },
  { id: 106, sku: "SUG-WHT-06", name: "סוכר לבן מעובד 1 ק''ג", category: "בסיסי", warehouse: "מחסן מרכזי - תל אביב", quantity: 45, minThreshold: 15, dailyUsage: 4, unitCost: 4.50, lastRestock: "2026-08-05", status: "OPTIMAL" },
];

const INITIAL_LOGS = [
  { id: 9001, timestamp: "2026-08-17 08:30", type: "RESTOCK", description: "התקבל משלוח חדש עבור חלב תנובה 3% (+20 יח')", user: "מנהל מערכת" },
  { id: 9002, timestamp: "2026-08-17 09:15", type: "ALERT", description: "זיהוי מלאי קריטי עבור לחם פרוס אחיד מלא (נותרו 4 יח')", user: "מערכת אוטומטית" },
  { id: 9003, timestamp: "2026-08-17 10:00", type: "UPDATE", description: "עדכון צריכה יומית עבור שמן זית כתית מעולה", user: "אחראי רכש" },
];

export default function EnterpriseInventorySystem() {
  // --- STATE MANAGEMENT ---
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_inventory_v4');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_logs_v4');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, inventory, analytics, logs, settings
  const [viewMode, setViewMode] = useState('grid'); // grid, table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [selectedWarehouse, setSelectedWarehouse] = useState('הכל');
  const [sortBy, setSortBy] = useState('name'); // name, quantity, cost
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'מוצרי חלב',
    warehouse: 'מחסן מרכזי - תל אביב',
    quantity: '',
    minThreshold: '',
    dailyUsage: '',
    unitCost: ''
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('nexus_inventory_v4', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('nexus_logs_v4', JSON.stringify(logs));
  }, [logs]);

  // Toast Handler
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Logger Helper
  const addLog = (type, description) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type,
      description,
      user: "מנהל מורשה"
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Inventory Mutations
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.name || formData.quantity === '' || formData.minThreshold === '') {
      showToast("נא למלא את כל שדות החובה");
      return;
    }

    const qty = parseInt(formData.quantity, 10) || 0;
    const min = parseInt(formData.minThreshold, 10) || 0;
    const status = qty <= min ? "CRITICAL" : "NORMAL";

    if (editItem) {
      setInventory(inventory.map(item => item.id === editItem.id ? {
        ...item,
        ...formData,
        quantity: qty,
        minThreshold: min,
        dailyUsage: parseInt(formData.dailyUsage, 10) || 0,
        unitCost: parseFloat(formData.unitCost) || 0,
        status
      } : item));
      addLog("UPDATE", `עודכן פריט: ${formData.name}`);
      showToast("הפריט עודכן בהצלחה");
      setEditItem(null);
    } else {
      const newItem = {
        id: Date.now(),
        sku: formData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name.trim(),
        category: formData.category,
        warehouse: formData.warehouse,
        quantity: qty,
        minThreshold: min,
        dailyUsage: parseInt(formData.dailyUsage, 10) || 1,
        unitCost: parseFloat(formData.unitCost) || 0,
        lastRestock: new Date().toISOString().split('T')[0],
        status
      };
      setInventory([newItem, ...inventory]);
      addLog("RESTOCK", `נוסף פריט חדש למערכת: ${newItem.name}`);
      showToast("הפריט נוסף בהצלחה למאגר");
    }

    setFormData({ sku: '', name: '', category: 'מוצרי חלב', warehouse: 'מחסן מרכזי - תל אביב', quantity: '', minThreshold: '', dailyUsage: '', unitCost: '' });
    setIsAddModalOpen(false);
  };

  const updateQuantity = (id, delta) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        const status = newQty <= item.minThreshold ? "CRITICAL" : "NORMAL";
        addLog("UPDATE", `שינוי כמות עבור ${item.name}: ${item.quantity} -> ${newQty}`);
        return { ...item, quantity: newQty, status };
      }
      return item;
    }));
  };

  const deleteItem = (id) => {
    const itemToDelete = inventory.find(i => i.id === id);
    setInventory(inventory.filter(i => i.id !== id));
    if (itemToDelete) addLog("DELETE", `הוסר לצמיתות הפריט: ${itemToDelete.name}`);
    setDeleteConfirmId(null);
    showToast("הפריט הוסר מהמערכת");
  };

  // Filter & Sorted Data
  const categories = useMemo(() => ['הכל', ...new Set(inventory.map(i => i.category))], [inventory]);
  const warehouses = useMemo(() => ['הכל', ...new Set(inventory.map(i => i.warehouse))], [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'הכל' || item.category === selectedCategory;
      const matchesWarehouse = selectedWarehouse === 'הכל' || item.warehouse === selectedWarehouse;
      return matchesSearch && matchesCat && matchesWarehouse;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      if (sortBy === 'cost') return (b.unitCost * b.quantity) - (a.unitCost * a.quantity);
      return 0;
    });
  }, [inventory, searchTerm, selectedCategory, selectedWarehouse, sortBy]);

  // Analytics Metrics
  const totalUnits = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const totalInventoryValue = inventory.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  const criticalItemsCount = inventory.filter(i => i.status === 'CRITICAL').length;
  const categoriesBreakdown = useMemo(() => {
    const map = {};
    inventory.forEach(i => {
      map[i.category] = (map[i.category] || 0) + i.quantity;
    });
    return Object.entries(map);
  }, [inventory]);

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = ['SKU', 'שם מוצר', 'קטגוריה', 'מחסן', 'כמות', 'סף מינימום', 'צריכה יומית', 'עלות ליחידה', 'סטטוס'];
    const rows = inventory.map(i => [
      `"${i.sku}"`,
      `"${i.name}"`,
      `"${i.category}"`,
      `"${i.warehouse}"`,
      i.quantity,
      i.minThreshold,
      i.dailyUsage,
      i.unitCost,
      i.status
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexus_inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("EXPORT", "ייצוא דו״ח נתונים מלא לפורמט CSV");
    showToast("הדו״ח הורד בהצלחה למחשב שלך");
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20 relative overflow-x-hidden" dir="rtl">
      
      {/* Ambient Cyber Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/[0.07] rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-10 w-[500px] h-[500px] bg-cyan-600/[0.05] rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/[0.04] rounded-full blur-[140px] pointer-events-none"></div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-8 left-8 z-50 bg-[#121622] border border-indigo-500/30 text-slate-100 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="border-b border-white/[0.06] bg-[#06080E]/80 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-600/20">
              <div className="w-full h-full bg-[#0a0d14] rounded-[15px] flex items-center justify-center font-black text-indigo-400 text-base">
                NX
              </div>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                {SYSTEM_CONFIG.appName}
                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-indigo-400 font-mono font-medium">{SYSTEM_CONFIG.version}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">מערכת בקרת לוגיסטיקה ואספקה תפעולית גלובלית</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold transition backdrop-blur-md flex items-center gap-2 group"
            >
              <span>ייצוא נתונים מלא (CSV)</span>
            </button>
            <button
              onClick={() => { setEditItem(null); setFormData({ sku: '', name: '', category: 'מוצרי חלב', warehouse: 'מחסן מרכזי - תל אביב', quantity: '', minThreshold: '', dailyUsage: '', unitCost: '' }); setIsAddModalOpen(true); }}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
            >
              <span className="text-base leading-none">+</span>
              <span>הוספת פריט חדש</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-2 border-t border-white/[0.04] py-2">
          {[
            { id: 'dashboard', label: 'סקירה כללית' },
            { id: 'inventory', label: 'ניהול מלאי מפורט' },
            { id: 'analytics', label: 'דוחות וניתוחים' },
            { id: 'logs', label: 'לוג מערכת ואבטחת מידע' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container View */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8 relative z-10">

        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl relative overflow-hidden group hover:border-white/15 transition">
                <div className="text-xs font-medium text-slate-400">סה״כ פריטים במאגר</div>
                <div className="text-4xl font-light text-white mt-3 tracking-tight">{inventory.length}</div>
                <div className="text-[11px] text-indigo-400 mt-2 font-medium">פרוסים על פני 3 מתחמים</div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition"></div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl relative overflow-hidden group hover:border-white/15 transition">
                <div className="text-xs font-medium text-slate-400">סך יחידות במלאי הגלובלי</div>
                <div className="text-4xl font-light text-cyan-400 mt-3 tracking-tight">{totalUnits.toLocaleString()}</div>
                <div className="text-[11px] text-cyan-400/80 mt-2 font-medium">יחידות מוכנות לניפוק</div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition"></div>
              </div>

              <div className={`border p-6 rounded-3xl backdrop-blur-2xl relative overflow-hidden group transition ${criticalItemsCount > 0 ? 'bg-rose-950/10 border-rose-500/40' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                <div className="text-xs font-medium text-slate-400">מוצרים במצב קריטי (מתחת לסף)</div>
                <div className={`text-4xl font-light mt-3 tracking-tight ${criticalItemsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {criticalItemsCount}
                </div>
                <div className={`text-[11px] mt-2 font-medium ${criticalItemsCount > 0 ? 'text-rose-400/80' : 'text-emerald-400/80'}`}>
                  {criticalItemsCount > 0 ? 'דורש הזמנת רכש מיידית' : 'כל רמות המלאי תקינות'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900/40 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-2xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium text-indigo-300">שווי מלאי כולל מוערך</div>
                  <div className="text-3xl font-light text-white mt-3 tracking-tight">₪{totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-4">
                  <span className="text-[11px] text-slate-400">סטטוס שרת תפעולי</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    מקוון (99.9%)
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Alerts Section if any */}
            {criticalItemsCount > 0 && (
              <div className="bg-rose-950/10 border border-rose-500/30 rounded-3xl p-6 backdrop-blur-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                    <h2 className="text-sm font-bold text-rose-300">התראות מלאי קריטי המחייבות התערבות מיידית</h2>
                  </div>
                  <span className="text-xs text-rose-400 font-mono">סה״כ {criticalItemsCount} פריטים</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {inventory.filter(i => i.status === 'CRITICAL').map(item => (
                    <div key={item.id} className="bg-[#120a0e] border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-mono text-rose-400">{item.sku}</div>
                        <div className="text-sm font-bold text-white mt-0.5">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-1">כמות נוכחית: <span className="text-rose-400 font-bold">{item.quantity}</span> (מינימום: {item.minThreshold})</div>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, item.minThreshold * 2)}
                        className="bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 px-3 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        השלם מלאי
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Inventory Overview Table & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Recent Items */}
              <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">פריטים אחרונים במערכת</h2>
                    <p className="text-xs text-slate-400">תצוגה מהירה של הפריטים המרכזיים</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    לכל הפריטים ←
                  </button>
                </div>

                <div className="space-y-3">
                  {inventory.slice(0, 5).map(item => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                      <div key={item.id} className="bg-black/30 border border-white/[0.04] p-4 rounded-2xl flex items-center justify-between hover:border-white/10 transition">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                            {item.quantity}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{item.warehouse} • <span className="text-indigo-400">{item.category}</span></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 rounded-xl flex items-center justify-center transition border border-white/5 font-bold text-xs"
                          >
                            -
                          </button>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 rounded-xl flex items-center justify-center transition border border-white/5 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: System Logs Snapshot */}
              <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-white">פעילות אחרונה</h2>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  </div>
                  
                  <div className="space-y-4">
                    {logs.slice(0, 4).map(log => (
                      <div key={log.id} className="border-r-2 border-indigo-500/40 pr-3 space-y-1">
                        <div className="text-[10px] text-slate-400 font-mono">{log.timestamp}</div>
                        <div className="text-xs font-semibold text-slate-200">{log.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('logs')}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/10 py-2.5 rounded-xl text-xs font-semibold transition mt-6 text-center"
                >
                  צפה בכל הלוגים המלאים
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 2: INVENTORY MANAGEMENT ==================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Control Filters Toolbar */}
            <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Search input */}
                <div className="w-full md:w-80">
                  <input
                    type="text"
                    placeholder="חיפוש לפי שם מוצר או SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none focus:border-indigo-500 text-xs transition"
                  />
                </div>

                {/* Warehouse Filter */}
                <div className="w-full md:w-auto flex items-center gap-2">
                  <span className="text-xs text-slate-400 shrink-0">מתחם:</span>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="bg-black/40 border border-white/10 text-slate-200 px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {warehouses.map(w => <option key={w} value={w} className="bg-slate-900">{w}</option>)}
                  </select>
                </div>

                {/* Sort By */}
                <div className="w-full md:w-auto flex items-center gap-2">
                  <span className="text-xs text-slate-400 shrink-0">מיון לפי:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-black/40 border border-white/10 text-slate-200 px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="name" className="bg-slate-900">שם מוצר (א-ת)</option>
                    <option value="quantity" className="bg-slate-900">כמות במלאי (גבוה לנמוך)</option>
                    <option value="cost" className="bg-slate-900">שווי כולל (גבוה לנמוך)</option>
                  </select>
                </div>

                {/* Grid / Table View Toggles */}
                <div className="bg-black/40 p-1 rounded-2xl flex gap-1 border border-white/10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                  >
                    כרטיסיות
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                  >
                    טבלה מתקדמת
                  </button>
                </div>

              </div>

              {/* Categories Tags Bar */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-white/[0.02] text-slate-400 hover:text-white border border-white/[0.06]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInventory.map(item => {
                  const isLow = item.quantity <= item.minThreshold;
                  const daysLeft = item.dailyUsage > 0 ? Math.floor(item.quantity / item.dailyUsage) : '∞';

                  return (
                    <div
                      key={item.id}
                      className={`bg-white/[0.02] border p-6 rounded-3xl backdrop-blur-2xl transition flex flex-col justify-between relative group ${
                        isLow ? 'border-rose-500/40 bg-gradient-to-b from-white/[0.02] to-rose-950/10' : 'border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
                                {item.sku}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.category}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white mt-2">{item.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditItem(item); setFormData(item); setIsAddModalOpen(true); }}
                              className="text-slate-500 hover:text-indigo-400 text-xs transition p-2 rounded-xl hover:bg-white/[0.05]"
                              title="ערוך פריט"
                            >
                              ערוך
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="text-slate-500 hover:text-rose-400 text-xs transition p-2 rounded-xl hover:bg-rose-500/10"
                              title="מחק פריט"
                            >
                              מחק
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 mb-4 bg-black/20 px-3 py-1.5 rounded-xl border border-white/[0.03]">
                          📍 {item.warehouse}
                        </div>

                        {/* Quantity Metrics Box */}
                        <div className="space-y-3 my-4">
                          <div className="flex justify-between items-center bg-black/40 px-4 py-3 rounded-2xl border border-white/[0.04]">
                            <span className="text-xs text-slate-400 font-medium">כמות נוכחית במלאי</span>
                            <span className={`text-2xl font-black ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {item.quantity}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                              <div className="text-[10px] text-slate-500">מינימום</div>
                              <div className="text-xs font-bold text-slate-300 mt-1">{item.minThreshold}</div>
                            </div>
                            <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                              <div className="text-[10px] text-slate-500">יומי</div>
                              <div className="text-xs font-bold text-slate-300 mt-1">{item.dailyUsage}</div>
                            </div>
                            <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                              <div className="text-[10px] text-slate-500">ימי מלאי</div>
                              <div className={`text-xs font-bold mt-1 ${typeof daysLeft === 'number' && daysLeft <= 3 ? 'text-rose-400' : 'text-cyan-400'}`}>
                                {daysLeft}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-2">
                        <span className="text-[11px] text-slate-500 font-medium">עלות: ₪{item.unitCost} / יח'</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-9 h-9 bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-xl flex items-center justify-center transition text-xs font-black border border-white/[0.06]"
                          >
                            -
                          </button>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-9 h-9 bg-white/[0.04] hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-300 rounded-xl flex items-center justify-center transition text-xs font-black border border-white/[0.06]"
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
              /* Inventory Table View */
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden backdrop-blur-2xl">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-400 text-xs font-semibold bg-black/20">
                      <th className="p-4">SKU</th>
                      <th className="p-4">שם המוצר</th>
                      <th className="p-4">קטגוריה</th>
                      <th className="p-4">מתחם לוגיסטי</th>
                      <th className="p-4">כמות</th>
                      <th className="p-4">מינימום</th>
                      <th className="p-4">עלות ליח'</th>
                      <th className="p-4">פעולות ניהול</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {filteredInventory.map(item => {
                      const isLow = item.quantity <= item.minThreshold;
                      return (
                        <tr key={item.id} className="hover:bg-white/[0.01] transition">
                          <td className="p-4 font-mono text-indigo-400">{item.sku}</td>
                          <td className="p-4 font-bold text-white">{item.name}</td>
                          <td className="p-4 text-slate-400">{item.category}</td>
                          <td className="p-4 text-slate-400">{item.warehouse}</td>
                          <td className="p-4">
                            <span className={`font-black px-3 py-1 rounded-xl ${isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">{item.minThreshold}</td>
                          <td className="p-4 text-slate-300 font-mono">₪{item.unitCost}</td>
                          <td className="p-4 flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-xl flex items-center justify-center transition font-black border border-white/[0.06]"
                            >
                              -
                            </button>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 bg-white/[0.04] hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-300 rounded-xl flex items-center justify-center transition font-black border border-white/[0.06]"
                            >
                              +
                            </button>
                            <button
                              onClick={() => { setEditItem(item); setFormData(item); setIsAddModalOpen(true); }}
                              className="text-slate-400 hover:text-indigo-400 mr-2 transition font-medium"
                            >
                              ערוך
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="text-slate-500 hover:text-rose-400 mr-2 transition font-medium"
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
              <div className="bg-white/[0.02] border border-white/[0.06] p-16 rounded-3xl text-center text-slate-500 text-xs font-medium">
                לא נמצאו פריטים תואמים לחיפוש או למסננים שנבחרו.
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 3: ANALYTICS ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Breakdown */}
              <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl space-y-6">
                <h2 className="text-base font-bold text-white">התפלגות מלאי לפי קטגוריות</h2>
                <div className="space-y-4">
                  {categoriesBreakdown.map(([cat, count]) => {
                    const percentage = Math.round((count / (totalUnits || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300">{cat}</span>
                          <span className="text-indigo-400 font-mono">{count} יח' ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/[0.04]">
                          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Valuation Summary */}
              <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl space-y-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">ניתוח פיננסי ותקציבי</h2>
                  <p className="text-xs text-slate-400 mt-1">סיכום עלויות והערכת שווי נכסים תפעוליים</p>
                  
                  <div className="space-y-4 mt-6">
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.04] flex justify-between items-center">
                      <span className="text-xs text-slate-400">שווי רכש כולל במלאי</span>
                      <span className="text-lg font-bold text-white font-mono">₪{totalInventoryValue.toLocaleString()}</span>
                    </div>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.04] flex justify-between items-center">
                      <span className="text-xs text-slate-400">עלות ממוצעת לפריט</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">₪{(totalInventoryValue / (inventory.length || 1)).toFixed(2)}</span>
                    </div>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.04] flex justify-between items-center">
                      <span className="text-xs text-slate-400">פריטים הדורשים רכש חירום</span>
                      <span className="text-lg font-bold text-rose-400 font-mono">{criticalItemsCount} פריטים</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={exportToCSV}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/20"
                >
                  הפק דו״ח פיננסי מקיף (CSV)
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 4: SYSTEM LOGS ==================== */}
        {activeTab === 'logs' && (
          <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white">יומן אירועים ופעילות מערכת (Audit Logs)</h2>
                <p className="text-xs text-slate-400 mt-0.5">מעקב בזמן אמת אחר כל פעולות המלאי, שינויים והרשאות אבטחה</p>
              </div>
              <button
                onClick={() => { setLogs([]); showToast("הלוגים אופסו בהצלחה"); }}
                className="bg-white/[0.03] hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                נקה היסטוריית לוגים
              </button>
            </div>

            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="bg-black/30 border border-white/[0.04] p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`w-2.5 h-2.5 rounded-full ${log.type === 'ALERT' ? 'bg-rose-500' : log.type === 'RESTOCK' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                    <div>
                      <div className="text-xs font-semibold text-white">{log.description}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.timestamp} • בוצע ע״י: {log.user}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300">
                    {log.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ==================== MODALS ==================== */}

      {/* Add / Edit Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#0e111a] border border-white/10 p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl text-right">
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white">{editItem ? 'עריכת פריט קיים במלאי' : 'הוספת פריט חדש למאגר'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">שם המוצר *</label>
                  <input
                    type="text"
                    required
                    placeholder="למשל: חלב תנובה 3%"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">מק״ט (SKU)</label>
                  <input
                    type="text"
                    placeholder="למשל: MLK-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">קטגוריה</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {categories.filter(c => c !== 'הכל').map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">מתחם לוגיסטי</label>
                  <select
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {warehouses.filter(w => w !== 'הכל').map(w => <option key={w} value={w} className="bg-slate-900">{w}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">כמות נוכחית *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">סף מינימום *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">צריכה יומית</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dailyUsage}
                    onChange={(e) => setFormData({ ...formData, dailyUsage: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">עלות ליחידה בודדת (₪)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-slate-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-2xl text-xs font-semibold transition"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-2xl text-xs font-semibold transition shadow-lg shadow-indigo-600/25"
                >
                  {editItem ? 'שמור שינויים' : 'הוסף פריט למאגר'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#0e111a] border border-white/10 p-8 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl text-right">
            <div className="text-base font-bold text-white">אישור מחיקת פריט</div>
            <p className="text-xs text-slate-400">האם אתה בטוח שברצונך להסיר את הפריט לצמיתות מהמאגר הלוגיסטי?</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-2xl text-xs font-semibold transition"
              >
                ביטול
              </button>
              <button
                onClick={() => deleteItem(deleteConfirmId)}
                className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl text-xs font-semibold transition shadow-lg shadow-rose-950"
              >
                אישור מחיקה
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
