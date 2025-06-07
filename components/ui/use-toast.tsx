"use client"

import * as React from "react"

export interface ToastProps {
  variant?: 'default' | 'destructive'
  title?: string
  description?: string
  duration?: number
}

interface Toast extends ToastProps {
  id: string
  open: boolean
}

type State = {
  toasts: Toast[]
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 3000

const useToast = () => {
  const [state, setState] = React.useState<State>({
    toasts: [],
  })

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...props,
      id,
      open: true,
    }

    setState((state) => ({
      ...state,
      toasts: [newToast, ...state.toasts].slice(0, TOAST_LIMIT),
    }))

    setTimeout(() => {
      setState((state) => ({
        ...state,
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, props.duration || TOAST_REMOVE_DELAY)

    return {
      id,
      dismiss: () => setState((state) => ({
        ...state,
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
    }
  }, [])

  return {
    toast,
    toasts: state.toasts,
  }
}

export { useToast }
