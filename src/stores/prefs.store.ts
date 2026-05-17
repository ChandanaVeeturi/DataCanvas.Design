import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface PrefsState {
  decimalPlaces: number
  dateFormat: 'iso' | 'short' | 'long'
  setDecimalPlaces: (n: number) => void
  setDateFormat: (f: PrefsState['dateFormat']) => void
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      decimalPlaces: 2,
      dateFormat: 'iso',
      setDecimalPlaces: (n) => set({ decimalPlaces: n }),
      setDateFormat: (f) => set({ dateFormat: f }),
    }),
    {
      name: 'datacanvas.prefs',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
