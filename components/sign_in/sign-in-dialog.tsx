'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SignInForm } from "@/components/sign_in/sign-in"

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
      <DialogContent className="sm:max-w-[450px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Sign in to your account</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        <SignInForm />
      </DialogContent>
    </Dialog>
  )
}
