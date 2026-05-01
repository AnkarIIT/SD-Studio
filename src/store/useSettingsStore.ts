import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  noticeBanner: string;
  showBanner: boolean;
  contactEmail: string;
  instagramUrl: string;
}

interface SettingsState {
  settings: SiteSettings;
  loading: boolean;
  setSettings: (settings: Partial<SiteSettings>) => void;
  fetchSettings: () => Promise<void>;
  saveSettings: (settings: SiteSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        heroTitle: 'SD Studios Lab',
        heroSubtitle: 'Professional 3D Manufacturing',
        noticeBanner: 'New Drop Incoming! Check the Collection 🧬',
        showBanner: true,
        contactEmail: 'lab@sdstudios.com',
        instagramUrl: 'https://instagram.com/sdstudios'
      },
      loading: true,

      setSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),

      fetchSettings: async () => {
        set({ loading: true });
        try {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            set({ settings: docSnap.data() as SiteSettings });
          } else {
            // Initialize if not exists
            await setDoc(docRef, get().settings);
          }
        } catch (err) {
          console.error("Failed to fetch site settings", err);
        } finally {
          set({ loading: false });
        }
      },

      saveSettings: async (newSettings) => {
        try {
          const docRef = doc(db, 'settings', 'global');
          await setDoc(docRef, newSettings);
          set({ settings: newSettings });
        } catch (err) {
          console.error("Failed to save site settings", err);
          throw err;
        }
      }
    }),
    {
      name: 'sd-studios-settings'
    }
  )
);

// Listen for real-time updates across all tabs/users
export const subscribeToSettings = () => {
  const docRef = doc(db, 'settings', 'global');
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      useSettingsStore.getState().setSettings(doc.data() as SiteSettings);
    }
  });
};
