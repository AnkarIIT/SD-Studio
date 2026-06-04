import toast from 'react-hot-toast';
import { checkNotificationServiceHealth } from './notifications';

export type DemoReason = 'server_down' | 'email_missing' | 'manual' | null;

const KEYS = {
  demo: 'notification_demo_mode',
  reason: 'notification_demo_reason',
  manual: 'notification_demo_manual',
} as const;

function persistDemo(demo: boolean, reason: DemoReason) {
  localStorage.setItem(KEYS.demo, demo ? 'true' : 'false');
  if (reason) localStorage.setItem(KEYS.reason, reason);
  else localStorage.removeItem(KEYS.reason);
}

export function isDemoModeActive(): boolean {
  return localStorage.getItem(KEYS.demo) !== 'false';
}

export function getDemoReason(): DemoReason {
  const r = localStorage.getItem(KEYS.reason);
  if (r === 'server_down' || r === 'email_missing' || r === 'manual') return r;
  return null;
}

export function setManualDemoMode(demo: boolean) {
  localStorage.setItem(KEYS.manual, 'true');
  persistDemo(demo, 'manual');
}

/** Run once on app load — applies strict demo policy from approved plan */
export async function initNotificationMode(): Promise<{ demo: boolean; reason: DemoReason }> {
  const isManual = localStorage.getItem(KEYS.manual) === 'true';
  const prevReason = getDemoReason();

  try {
    const health = await checkNotificationServiceHealth();

    if (health.status === 'unavailable') {
      if (!isManual) persistDemo(true, 'server_down');
      return { demo: isManual ? isDemoModeActive() : true, reason: isManual ? 'manual' : 'server_down' };
    }

    if (!health.emailConfigured) {
      if (!isManual) persistDemo(true, 'email_missing');
      return {
        demo: isManual ? isDemoModeActive() : true,
        reason: isManual ? 'manual' : 'email_missing',
      };
    }

    // Server up + email configured
    if (isManual) {
      return { demo: isDemoModeActive(), reason: 'manual' };
    }

    if (prevReason === 'server_down' || prevReason === 'email_missing') {
      toast.success('Real notifications enabled — emails will be sent via Gmail SMTP');
    }
    persistDemo(false, null);
    return { demo: false, reason: null };
  } catch {
    if (!isManual) persistDemo(true, 'server_down');
    return { demo: isManual ? isDemoModeActive() : true, reason: isManual ? 'manual' : 'server_down' };
  }
}