/**
 * 🚀 Notification Dashboard - Admin Panel
 * See all notifications, test messages, and manage settings!
 */

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Activity,
  History,
  Plus,
  Trash2,
  Eye,
  X,
  ChevronRight
} from 'lucide-react';
import { notificationEngine, otp, templates } from '../utils/notificationEngine';
import { checkNotificationServiceHealth, fetchNotificationLogs } from '../utils/notifications';
import { getDemoReason, type DemoReason } from '../utils/notificationMode';
import toast from 'react-hot-toast';

type TabType = 'dashboard' | 'send' | 'logs' | 'otp' | 'templates' | 'settings';

export default function NotificationDashboard({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [logs, setLogs] = useState(notificationEngine.getLogs());
  const [stats, setStats] = useState(notificationEngine.getStats());
  const [isDemoMode, setIsDemoMode] = useState(notificationEngine.getDemoMode());
  const [demoReason, setDemoReason] = useState<DemoReason>(getDemoReason());
  const [health, setHealth] = useState<{ status: string; emailConfigured: boolean } | null>(null);

  useEffect(() => {
    setLogs(notificationEngine.getLogs());
    setStats(notificationEngine.getStats());
    checkNotificationServiceHealth().then(setHealth);
    setDemoReason(getDemoReason());
    notificationEngine.refreshDemoMode();
    setIsDemoMode(notificationEngine.getDemoMode());
  }, [activeTab]);

  return (
    <div className={embedded ? 'bg-transparent' : 'min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4'}>
      <div className={embedded ? 'p-4' : 'max-w-6xl mx-auto'}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Engine</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage emails, SMS, OTP, and notifications</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity />} label="Dashboard" />
          <TabButton active={activeTab === 'send'} onClick={() => setActiveTab('send')} icon={<Send />} label="Send Message" />
          <TabButton active={activeTab === 'otp'} onClick={() => setActiveTab('otp')} icon={<Shield />} label="OTP System" />
          <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<Mail />} label="Templates" />
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<History />} label="Logs" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="Settings" />
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-200 font-bold">
                  Demo mode ON
                  {demoReason === 'server_down' && ' — notification server not reachable'}
                  {demoReason === 'email_missing' && ' — Gmail/SMTP not configured in .env.local'}
                  {demoReason === 'manual' && ' — you enabled it in Settings'}
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                  Run <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">npm run dev:all</code>, open{' '}
                  <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">http://localhost:3000</code>, add Gmail App Password to{' '}
                  <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">.env.local</code>, then switch to Real mode in Settings.
                </p>
                {health && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    API health: {health.status} · emailConfigured: {String(health.emailConfigured)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard stats={stats} logs={logs} />}
        {activeTab === 'send' && <SendMessage />}
        {activeTab === 'otp' && <OTPSystem />}
        {activeTab === 'templates' && <Templates />}
        {activeTab === 'logs' && <Logs localLogs={logs} />}
        {activeTab === 'settings' && <Settings onToggleMode={(val) => setIsDemoMode(val)} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${active ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Dashboard({ stats, logs }: { stats: { total: number; last24h: number }; logs: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Total Notifications</h3>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">All time notifications</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Last 24 Hours</h3>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.last24h}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Notifications in last 24h</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-100">Status</h3>
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">System Healthy</p>
          <p className="text-blue-100 text-sm">All systems operational</p>
          <div className="mt-4 flex gap-2">
            <div className="flex items-center gap-2 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full" /> Email Ready
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full" /> SMS Ready
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full" /> OTP Ready
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{logs.length} logs</span>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            logs.slice(0, 10).map((log: any, index: number) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{log.subject || 'Notification'}</p>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3 inline" /> {log.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">To: {log.to}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{log.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SendMessage() {
  const [recipient, setRecipient] = useState('');
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'email' | 'sms' | 'both'>('email');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!recipient) {
      toast.error('Please enter a recipient');
      return;
    }
    if (type !== 'sms' && !subject) {
      toast.error('Please enter a subject');
      return;
    }
    if (!message) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const result = await notificationEngine.send({
        to: recipient,
        subject,
        content: message,
        type,
        fallbackEmail:
          (type === 'sms' || type === 'both') && fallbackEmail.includes('@')
            ? fallbackEmail
            : undefined,
      });
      if (result.success) {
        const detail = result.details?.results?.join(' · ') ?? result.message;
        toast.success(detail);
      } else {
        toast.error(result.message);
      }
      setRecipient('');
      setFallbackEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Send Notification</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Recipient</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="email@example.com or +919876543210"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {(type === 'sms' || type === 'both') && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Fallback email (if SMS fails)
              </label>
              <input
                type="email"
                value={fallbackEmail}
                onChange={(e) => setFallbackEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="email"
                  checked={type === 'email'}
                  onChange={() => setType('email')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="sms"
                  checked={type === 'sms'}
                  onChange={() => setType('sms')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> SMS
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="both"
                  checked={type === 'both'}
                  onChange={() => setType('both')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Both
                </span>
              </label>
            </div>
          </div>

          {type !== 'sms' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Tips</h3>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-400">For emails, enter a valid email address</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-400">For SMS, use format: +919876543210</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-400">Check logs to verify delivery</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-400">Use templates for consistent messaging</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function OTPSystem() {
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('verification');

  const [inputOtp, setInputOtp] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter phone/email');
      return;
    }

    try {
      const { otp: devHint } = await otp.generate(phone, { length: 6, devPanel: true });
      if (notificationEngine.getDemoMode()) {
        toast.success(`Demo OTP (local only): ${devHint}`, { duration: 12000 });
      } else if (devHint) {
        toast.success(`Dev panel OTP (not in API JSON): ${devHint}`, { duration: 12000 });
      } else {
        toast.success('OTP sent — check your email or SMS');
      }
    } catch (err: any) {
      toast.error(`OTP send failed: ${err.message}`);
    }
  };

  const handleVerifyOTP = async () => {
    if (!phone) {
      toast.error('Please enter phone/email');
      return;
    }
    if (!inputOtp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      const verifyResult = await otp.verify(phone, inputOtp);
      setResult(verifyResult);
      if (verifyResult.success) {
        toast.success('OTP Verified!');
      } else {
        toast.error(verifyResult.message);
      }
    } catch (err: any) {
      toast.error(`Verification error: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Send OTP</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Recipient</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="phone or email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="verification">Account Verification</option>
              <option value="login">Login</option>
              <option value="password-reset">Password Reset</option>
              <option value="transaction">Transaction Verification</option>
            </select>
          </div>

          <button
            onClick={handleSendOTP}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Send OTP
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            In real mode, OTP is never returned in API responses. Dev OTP appears only in the toast above.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Verify OTP</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Recipient</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="phone or email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">OTP</label>
            <input
              type="text"
              value={inputOtp}
              onChange={(e) => setInputOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
            />
          </div>

          <button
            onClick={handleVerifyOTP}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Verify OTP
          </button>

          {result && (
            <div className={`p-4 rounded-xl ${result.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <p className={`font-bold ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {result.success ? '✅ Verified!' : '❌ Failed'}
              </p>
              <p className={`text-sm ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Templates() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Available Templates</h3>
        
        <div className="grid gap-4">
          {Object.entries(templates).map(([key, template]: any) => (
            <div key={key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <h4 className="font-bold text-gray-900 dark:text-white capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email Subject: {template.emailSubject}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">SMS: {template.smsContent}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Logs({ localLogs }: { localLogs: any[] }) {
  const [serverLogs, setServerLogs] = useState<any[]>([]);
  const isDemo = notificationEngine.getDemoMode();

  useEffect(() => {
    if (!isDemo) {
      fetchNotificationLogs().then((r) => setServerLogs(r.logs ?? []));
    }
  }, [isDemo]);

  const logs = isDemo
    ? localLogs
    : serverLogs.map((l) => ({
        timestamp: l.timestamp,
        to: l.recipient,
        subject: l.subject || l.channel,
        status: l.status,
        detail: l.detail,
      }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Notification Logs {isDemo ? '(client demo)' : '(server)'}
      </h3>
      
      {logs.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No logs yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Time</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">To</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Subject</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{log.to}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{log.subject || '-'}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Settings({ onToggleMode }: { onToggleMode: (val: boolean) => void }) {
  const [isDemo, setIsDemo] = useState(notificationEngine.getDemoMode());

  const handleToggle = () => {
    const newVal = !isDemo;
    notificationEngine.setDemoMode(newVal);
    setIsDemo(newVal);
    onToggleMode(newVal);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Settings</h3>
      
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">Demo Mode</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDemo 
                ? "Active - Notifications are logged to console & shown as toasts" 
                : "Inactive - Notifications are sent to Node.js backend server"}
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${
              isDemo
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isDemo ? "Switch to Real Mode" : "Switch to Demo Mode"}
          </button>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
          <h4 className="font-bold text-gray-900 dark:text-white">Email Provider</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure Gmail SMTP or other providers</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">See .env.local.example for setup</p>
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
          <h4 className="font-bold text-gray-900 dark:text-white">SMS Provider</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Twilio, Email-to-SMS (Airtel/Jio/VI/BSNL), or Telegram relay (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
          </p>
        </div>
      </div>
    </div>
  );
}
