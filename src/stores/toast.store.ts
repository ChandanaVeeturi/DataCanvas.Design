import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  kind: ToastKind
  message: string
  description?: string
  duration: number
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ duration = 3500, ...rest }) => {
    const id = crypto.randomUUID()
    const toast: Toast = { id, duration, ...rest }
    set((s) => ({ toasts: [...s.toasts, toast] }))
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Convenience helpers — call from anywhere. */
export const toast = {
  success: (message: string, description?: string) =>
    useToastStore.getState().push({ kind: 'success', message, description }),
  error: (message: string, description?: string) =>
    useToastStore.getState().push({ kind: 'error', message, description, duration: 6000 }),
  info: (message: string, description?: string) =>
    useToastStore.getState().push({ kind: 'info', message, description }),
}
