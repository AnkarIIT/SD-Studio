import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  ShoppingBag,
  CreditCard,
  Bell,
  LogOut,
  Layers,
  ExternalLink,
  RefreshCw,
  Truck,
  Package,
  BarChart3,
  FlaskConical,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationDashboard from '../components/NotificationDashboard';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '../utils/adminAuth';
import { useSiteSettings } from '../utils/siteSettings';
import {
  fetchAdminSummary,
  fetchAdminOrders,
  fetchPaymentQueue,
  approvePaymentQueue,
  advanceOrderTimeline,
  fetchAdminAnalytics,
  fetchAdminProducts,
  patchAdminProduct,
  fetchAdminSiteConfig,
  saveAdminSiteConfig,
  fetchAdminCustomLab,
  fetchAdminNewsletter,
  patchCustomLabStatus,
  type AdminSummary,
  type StoreAnalytics,
} from '../utils/adminApi';
import { getDefaultSiteSettings } from '../utils/siteSettings';
import OrderTimeline from '../components/OrderTimeline';
import type { Product } from '../types';
import { checkNotificationServiceHealth } from '../utils/notifications';
import { formatOrderId, formatPrice, formatDateTime } from '../utils/formatting';
import type { Order } from '../types';
import { BRAND_NAME } from '../brand';

type AdminTab =
  | 'overview'
  | 'site'
  | 'products'
  | 'orders'
  | 'payments'
  | 'analytics'
  | 'customLab'
  | 'newsletter'
  | 'notifications';

type AdminProduct = Product & { adminHidden?: boolean };

