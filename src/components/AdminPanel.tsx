import React, { useState, useEffect } from 'react';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, getDoc, setDoc 
} from 'firebase/firestore';
import { useAuthStore, loginWithEmail } from '../lib/auth';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  Package, Plus, Trash2, Edit2, LogOut, Loader2, Save, X, ShoppingBag, 
  Sparkles, LayoutDashboard, Settings, TrendingUp, Users, CheckCircle2, 
  Clock, Truck, Search, Globe, Bell, AlertCircle, ChevronRight, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id?: string;
  title: string;
  price: string;
  tag: string;
  color: string;
  image?: string;
  description?: string;
  category?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  customNotes?: string;
  items?: any[];
  createdAt: any;
}

const AdminPanel = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product>({ 
    title: '', price: '', tag: 'New Drop', color: 'bg-violet-500', image: '', description: '', category: 'General' 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Global Settings State
  const [siteSettings, setSiteSettings] = useState({
    heroTitle: 'SD Studios Lab',
    heroSubtitle: 'Professional 3D Manufacturing',
    noticeBanner: 'New Drop Incoming!',
    showBanner: true
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
    setLoading(false);
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ords: Order[] = [];
      querySnapshot.forEach((doc) => {
        ords.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ords);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const prods: Product[] = [];
      querySnapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
    }
  };

  const seedProducts = async () => {
    const initialProducts = [
      { title: "Stealth NFC Keychain", price: "599", tag: "Tech Gear", image: "https://images.unsplash.com/photo-1582142839930-2233e73899d4?q=80&w=800&auto=format&fit=crop", color: "bg-gray-900" },
      { title: "Anime Showcase Stand", price: "899", tag: "Anime", image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800&auto=format&fit=crop", color: "bg-rose-500" },
      { title: "Articulated Magic Dragon", price: "1499", tag: "Anime", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop", color: "bg-violet-500" },
      { title: "Geometric Voronoi Vase", price: "2199", tag: "Home Lab", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop", color: "bg-pink-500" },
      { title: "Cyberpunk Phone Stand", price: "799", tag: "Tech Gear", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop", color: "bg-indigo-500" },
      { title: "Neon Cable Organizer", price: "449", tag: "Keychains", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800&auto=format&fit=crop", color: "bg-orange-500" },
      { title: "Minimalist Desk Lamp", price: "3499", tag: "Home Lab", image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=800&auto=format&fit=crop", color: "bg-cyan-500" },
      { title: "Low-Poly Planter Trio", price: "1299", tag: "Home Lab", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop", color: "bg-teal-500" }
    ];

    try {
      for (const prod of initialProducts) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      fetchProducts();
      alert("Lab Stocked Successfully!");
    } catch (err) {
      console.error("Failed to seed", err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      if (isEditing && isEditing !== 'new') {
        const productRef = doc(db, 'products', isEditing);
        await updateDoc(productRef, {
          ...editForm,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...editForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(null);
      setEditForm({ title: '', price: '', tag: 'New Drop', color: 'bg-violet-500', image: '', description: '', category: 'General' });
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, isEditing === 'new' ? OperationType.CREATE : OperationType.UPDATE, 'products');
    }
  };

  const handleDelete = async (id: string, type: 'products' | 'orders') => {
    if (!isAuthenticated || !id) return;
    if (!window.confirm(`Are you sure you want to delete this ${type === 'products' ? 'product' : 'order'}?`)) return;

    try {
      await deleteDoc(doc(db, type, id));
      type === 'products' ? fetchProducts() : fetchOrders();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${type}/${id}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await loginWithEmail(loginForm.username, loginForm.password);
    } catch (err: any) {
      setLoginError("Access Denied: Invalid Lab Coordinates");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-violet-600 animate-spin" size={48} />
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em]">Syncing Intelligence...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        </div>
        <div className="bg-white p-12 md:p-16 rounded-[3.5rem] border border-gray-100 shadow-2xl max-w-md w-full relative z-10">
          <div className="w-20 h-20 bg-violet-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-600/20">
            <Settings size={40} />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tighter text-gray-900 leading-none">COMMAND <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">CENTER</span></h1>
          <form onSubmit={handleLogin} className="space-y-4 mt-10">
            <input 
              type="text" placeholder="ACCESS ID" value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-bold text-xs uppercase tracking-widest text-center"
            />
            <input 
              type="password" placeholder="SECRET KEY" value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-bold text-xs uppercase tracking-widest text-center"
            />
            {loginError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] font-black uppercase tracking-widest">{loginError}</motion.p>}
            <button type="submit" disabled={isLoggingIn} className="w-full bg-gray-900 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-violet-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-100 mt-4 uppercase tracking-[0.3em] text-[10px]">
              {isLoggingIn ? "AUTHENTICATING..." : "INITIATE ACCESS"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredOrders = orders.filter(o => o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.includes(searchQuery));

  return (
    <div className="min-h-screen bg-white pb-32">
       {/* Background Blobs */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden h-full">
          <div className="absolute top-[5%] right-[-5%] w-[30%] h-[30%] bg-violet-50 rounded-full blur-[100px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[5%] left-[-5%] w-[30%] h-[30%] bg-pink-50 rounded-full blur-[100px] opacity-40 animate-pulse" />
        </div>

      <div className="max-w-[1500px] mx-auto px-6 md:px-16 relative z-10 pt-24">
        
        {/* Intel Bar (Analytics) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
           {[
             { label: 'Total Revenue', value: `₹${orders.reduce((acc, o) => acc + o.total, 0)}`, icon: TrendingUp, color: 'text-green-500' },
             { label: 'Active Prints', value: orders.filter(o => o.status !== 'Shipped').length, icon: Clock, color: 'text-violet-500' },
             { label: 'Total Models', value: products.length, icon: Package, color: 'text-blue-500' },
             { label: 'Customer Reach', value: orders.length + 42, icon: Users, color: 'text-pink-500' }
           ].map((stat, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={stat.label} 
               className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col justify-between aspect-video md:aspect-auto"
             >
                <stat.icon size={24} className={stat.color} />
                <div>
                   <h4 className="text-3xl font-black tracking-tighter text-gray-900">{stat.value}</h4>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">{stat.label}</p>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="flex-1">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-gray-900 leading-[0.8]">
              The Lab <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">Controls.</span>
            </h1>
            <div className="flex flex-wrap gap-3 mt-12">
              {['products', 'orders', 'settings'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)} 
                  className={`uppercase tracking-[0.3em] text-[10px] font-black px-10 py-4 rounded-2xl transition-all duration-500
                    ${activeTab === tab ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
               <input 
                 type="text" 
                 placeholder="Search Intelligence..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full md:w-80 bg-gray-50 border border-gray-100 rounded-2xl pl-16 pr-6 py-4 outline-none focus:bg-white focus:border-violet-400 transition-all font-bold text-xs uppercase tracking-widest"
               />
            </div>
            {activeTab === 'products' && (
              <>
                <button onClick={seedProducts} className="bg-violet-50 text-violet-600 font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-violet-100 transition-all border border-violet-100 uppercase tracking-widest text-[10px]">
                  <Database size={16} /> STOCK THE LAB
                </button>
                <button onClick={() => { setIsEditing('new'); setEditForm({ title: '', price: '', tag: 'New Drop', color: 'bg-violet-500', image: '', description: '', category: 'General' }); }} className="bg-gray-900 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-violet-600 hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-[10px]">
                  <Plus size={16} /> ADD PRODUCT
                </button>
              </>
            )}
            <button onClick={logout} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-red-500 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl group relative flex flex-col">
                  <div className={`aspect-square rounded-[2.5rem] mb-6 relative ${p.color || 'bg-violet-500'} flex items-center justify-center border-4 border-white shadow-lg overflow-hidden`}>
                    <img src={p.image || "/assets/placeholder.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute top-4 left-4 text-[8px] bg-white/90 text-gray-900 px-3 py-1.5 rounded-full uppercase font-black tracking-widest shadow-sm">{p.tag}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase leading-tight mb-1">{p.title}</h3>
                      <p className="text-violet-600 font-black text-lg">₹{p.price}</p>
                    </div>
                    <div className="flex gap-2 mt-6 pt-6 border-t border-gray-50">
                      <button onClick={() => { setIsEditing(p.id!); setEditForm(p); }} className="flex-1 p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-violet-600 transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p.id!, 'products')} className="flex-1 p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="py-40 text-center bg-gray-50 rounded-[4rem] border border-gray-100">
                   <ShoppingBag className="mx-auto text-gray-200 mb-6" size={64} />
                   <p className="text-gray-400 font-black text-[12px] uppercase tracking-[0.4em]">No Active Manifests</p>
                </div>
              ) : filteredOrders.map(o => (
                <div key={o.id} className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-gray-100 shadow-xl flex flex-col lg:flex-row items-center gap-10 group relative overflow-hidden">
                  <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center shrink-0 border border-gray-100"><ShoppingBag size={28} /></div>
                  <div className="flex-1 text-center lg:text-left">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Customer</p>
                    <h4 className="text-2xl font-black text-gray-900 uppercase">{o.customerName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID #{o.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-10 text-center lg:text-left">
                     <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Revenue</p>
                        <p className="text-xl font-black text-violet-600">₹{o.total}</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-2">
                           <select 
                             value={o.status} 
                             onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                             className="bg-violet-50 text-violet-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border border-violet-100"
                           >
                             {['Received', 'Processing', 'Printing', 'Shipped', 'Delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleDelete(o.id, 'orders')} className="p-4 rounded-2xl bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl space-y-10">
               <div className="grid md:grid-cols-2 gap-10">
                  <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-8">
                     <div className="flex items-center gap-4"><Globe className="text-violet-600" size={24} /><h3 className="text-2xl font-black text-gray-900 uppercase">Site Content</h3></div>
                     <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Hero Title</label><input type="text" value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black uppercase text-sm outline-none focus:border-violet-400" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Hero Subtitle</label><input type="text" value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black uppercase text-sm outline-none focus:border-violet-400" /></div>
                     </div>
                  </div>
                  <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-8">
                     <div className="flex items-center gap-4"><Bell className="text-pink-600" size={24} /><h3 className="text-2xl font-black text-gray-900 uppercase">Live Notice</h3></div>
                     <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Banner Text</label><input type="text" value={siteSettings.noticeBanner} onChange={e => setSiteSettings({...siteSettings, noticeBanner: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black uppercase text-sm outline-none focus:border-violet-400" /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Show Banner</span><input type="checkbox" checked={siteSettings.showBanner} onChange={e => setSiteSettings({...siteSettings, showBanner: e.target.checked})} className="w-6 h-6 rounded-lg accent-pink-600" /></div>
                     </div>
                  </div>
               </div>
               <button onClick={() => alert("Settings Updated Globally!")} className="bg-gray-900 text-white font-black px-12 py-5 rounded-3xl flex items-center gap-4 hover:bg-violet-600 transition-all uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-gray-100"><Save size={18} /> Update Lab Identity</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Editor */}
        <AnimatePresence>
          {isEditing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-12 md:p-16 rounded-[4rem] border border-gray-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] max-w-2xl w-full relative">
                <button onClick={() => setIsEditing(null)} className="absolute top-10 right-10 text-gray-300 hover:text-gray-900 transition-colors"><X size={28} /></button>
                <div className="flex items-center gap-2 mb-4"><Sparkles size={16} className="text-violet-500" /><span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.4em]">Lab Editor</span></div>
                <h2 className="text-5xl font-black tracking-tighter text-gray-900 leading-[0.85] mb-12">{isEditing === 'new' ? 'Drop' : 'Modify'} <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">the Product.</span></h2>
                <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Title</label><input required type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-black text-lg tracking-tight uppercase" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Price (₹)</label><input required type="text" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-black text-lg tracking-tight" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Tag</label><input required type="text" value={editForm.tag} onChange={e => setEditForm({...editForm, tag: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-black text-lg tracking-tight uppercase" /></div>
                  <div className="space-y-2 col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Image URL</label><input required type="text" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all font-black text-sm" /></div>
                  <div className="col-span-2 flex gap-4 pt-6">
                    <button type="submit" className="flex-1 bg-violet-600 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-3 hover:bg-violet-500 shadow-xl shadow-violet-600/20 transition-all uppercase tracking-widest text-[10px]"><Save size={20} /> COMMIT CHANGES</button>
                    <button type="button" onClick={() => setIsEditing(null)} className="px-10 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
