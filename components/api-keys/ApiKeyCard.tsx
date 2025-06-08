import { KeyIcon, EyeIcon, EyeOffIcon, CopyIcon, TrashIcon, CheckIcon, Loader2Icon } from 'lucide-react';
import type { ApiKey } from '@/types/api-keys';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKeyCardProps {
  apiKey: ApiKey;
  isVisible: boolean;
  isCopied: boolean;
  isDeleting?: boolean;
  onToggleVisibility: (id: string) => void;
  onCopy: (key: string) => void;
  onDelete: (key: string) => void;
}

export function ApiKeyCard({ 
  apiKey, 
  isVisible, 
  isCopied, 
  isDeleting = false,
  onToggleVisibility, 
  onCopy, 
  onDelete 
}: ApiKeyCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatKey = (key: string) => {
    if (!isVisible) return '•'.repeat(Math.min(32, key.length));
    
    // Return the actual key without any formatting/spaces
    return key;
  };

  return (
    <motion.div 
      className="p-6 hover:bg-blue-50/30 transition-colors duration-200"
      layout
      whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
            whileHover={{ scale: 1.05 }}
          >
            <KeyIcon className="h-5 w-5 text-blue-600" />
          </motion.div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{apiKey.name}</h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              <span className="text-xs text-gray-500">
                Created {formatDate(apiKey.created_at)}
              </span>
              <motion.span 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                Active
              </motion.span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <motion.button
            onClick={() => onToggleVisibility(apiKey.id)}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={isVisible ? "Hide API Key" : "Show API Key"}
          >
            {isVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </motion.button>
          <motion.button
            onClick={() => onCopy(apiKey.key)}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Copy API Key"
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 text-green-500" />
            ) : (
              <CopyIcon className="h-5 w-5" />
            )}
          </motion.button>
          <motion.button
            onClick={() => onDelete(apiKey.key)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isDeleting}
            title="Delete API Key"
          >
            {isDeleting ? (
              <Loader2Icon className="h-5 w-5 animate-spin text-red-500" />
            ) : (
              <TrashIcon className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
      <div className="mt-4">
        <div className="relative">
          <motion.div 
            className={`relative flex items-center p-3 text-sm font-mono bg-gray-50 rounded-lg border ${isVisible ? 'border-blue-200' : 'border-gray-200'} transition-all duration-200 overflow-x-auto`}
            animate={{ 
              backgroundColor: isVisible ? 'rgba(239, 246, 255, 0.7)' : 'rgba(249, 250, 251, 0.7)'
            }}
          >
            <code className={`flex-1 ${isVisible ? 'text-blue-800' : 'text-gray-500'} break-all`}>
              {formatKey(apiKey.key)}
            </code>
            
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent animate-pulse-slow"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {apiKey.last_used 
              ? `Last used: ${formatDate(apiKey.last_used)}`
              : 'Never used'}
          </p>
          {!isVisible && (
            <motion.button
              onClick={() => onToggleVisibility(apiKey.id)}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              whileHover={{ scale: 1.05 }}
            >
              Show key
            </motion.button>
          )}
        </div>
      </div>

      {/* Section for API Key Statistics */}
      {(apiKey.total_cost !== undefined || apiKey.total_requests !== undefined) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Usage & Cost</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-xs">
            <div className="flex flex-col">
              <span className="text-gray-500">Total Cost:</span>
              <span className="font-medium text-gray-800">
                ${(apiKey.total_cost ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Total Requests:</span>
              <span className="font-medium text-gray-800">
                {apiKey.total_requests ?? 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Avg Input Tokens:</span>
              <span className="font-medium text-gray-800">
                {apiKey.avg_input_tokens?.toFixed(0) ?? '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Avg Output Tokens:</span>
              <span className="font-medium text-gray-800">
                {apiKey.avg_output_tokens?.toFixed(0) ?? '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">First Request:</span>
              <span className="font-medium text-gray-800">
                {apiKey.first_request ? formatDate(apiKey.first_request) : '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Last Request (from stats):</span> 
              {/* This 'last_request' comes from the stats query based on 'requests' table.
                  'apiKey.last_used' comes directly from 'api_keys' table. They might differ slightly
                  if the trigger for 'last_used_at' has a delay or if stats are for completed requests only.
              */}
              <span className="font-medium text-gray-800">
                {apiKey.last_request ? formatDate(apiKey.last_request) : '-'}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