export default function AdminPage() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<AdminTab>('overview');
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<Array<{ id: string; orderId: string; method: string; reference?: string; amount: number; status: string }>>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [customLabRequests, setCustomLabRequests] = useState<
    Array<{ requestId: string; name: string; email: string; details: string; status: string; createdAt: string }>
  >([]);
  const [newsletterSubs, setNewsletterSubs] = useState<Array<{ email: string; createdAt: string }>>([]);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const settings = useSiteSettings();
  const update = useSiteSettings((s) => s.update);
  const reset = useSiteSettings((s) => s.reset);

  const loadData = async () => {
    setLoading(true);
    setAnalyticsError(null);
    const [s, o, q, h, a, p, lab, subs] = await Promise.all([
      fetchAdminSummary(),
      fetchAdminOrders(),
      fetchPaymentQueue('pending'),
      checkNotificationServiceHealth(),
      tab === 'analytics' || tab === 'overview' ? fetchAdminAnalytics() : Promise.resolve(null),
      tab === 'products' || tab === 'overview' ? fetchAdminProducts() : Promise.resolve({ products: [] }),
      tab === 'customLab' ? fetchAdminCustomLab() : Promise.resolve({ requests: [] }),
      tab === 'newsletter' ? fetchAdminNewsletter() : Promise.resolve({ subscribers: [] }),
    ]);
    setSummary(s);
    setOrders(o);
    setQueue(q);
    setHealth(h as Record<string, unknown> | null);
    if (tab === 'analytics' && !a) setAnalyticsError('Could not load analytics — check API key and database');
    setAnalytics(a);
    setAdminProducts((p.products ?? []) as AdminProduct[]);
    setCustomLabRequests(lab.requests ?? []);
    setNewsletterSubs(subs.subscribers ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchAdminSiteConfig().then((config) => {
      if (config) update(config);
    });
  }, [authed, update]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, tab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setAuthed(true);
      toast.success('Welcome to admin');
    } else {
      toast.error('Invalid password');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-white">{BRAND_NAME} Admin</h1>
              <p className="text-xs text-zinc-500">Store control panel</p>
            </div>
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-primary"
              placeholder="Admin password"
            />
          </label>
          <button type="submit" className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90">
            Sign in
          </button>
          <Link to="/" className="block text-center text-xs text-zinc-500 hover:text-primary">
            ← Back to shop
          </Link>
        </form>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'site', label: 'Site settings', icon: Settings },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'customLab', label: 'Custom Lab', icon: FlaskConical },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex">
      <aside className="w-56 bg-zinc-900 text-white flex flex-col border-r border-zinc-800 shrink-0">
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-bold">
            <Layers className="w-5 h-5 text-primary" />
            Admin
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === id ? 'bg-primary text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800 space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white">
            <ExternalLink className="w-3.5 h-3.5" /> View shop
          </a>
          <a href="http://localhost:5001/api/health" target="_blank" rel="noreferrer" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white">
            <ExternalLink className="w-3.5 h-3.5" /> API health
          </a>
          <button
            type="button"
            onClick={() => { logoutAdmin(); setAuthed(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white capitalize">{tab.replace('-', ' ')}</h2>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <div className="p-6 max-w-6xl">
          {tab === 'overview' && (
            <div className="space-y-6">
              {summary && summary.databaseConnected === false && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-200">
                  Database not connected — run <code className="px-1">npm run db:push</code> and check{' '}
                  <code className="px-1">DATABASE_URL</code> in <code className="px-1">.env.local</code>.
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Orders', value: summary?.orders ?? '—' },
                  { label: 'Pending payments', value: summary?.pendingVerifications ?? '—' },
                  { label: 'Newsletter', value: summary?.newsletterSubscribers ?? '—' },
                  { label: 'Custom Lab', value: summary?.customLabRequests ?? '—' },
                ].map((c) => (
                  <div key={c.label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{c.label}</p>
                    <p className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <h3 className="font-bold mb-3 text-zinc-900 dark:text-white">API status</h3>
                <pre className="text-xs text-zinc-600 dark:text-zinc-400 overflow-auto">{JSON.stringify(health, null, 2)}</pre>
              </div>
            </div>
          )}

          {tab === 'site' && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 max-w-xl">
              <label className="block">
                <span className="text-xs font-bold uppercase text-zinc-500">Top promo bar</span>
                <input
                  value={settings.promoBarText}
                  onChange={(e) => update({ promoBarText: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm dark:bg-zinc-800"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase text-zinc-500">Free shipping threshold (₹)</span>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => update({ freeShippingThreshold: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm dark:bg-zinc-800"
                />
              </label>
              <div className="space-y-3">
                {[
                  { key: 'maintenanceMode' as const, label: 'Maintenance mode (hide shop)' },
                  { key: 'codEnabled' as const, label: 'Cash on delivery enabled' },
                  { key: 'customLabEnabled' as const, label: 'Custom Lab section visible' },
                  { key: 'newsletterEnabled' as const, label: 'Newsletter section visible' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => update({ [key]: e.target.checked })}
                      className="rounded border-zinc-400"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <label className="block">
                <span className="text-xs font-bold uppercase text-zinc-500">Hero slide 1 title</span>
                <input
                  value={settings.heroSlides[0]?.title ?? ''}
                  onChange={(e) => {
                    const slides = [...settings.heroSlides];
                    slides[0] = { ...slides[0], title: e.target.value };
                    update({ heroSlides: slides });
                  }}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const saved = await saveAdminSiteConfig(settings);
                      if (saved) update(saved);
                      toast.success('Saved to server — live for all shoppers');
                    } catch (e: unknown) {
                      toast.error(e instanceof Error ? e.message : 'Save failed');
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg"
                >
                  Save to server
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Reset site settings to defaults on the server?')) return;
                    try {
                      const defaults = getDefaultSiteSettings();
                      const saved = await saveAdminSiteConfig(defaults);
                      reset();
                      if (saved) update(saved);
                      toast.success('Defaults restored on server');
                    } catch (e: unknown) {
                      toast.error(e instanceof Error ? e.message : 'Reset failed');
                    }
                  }}
                  className="px-4 py-2 border text-sm rounded-lg dark:border-zinc-700"
                >
                  Reset defaults
                </button>
              </div>
              <p className="text-xs text-zinc-500">Settings sync to database — storefront loads them on each visit.</p>
            </div>
          )}

          {tab === 'products' && (
            <div className="space-y-4">
              {adminProducts.length === 0 ? (
                <p className="text-sm text-zinc-500">No products loaded.</p>
              ) : (
                adminProducts.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.category} · ID {product.id}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-end">
                      <label className="text-xs">
                        Price ₹
                        <input type="number" defaultValue={product.price} id={`price-${product.id}`} className="block mt-1 w-24 rounded border px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700" />
                      </label>
                      <label className="text-xs">
                        Stock
                        <input type="number" defaultValue={product.stock ?? 0} id={`stock-${product.id}`} className="block mt-1 w-20 rounded border px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700" />
                      </label>
                      <label className="text-xs flex items-center gap-1 pb-1">
                        <input type="checkbox" defaultChecked={Boolean((product as AdminProduct).adminHidden)} id={`hidden-${product.id}`} />
                        Hide
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          const price = Number((document.getElementById(`price-${product.id}`) as HTMLInputElement).value);
                          const stock = Number((document.getElementById(`stock-${product.id}`) as HTMLInputElement).value);
                          const hidden = (document.getElementById(`hidden-${product.id}`) as HTMLInputElement).checked;
                          const res = await patchAdminProduct(product.id, { price, stock, inStock: stock > 0, hidden });
                          if (res.success) {
                            toast.success('Product updated');
                            setAdminProducts(res.products);
                          } else toast.error(res.error);
                        }}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'analytics' && !analytics && !loading && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border p-8 text-center text-sm text-zinc-500">
              <p>{analyticsError ?? 'No analytics data yet.'}</p>
              <button type="button" onClick={loadData} className="mt-4 text-primary font-semibold hover:underline">
                Retry
              </button>
            </div>
          )}

          {tab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5">
                  <p className="text-xs text-zinc-500 uppercase">Revenue</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(analytics.revenue)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5">
                  <p className="text-xs text-zinc-500 uppercase">Paid orders</p>
                  <p className="text-2xl font-bold">{analytics.paidOrders}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5">
                  <p className="text-xs text-zinc-500 uppercase">Avg order</p>
                  <p className="text-2xl font-bold">{formatPrice(analytics.avgOrderValue)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5">
                  <p className="text-xs text-zinc-500 uppercase">Total orders</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5">
                <h3 className="font-bold mb-4">Last 7 days</h3>
                <div className="space-y-2">
                  {analytics.last7Days.map((day) => (
                    <div key={day.date} className="flex justify-between text-sm">
                      <span className="text-zinc-500">{day.date}</span>
                      <span>{day.orders} orders · {formatPrice(day.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-zinc-500 text-sm">No orders in database yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex flex-wrap justify-between gap-2 mb-3">
                      <div>
                        <p className="font-bold">{formatOrderId(order.id)}</p>
                        <p className="text-xs text-zinc-500">{formatDateTime(order.createdAt)} · {order.shippingAddress.email}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{formatPrice(order.total)} · {order.status}</span>
                    </div>
                    <OrderTimeline orderId={order.id} admin />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['production_started', 'shipped', 'delivered'].map((stage) => (
                        <button
                          key={stage}
                          type="button"
                          onClick={async () => {
                            const res = await advanceOrderTimeline(order.id, stage);
                            if (res.success) {
                              toast.success(`Advanced to ${stage}`);
                              loadData();
                            } else toast.error(res.error);
                          }}
                          className="text-xs px-3 py-1.5 border rounded-lg dark:border-zinc-700 hover:border-primary inline-flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          {stage.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'payments' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                In development, payments may auto-verify when <code>AUTO_VERIFY_PAYMENTS</code> is not set to{' '}
                <code>false</code>. Set <code>AUTO_VERIFY_PAYMENTS=false</code> in <code>.env.local</code> to test the queue.
              </p>
              {queue.length === 0 ? (
                <p className="text-zinc-500 text-sm">No pending payment verifications.</p>
              ) : (
                queue.map((entry) => (
                  <div key={entry.id} className="bg-white dark:bg-zinc-900 rounded-xl border p-5 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="font-bold">{formatOrderId(entry.orderId)}</p>
                      <p className="text-xs text-zinc-500">{entry.method} · {entry.reference ?? 'no ref'} · {formatPrice(entry.amount)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await approvePaymentQueue(entry.id);
                        if (res.success) { toast.success('Approved'); loadData(); }
                        else toast.error(res.error);
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg"
                    >
                      Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'customLab' && (
            <div className="space-y-4">
              {customLabRequests.length === 0 ? (
                <p className="text-sm text-zinc-500">No custom lab requests yet.</p>
              ) : (
                customLabRequests.map((req) => (
                  <div key={req.requestId} className="bg-white dark:bg-zinc-900 rounded-xl border p-5">
                    <div className="flex flex-wrap justify-between gap-2 mb-2">
                      <p className="font-bold">{req.requestId}</p>
                      <span className="text-xs uppercase text-zinc-500">{req.status}</span>
                    </div>
                    <p className="text-sm">{req.name} · {req.email}</p>
                    <p className="text-xs text-zinc-500 mt-2">{req.details}</p>
                    <div className="flex gap-2 mt-3">
                      {['reviewing', 'quoted', 'completed'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={async () => {
                            const res = await patchCustomLabStatus(req.requestId, status);
                            if (res.success) {
                              toast.success(`Marked ${status}`);
                              loadData();
                            } else toast.error(res.error);
                          }}
                          className="text-xs px-2 py-1 border rounded dark:border-zinc-700"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'newsletter' && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border overflow-hidden">
              {newsletterSubs.length === 0 ? (
                <p className="p-6 text-sm text-zinc-500">No subscribers yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletterSubs.map((sub) => (
                      <tr key={sub.email} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="p-4">{sub.email}</td>
                        <td className="p-4 text-zinc-500">{formatDateTime(sub.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <NotificationDashboard embedded />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}