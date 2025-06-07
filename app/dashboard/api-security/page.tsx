'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { KeyIcon, PlusIcon, Shield, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiKeyCard } from '@/components/api-keys/ApiKeyCard';
import { NewKeyForm } from '@/components/api-keys/NewKeyForm';
import { listApiKeys, createApiKey, deleteApiKey } from '@/lib/makehub-client';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiKey } from '@/types/api-keys';

export default function ApiSecurityPage() {
  const { session, loading } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadApiKeys() {
      if (loading) return;
      if (!session) {
        setApiKeys([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await listApiKeys(session);
        setApiKeys(response.data);
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load API keys',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadApiKeys();
  }, [session, loading, toast]);

  const handleCreateKey = async (name: string) => {
    if (!session) return;

    try {
      const response = await createApiKey(session, name);
      setApiKeys(prev => [...prev, response.data]);
      setShowNewKeyForm(false);
      
      setVisibleKeys(prev => ({
        ...prev,
        [response.data.id]: true
      }));
      
      toast({
        title: 'API Key Created',
        description: 'Your new key has been created successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast({
        title: 'Error Creating Key',
        description: error instanceof Error ? error.message : 'Failed to create API key',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!session) return;

    try {
      setDeletingKey(key);
      await deleteApiKey(session, key);
      setApiKeys(prev => prev.filter(k => k.key !== key));
      toast({
        title: 'API Key Deleted',
        description: 'Your API key has been deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast({
        title: 'Error Deleting Key',
        description: error instanceof Error ? error.message : 'Failed to delete API key',
        variant: 'destructive',
      });
    } finally {
      setDeletingKey(null);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast({
      title: 'Copied to Clipboard',
      description: 'API key copied to clipboard',
      duration: 2000,
    });
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="animate-spin inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-blue-600 font-medium animate-pulse">Loading API keys...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              API Keys & Security
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your API keys and monitor security settings for your account.
            </p>
          </div>
          <motion.button
            onClick={() => setShowNewKeyForm(prev => !prev)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {showNewKeyForm ? 'Cancel' : 'New API Key'}
          </motion.button>
        </motion.div>

        {/* Security Alert */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Security Notice:</strong> Keep your API keys secure and never share them publicly. 
              Rotate keys regularly and monitor usage for any suspicious activity.
            </AlertDescription>
          </Alert>
        </motion.div>

        <motion.div 
          className="grid gap-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y
: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence>
            {showNewKeyForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <NewKeyForm 
                  onCancel={() => setShowNewKeyForm(false)} 
                  onCreate={handleCreateKey} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden border-gray-200 shadow-md rounded-xl">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-900 flex items-center gap-2">
                  <KeyIcon className="h-4 w-4 text-blue-600" />
                  Your API Keys
                </h3>
                {apiKeys.length > 0 && !isLoading && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {apiKeys.length} {apiKeys.length === 1 ? 'Key' : 'Keys'}
                  </span>
                )}
              </div>
              
              <AnimatePresence>
                {isLoading ? (
                  <motion.div 
                    className="p-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-3"></div>
                    <p className="text-sm text-gray-500">Loading your API keys...</p>
                  </motion.div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {apiKeys.map((key) => (
                        <motion.div
                          key={key.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring" }}
                          layout
                        >
                          <ApiKeyCard
                            apiKey={key}
                            isVisible={visibleKeys[key.id] || false}
                            isCopied={copiedKey === key.key}
                            isDeleting={deletingKey === key.key}
                            onToggleVisibility={toggleKeyVisibility}
                            onCopy={handleCopyKey}
                            onDelete={handleDeleteKey}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {apiKeys.length === 0 && (
                      <motion.div 
                        className="px-6 py-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="inline-flex p-3 rounded-full
bg-blue-50 mb-4">
                          <KeyIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <p className="text-gray-500 mb-4">
                          You haven't created any API keys yet.
                        </p>
                        <button
                          onClick={() => setShowNewKeyForm(true)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-1.5" />
                          Create your first API key
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}