"use client"

import { KeyboardEvent } from "react";
import type React from "react"

interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  placeholder?: string
}

export function ChatInput({ value, onChange, onSubmit, placeholder = "Type a message..." }: ChatInputProps) {
  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
    // Shift+Enter will insert a line break naturally in a textarea
  };

  // Auto-resize the textarea based on content
  const handleTextAreaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto"; // Reset height to recalculate
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Set new height with limit
    onChange(e);
  };

  return (
    <div className="w-full py-2 px-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit} className="relative">
          <div className="relative flex items-center">
            <textarea
              value={value}
              onChange={handleTextAreaHeight}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="w-full p-3 sm:p-4 
                bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 
                hover:border-gray-300/50 focus:border-blue-500/50
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 
                rounded-xl sm:rounded-2xl shadow-sm text-sm sm:text-base
                transition-colors resize-none min-h-[50px] max-h-[200px] overflow-y-auto"
            />
            <div className="absolute right-3 bottom-1 text-xs text-gray-400 pointer-events-none">
              {value.length > 0 && "Shift+Enter for new line"}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

