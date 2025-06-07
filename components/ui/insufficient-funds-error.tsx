import { useRouter } from 'next/navigation';
import { CreditCard, Plus } from 'lucide-react';

interface InsufficientFundsErrorProps {
  message?: string;
}

export function InsufficientFundsError({ message = 'You have consumed all your credits. Please reload your balance to continue using our services.' }: InsufficientFundsErrorProps) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white border border-indigo-100 rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-100 rounded-full p-2">
          <CreditCard className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-800">Insufficient Funds</h3>
          <p className="mt-2 text-gray-600">{message}</p>
          <button
            onClick={() => router.push('/reload')}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Credits
          </button>
        </div>
      </div>
    </div>
  );
}
