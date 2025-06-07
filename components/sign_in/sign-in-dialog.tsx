'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SignInPage } from "@/components/sign_in/sign-in"

interface SignInDialogProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignInDialog({ className, children }: SignInDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? children : (
          <Button variant="default" className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 ${className}`}>
            Sign in
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0">
        <DialogTitle className="sr-only">Sign in to your account</DialogTitle>
        <SignInPage />
      </DialogContent>
    </Dialog>
  )
}
