"use client"

import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 w-full max-w-[420px] p-4">
      {toasts.map(({ id, title, description, variant = "default" }) => (
        <div
          key={id}
          className={cn(
            "flex flex-col gap-1 rounded-md border p-4 pointer-events-auto animate-in slide-in-from-top-2",
            {
              "bg-white text-slate-950 border-slate-200": variant === "default",
              "bg-red-600 text-white border-red-500": variant === "destructive",
            }
          )}
        >
          {title && <div className="font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      ))}
    </div>
  )
}
