import { Zap } from 'lucide-react'

interface FastestProviderButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function FastestProviderButton({ isActive, onClick }: FastestProviderButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-medium 
        transition-colors cursor-pointer
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        }
      `}
    >
      <Zap className="w-4 h-4 mr-1.5" />
      Fastest
    </button>
  )
}
