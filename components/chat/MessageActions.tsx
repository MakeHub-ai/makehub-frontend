import { Pencil, Copy, Square, ThumbsUp, ThumbsDown, Share2, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface MessageActionsProps {
  content: string;
}

export function MessageActions({ content }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      {/* Keep it */}
      {/* <Button variant="ghost" size="icon" className="h-8 w-8">
        <Pencil className="h-4 w-4" />
      </Button> */}
      {/* <Button variant="ghost" size="icon" className="h-8 w-8">
        <Square className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ThumbsDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <RotateCcw className="h-4 w-4" />
      </Button> */}
    </div>
  )
}

