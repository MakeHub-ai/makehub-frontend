import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string
}

export function SearchBar({ placeholder = "Rechercher...", className, ...props }: SearchBarProps) {
  return (
    <div className="flex items-center px-3 py-2">
      <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
      <Input
        type="search"
        placeholder={placeholder}
        className={cn(
          "h-7 border-0 focus:ring-0 text-sm placeholder:text-gray-400 bg-transparent",
          className
        )}
        {...props}
      />
    </div>
  )
}
