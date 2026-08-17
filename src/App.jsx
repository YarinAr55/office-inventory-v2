import React, { useState, useMemo } from 'react';

export default function InventorySystem() {
    // --- States ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [toastMessage, setToastMessage] = useState(null);

    // Initial Inventory Data
    const [inventory, setInventory] = useState([
        { id: 1, sku: 'SKU-1001', name: 'חלב תנובה 3%', category: 'מוצרי חלב', warehouse: 'מחסן מרכזי - תל אביב', quantity: 45, minThreshold: 20, unitCost: 6.90 },
        { id: 2, sku: 'SKU-1002', name: 'לחם אחיד פרוס', category: 'מאפים', warehouse: 'לוגיסטיקה צפון - חיפה', quantity: 12, minThreshold: 15, unitCost: 7.50 },
        { id: 3, sku: 'SKU-1003', name: 'מים מינרליים (שישייה)', category: 'משאות', warehouse: 'מחסן מרכזי - תל אביב', quantity: 120, minThreshold: 50, unitCost: 14.90 },
        { id: 4, sku: 'SKU-1004', name: 'ביציםL (מארז 30)', category: 'בסיסי', warehouse: 'לוגיסטיקה דרום - באר שבע', quantity: 8, minThreshold: 25, unitCost: 32.00 }
    ]);

    // Initial Logs Data
    const [logs, setLogs] = useState([
        { id: 1, type: 'RESTOCK', description: 'הוספת כמויות ל-מים מינרליים', user: 'מנהל מערכת', timestamp: '10:30 - היום' },
        { id: 2, type: 'ALERT', description: 'זוהה מלאי קריטי עבור ביציםL', user: 'מערכת אוטומטית', timestamp: '09:15 - היום' }
    ]);

    // Modals States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'מוצרי חלב',
        warehouse: 'מחסן מרכזי - תל אביב',
        quantity: 10,
        minThreshold: 5,
        unitCost: 10
    });

    // --- Toast Helper ---
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // --- Actions & Handlers ---
    const updateQuantity = (id, delta) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                addLog('UPDATE', `עדכון כמות עבור ${item.name} ל-${newQty}`, 'משתמש פעיל');
                return { ...item, quantity: newQty };
            }
            return item;
        }));
        showToast("הכמות עודכנה בהצלחה");
    };

    const deleteItem = (id) => {
        const itemToDelete = inventory.find(i => i.id === id);
        setInventory(prev => prev.filter(item => item.id !== id));
        if (itemToDelete) {
            addLog('ALERT', `מחיקת פריט: ${itemToDelete.name}`, 'מנהל מערכת');
        }
        setDeleteConfirmId(null);
        showToast("הפריט נמחק בהצלחה");
    };

    const handleSaveItem = (e) => {
        e.preventDefault();
        if (editItem) {
            // Edit
            setInventory(prev => prev.map(item => item.id === editItem.id ? { ...editItem, ...formData, quantity: Number(formData.quantity), minThreshold: Number(formData.minThreshold), unitCost: Number(formData.unitCost) } : item));
            addLog('UPDATE', `עריכת פריט: ${formData.name}`, 'מנהל מערכת');
            showToast("הפריט עודכן בהצלחה");
        } else {
            // Add New
            const newItem = {
                id: Date.now(),
                ...formData,
                quantity: Number(formData.quantity),
                minThreshold: Number(formData.minThreshold),
                unitCost: Number(formData.unitCost),
                sku: formData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`
            };
            setInventory(prev => [newItem, ...prev]);
            addLog('RESTOCK', `הוספת פריט חדש: ${formData.name}`, 'מנהל מערכת');
            showToast("הפריט נוסף בהצלחה למאגר");
        }
        setIsAddModalOpen(false);
        setEditItem(null);
    };

    const addLog = (type, description, user) => {
        const newLog = {
            id: Date.now(),
            type,
            description,
            user,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - היום'
        };
        setLogs(prev => [newLog, ...prev]);
    };

    // --- Filtered Data ---
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesWarehouse && matchesCategory;
        });
    }, [inventory, searchTerm, selectedWarehouse, selectedCategory]);

    // --- Statistics ---
    const totalUnits = useMemo(() => inventory.reduce((acc, item) => acc + item.quantity, 0), [inventory]);
    const totalValue = useMemo(() => inventory.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0), [inventory]);
    const criticalItemsCount = useMemo(() => inventory.filter(item => item.quantity <= item.minThreshold).length, [inventory]);

    const categoriesBreakdown = useMemo(() => {
        const map = {};
        inventory.forEach(item => {
            map[item.category] = (map[item.category] || 0) + item.quantity;
        });
        return Object.entries(map);
    }, [inventory]);

    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 font-sans relative" dir="rtl">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 left-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold animate-bounce">
                    {toastMessage}
                </div>
            )}

            {/* Header / Navigation Tabs */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/30">L</div>
                    <div>
                        <h1 className="text-sm font-bold text-white">מערכת לוגיסטית מתקדמת</h1>
                        <p className="text-[10px] text-slate-400">ניהול מלאי מרכזי ענן</p>
                    </div>
                </div>

                <nav className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    {['dashboard', 'inventory', 'analytics', 'logs'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab === 'dashboard' && 'לוח בקרה'}
                            {tab === 'inventory' && 'ניהול מלאי'}
                            {tab === 'analytics' && 'אנליטיקה'}
                            {tab === 'logs' && 'יומן מערכת'}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={() => {
                        setEditItem(null);
                        setFormData({ name: '', sku: '', category: 'מוצרי חלב', warehouse: 'מחסן מרכזי - תל אביב', quantity: 10, minThreshold: 5, unitCost: 10 });
                        setIsAddModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl text-xs font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                    <span>+</span> הוסף פריט חדש
                </button>
            </header>

            {/* Main Content Area */}
            <main>
                {/* ==================== TAB 1: DASHBOARD ==================== */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl">
                                <div className="text-xs text-slate-400">סך יחידות במאגר</div>
                                <div className="text-2xl font-black text-white mt-2">{totalUnits.toLocaleString()}</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl">
                                <div className="text-xs text-slate-400">שווי כולל למלאי</div>
                                <div className="text-2xl font-black text-emerald-400 mt-2">₪{totalValue.toLocaleString()}</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl">
                                <div className="text-xs text-slate-400">פריטים במלאי קריטי</div>
                                <div className="text-2xl font-black text-rose-400 mt-2">{criticalItemsCount}</div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-3xl backdrop-blur-2xl space-y-4">
                            <h2 className="text-sm font-bold text-white">סטטוס פריטים אחרונים</h2>
                            <div className="divide-y divide-white/5">
                                {inventory.slice(0, 4).map(item => (
                                    <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                                        <div>
                                            <span className="font-bold text-white">{item.name}</span>
                                            <span className="text-slate-400 mr-2">({item.warehouse})</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono font-bold ${item.quantity <= item.minThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                כמות: {item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== TAB 2: INVENTORY ==================== */}
                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Filters & View Mode */}
                        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-2xl">
                            <input
                                type="text"
                                placeholder="חפש לפי שם מוצר או מק״ט..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/40 border border-white/10 text-slate-200 px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 w-full md:w-72"
                            />

                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    className="bg-black/40 border border-white/10 text-slate-200 px-3 py-2.5 rounded-2xl text-xs focus:outline-none"
                                >
                                    <option value="all" className="bg-slate-900">כל המחסנים</option>
                                    <option value="מחסן מרכזי - תל אביב" className="bg-slate-900">מחסן מרכזי - תל אביב</option>
                                    <option value="לוגיסטיקה צפון - חיפה" className="bg-slate-900">לוגיסטיקה צפון - חיפה</option>
                                    <option value="לוגיסטיקה דרום - באר שבע" className="bg-slate-900">לוגיסטיקה דרום - באר שבע</option>
                                </select>

                                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                                    <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-xl text-xs ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>תצוגת רשת</button>
                                    <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-xl text-xs ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>תצוגת טבלה</button>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Grid / Table */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {filteredInventory.map(item => {
                                    const isLow = item.quantity <= item.minThreshold;
                                    return (
                                        <div key={item.id} className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-2xl space-y-4 hover:border-indigo-500/30 transition">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] font-mono text-indigo-400">{item.sku}</span>
                                                    <h3 className="text-sm font-bold text-white mt-0.5">{item.name}</h3>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${isLow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                                    {isLow ? 'קריטי' : 'תקין'}
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-400 space-y-1">
                                                <div>קטגוריה: <span className="text-slate-200">{item.category}</span></div>
                                                <div>מחסן: <span className="text-slate-200">{item.warehouse}</span></div>
                                                <div className={`font-bold mt-2 ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>כמות במלאי: {item.quantity} (סף: {item.minThreshold})</div>
                                            </div>

                                            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] text-slate-500">שווי כולל</div>
                                                    <div className="text-xs font-semibold text-slate-200 mt-0.5">₪{(item.quantity * item.unitCost).toLocaleString()}</div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold">-</button>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold">+</button>
                                                    <button onClick={() => { setEditItem(item); setFormData(item); setIsAddModalOpen(true); }} className="text-xs text-indigo-400 hover:underline px-1">ערוך</button>
                                                    <button onClick={() => setDeleteConfirmId(item.id)} className="text-xs text-rose-400 hover:underline px-1">מחק</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden backdrop-blur-2xl">
                                <table className="w-full text-right border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] bg-black/40 text-[11px] text-slate-400">
                                            <th className="p-4">מק״ט</th>
                                            <th className="p-4">שם המוצר</th>
                                            <th className="p-4">קטגוריה</th>
                                            <th className="p-4">מתחם לוגיסטי</th>
                                            <th className="p-4">כמות</th>
                                            <th className="p-4">עלות כוללת</th>
                                            <th className="p-4 text-center">פעולות</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {filteredInventory.map(item => {
                                            const isLow = item.quantity <= item.minThreshold;
                                            return (
                                                <tr key={item.id} className="hover:bg-white/[0.02] transition">
                                                    <td className="p-4 font-mono text-indigo-400">{item.sku}</td>
                                                    <td className="p-4 font-bold text-white">{item.name}</td>
                                                    <td className="p-4 text-slate-300">{item.category}</td>
                                                    <td className="p-4 text-slate-400">{item.warehouse}</td>
                                                    <td className={`p-4 font-black ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>{item.quantity}</td>
                                                    <td className="p-4 text-slate-300">₪{(item.quantity * item.unitCost).toLocaleString()}</td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-white/5 rounded-lg font-bold">-</button>
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-white/5 rounded-lg font-bold">+</button>
                                                            <button onClick={() => { setEditItem(item); setFormData(item); setIsAddModalOpen(true); }} className="text-indigo-400 hover:underline px-2">ערוך</button>
                                                            <button onClick={() => setDeleteConfirmId(item.id)} className="text-rose-400 hover:underline px-2">מחק</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== TAB 3: ANALYTICS ==================== */}
                {activeTab === 'analytics' && (
                    <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-3xl backdrop-blur-2xl space-y-6">
                        <h2 className="text-lg font-bold text-white">ניתוח קטגוריות מלאי ופיזור תפעולי</h2>
                        <div className="space-y-4 pt-4">
                            {categoriesBreakdown.map(([cat, qty]) => {
                                const percentage = totalUnits > 0 ? Math.round((qty / totalUnits) * 100) : 0;
                                return (
                                    <div key={cat} className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold text-slate-200">{cat}</span>
                                            <span className="font-mono text-indigo-400">{qty} יחידות ({percentage}%)</span>
                                        </div>
                                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ==================== TAB 4: SYSTEM LOGS ==================== */}
                {activeTab === 'logs' && (
                    <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-3xl backdrop-blur-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">יומן אירועים ולוג אבטחה גלובלי</h2>
                            <button onClick={() => { setLogs([]); showToast("היומן נוקה בהצלחה"); }} className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-xs font-semibold">איפוס לוגים</button>
                        </div>
                        <div className="space-y-3 pt-2">
                            {logs.map(log => (
                                <div key={log.id} className="bg-black/30 border border-white/[0.04] p-4 rounded-2xl flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-4">
                                        <span className={`w-2.5 h-2.5 rounded-full ${log.type === 'ALERT' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                        <div>
                                            <div className="font-semibold text-white">{log.description}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">בוצע על ידי: {log.user}</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-slate-400">{log.timestamp}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* ==================== ADD / EDIT MODAL ==================== */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0c1017] border border-white/15 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">{editItem ? 'עריכת פריט' : 'הוספת פריט חדש'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1">שם המוצר</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">מק״ט / SKU</label>
                                    <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="אוטומטי אם ריק" className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-indigo-500 font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1">קטגוריה</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-2xl focus:outline-none">
                                        <option value="מוצרי חלב" className="bg-slate-900">מוצרי חלב</option>
                                        <option value="מאפים" className="bg-slate-900">מאפים</option>
                                        <option value="בסיסי" className="bg-slate-900">בסיסי</option>
                                        <option value="משאות" className="bg-slate-900">משאות</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">מתחם לוגיסטי</label>
                                    <select value={formData.warehouse} onChange={e => setFormData({ ...formData, warehouse: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-2xl focus:outline-none">
                                        <option value="מחסן מרכזי - תל אביב" className="bg-slate-900">מחסן מרכזי - תל אביב</option>
                                        <option value="לוגיסטיקה צפון - חיפה" className="bg-slate-900">לוגיסטיקה צפון - חיפה</option>
                                        <option value="לוגיסטיקה דרום - באר שבע" className="bg-slate-900">לוגיסטיקה דרום - באר שבע</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1">כמות</label>
                                    <input type="number" min="0" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-2xl focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">סף מינימום</label>
                                    <input type="number" min="0" required value={formData.minThreshold} onChange={e => setFormData({ ...formData, minThreshold: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-2xl focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">עלות ליחידה (₪)</label>
                                    <input type="number" step="0.01" value={formData.unitCost} onChange={e => setFormData({ ...formData, unitCost: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-2xl focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-white/5 hover:bg-white/10 text-slate-300 px-5 py-2.5 rounded-xl font-semibold">ביטול</button>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/30">שמור</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0c1017] border border-rose-500/35 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl text-xs">
                        <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl border border-rose-500/20">!</div>
                        <h3 className="text-sm font-bold text-white">האם אתה בטוח ברצונך למחוק פריט זה?</h3>
                        <p className="text-slate-400">פעולה זו תסיר את הפריט לצמיתות מהמערכת.</p>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-white/5 py-2.5 rounded-xl font-semibold">ביטול</button>
                            <button onClick={() => deleteItem(deleteConfirmId)} className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-600/30">מחק</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
