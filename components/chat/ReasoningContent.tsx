import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ReasoningContentProps {
  reasoning: string;
}

export function ReasoningContent({ reasoning }: ReasoningContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-2 ml-8"> {/* Added ml-8 for left margin */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-gray-500 hover:text-gray-700 px-4" // Added px-4 for padding
      >
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider">Reasoning</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </Button>
      {isExpanded && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          {reasoning}
        </div>
      )}
    </div>
  );
}
