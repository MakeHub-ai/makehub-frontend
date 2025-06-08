'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { KeyIcon, PlusIcon, KeyRoundIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiKeyCard } from '@/components/api-keys/ApiKeyCard';
import { NewKeyForm } from '@/components/api-keys/NewKeyForm';
import { ProtectedRoute } from '@/components/auth/protected-route';
// import { listApiKeys, createApiKey, deleteApiKey } from '@/lib/makehub-client'; // Replaced with fetch
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiKey } from '@/types/api-keys';

export default function ApiKeysPage() {
  const { session, loading } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [keyStats, setKeyStats] = useState<Record<string, Partial<ApiKey>>>({});

  useEffect(() => {
    console.log('🔍 Auth state check:', {
      loading,
      hasSession: !!session,
      userId: session?.user?.id
    });

    async function loadApiKeys() {
      if (loading) {
        console.log('⌛ Auth still loading...');
        return;
      }

      if (!session) {
        console.log('🚫 No active session');
        setApiKeys([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('📥 Fetching API keys for user:', session.user.id);
        
        // const response = await listApiKeys(session);
        const res = await fetch('/api/api-keys');
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to fetch API keys' }));
          throw new Error(errorData.error || res.statusText);
        }
        const fetchedKeys: any[] = await res.json();
        
        // The server now returns keys with: id, api_key_name, api_key (full), created_at, last_used_at, is_active
        const mappedKeys: ApiKey[] = fetchedKeys.map(k => ({
          id: k.id,
          name: k.api_key_name, // Map from api_key_name to name
          key: k.api_key || '',  // Use the full api_key from server
          created_at: k.created_at,
          last_used: k.last_used_at || undefined, // Map from last_used_at to last_used (optional)
          user_id: session!.user.id,
          // is_active is not in types/api-keys.ts::ApiKey, so omit it from this typed object.
          // If ApiKeyCard needs it, it should be added to the type or handled by the card.
        }));

        console.log('✅ API keys fetched:', {
          count: mappedKeys.length,
          keys: mappedKeys.map(k => ({ id: k.id, name: k.name, preview: k.key }))
        });
        
        setApiKeys(mappedKeys);

        // After fetching API keys, fetch their stats
        if (mappedKeys.length > 0) {
          try {
            console.log('📊 Fetching API key stats...');
            const statsRes = await fetch('/api/api-key-stats');
            if (!statsRes.ok) {
              const errorData = await statsRes.json().catch(() => ({ message: 'Failed to fetch API key stats' }));
              throw new Error(errorData.error || statsRes.statusText);
            }
            const fetchedStats: any[] = await statsRes.json();
            
            const statsMap: Record<string, Partial<ApiKey>> = {};
            fetchedStats.forEach(stat => {
              // The RPC function returns 'api_key_id' which is the 'id' of the ApiKey
              if (stat.api_key_id) { 
                statsMap[stat.api_key_id] = {
                  total_requests: stat.total_requests,
                  total_input_tokens: stat.total_input_tokens,
                  total_output_tokens: stat.total_output_tokens,
                  total_cached_tokens: stat.total_cached_tokens,
                  input_cost_total: stat.input_cost_total,
                  output_cost_total: stat.output_cost_total,
                  cached_cost_total: stat.cached_cost_total,
                  total_cost: stat.total_cost,
                  first_request: stat.first_request,
                  last_request: stat.last_request,
                  avg_input_tokens: stat.avg_input_tokens,
                  avg_output_tokens: stat.avg_output_tokens,
                };
              }
            });
            setKeyStats(statsMap);
            console.log('📈 API key stats fetched and mapped:', statsMap);

            // Merge stats into apiKeys
            setApiKeys(prevApiKeys => 
              prevApiKeys.map(apiKey => ({
                ...apiKey,
                ...(statsMap[apiKey.id] || {}),
              }))
            );

          } catch (statsError) {
            console.error('❌ Failed to fetch API key stats:', statsError);
            // Optionally, show a toast for stats fetching error, but don't block keys display
            toast({
              title: 'Warning',
              description: statsError instanceof Error ? statsError.message : 'Could not load usage statistics for API keys.',
              variant: 'default', // Use a less intrusive variant
            });
          }
        }

      } catch (error) {
        console.error('❌ Failed to fetch API keys:', error);
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

  const handleCreateKey = async (apiKeyName: string) => {
    if (!session) return;

    try {
      // const response = await createApiKey(session, name);
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key_name: apiKeyName }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to create API key' }));
        throw new Error(errorData.error || res.statusText);
      }
      const newKeyData: any = await res.json();

      const createdKey: ApiKey = {
        id: newKeyData.id,
        name: newKeyData.api_key_name,
        key: newKeyData.api_key, // Full key is returned on create
        created_at: newKeyData.created_at,
        last_used: undefined, // Corrected field name, undefined as it's optional and not returned
        // is_active: newKeyData.is_active, // is_active is not in types/api-keys.ts's ApiKey
        user_id: session!.user.id, // Add user_id
      };
      
      setApiKeys(prev => [...prev, createdKey]);
      setShowNewKeyForm(false);
      
      // Add to visible keys automatically when created
      setVisibleKeys(prev => ({
        ...prev,
        [createdKey.id]: true
      }));
      
      toast({
        title: 'API Key Created',
        description: 'Your new key has been created successfully. You can copy it now.',
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

  const handleDeleteKey = async (keyId: string) => {
    if (!session) return;

    try {
      setDeletingKey(keyId);
      // await deleteApiKey(session, keyId);
      const res = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to delete API key' }));
        throw new Error(errorData.error || res.statusText);
      }

      setApiKeys(prev => prev.filter(k => k.id !== keyId));
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
      <div className="flex flex-col items-center justify-center min-h-screen pt-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="animate-spin inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-blue-600 font-medium animate-pulse">Loading your API keys...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <KeyRoundIcon className="h-6 w-6 text-blue-600" />
              API Keys
            </h1>
            <p className="mt-2 text-gray-600">
              Create and manage API keys for authenticating your applications.
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

        <motion.div 
          className="grid gap-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
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
                            isCopied={copiedKey === key.key} // This will compare with preview if not just created
                            isDeleting={deletingKey === key.id} // Compare with ID
                            onToggleVisibility={toggleKeyVisibility}
                            onCopy={handleCopyKey} // This will copy preview if not just created
                            onDelete={() => handleDeleteKey(key.id)} // Pass ID
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
                        <div className="inline-flex p-3 rounded-full bg-blue-50 mb-4">
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
      </motion.div>
    </ProtectedRoute>
  );
}
