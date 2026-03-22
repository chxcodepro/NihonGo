'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

type ToastVariant = 'default' | 'success' | 'error'

interface ToastMessage {
  id: string
  message: string
  variant: ToastVariant
}

let listeners: Array<(toasts: ToastMessage[]) => void> = []
let toasts: ToastMessage[] = []
let toastCounter = 0

function notify() {
  listeners.forEach((listener) => listener([...toasts]))
}

function toast(message: string, variant: ToastVariant = 'default') {
  const id = String(++toastCounter)
  toasts = [...toasts, { id, message, variant }]
  notify()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }, 3000)
}

function useToastStore() {
  const [state, setState] = React.useState<ToastMessage[]>([])
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])
  return state
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-background text-foreground border',
  success: 'bg-green-600 text-white border-green-700',
  error: 'bg-destructive text-destructive-foreground border-destructive',
}

function Toaster() {
  const activeToasts = useToastStore()

  if (activeToasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'rounded-md px-4 py-3 text-sm shadow-lg animate-in slide-in-from-bottom-2 fade-in-0',
            variantStyles[t.variant]
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

export { Toaster, toast }
