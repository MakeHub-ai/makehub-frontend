import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { KeyRoundIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';

interface NewKeyFormProps {
  onCancel: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function NewKeyForm({ onCancel, onCreate }: NewKeyFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name for your API key');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      await onCreate(name);
      setName('');
    } catch (err) {
      setError('Failed to create API key. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
    >
      <Card className="p-6 mb-6 border border-blue-200 shadow-lg bg-white overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-blue-50">
            <KeyRoundIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-medium">Create New API Key</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
              API Key Name
            </label>
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <input
                type="text"
                id="keyName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className={`block w-full rounded-lg border ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                placeholder="e.g., Production API Key"
                required
                disabled={isSubmitting}
                autoFocus
              />
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="mt-1 flex items-center text-red-500 text-sm"
                >
                  <AlertCircleIcon className="h-4 w-4 mr-1" />
                  {error}
                </motion.div>
              )}
            </motion.div>
            <p className="mt-2 text-xs text-gray-500">
              Give your API key a descriptive name to help you identify where it's being used
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <motion.button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center min-w-[100px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Key'
              )}
            </motion.button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
