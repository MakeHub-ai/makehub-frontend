import { DollarSign } from 'lucide-react'

interface CheapestProviderButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function CheapestProviderButton({ isActive, onClick }: CheapestProviderButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-medium 
        transition-colors cursor-pointer
        ${isActive 
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        }
      `}
    >
      <DollarSign className="w-4 h-4 mr-1.5" />
      Cheapest
    </button>
  )
}
