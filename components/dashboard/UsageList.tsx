'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import type { UsageTransaction, UsageTransactionsPaginated, UsageTransactionsResponse } from '@/types/dashboard';
import { AnimatePresence } from 'framer-motion';
import { Search, Timer, Code2, Filter, DownloadIcon, CreditCard, ChevronRight } from 'lucide-react';
import { TokenBreakdown } from './TokenBreakdown';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';

interface UsageListProps {
  initialUsage: UsageTransactionsPaginated;
}

interface SessionGroup {
  id: string;
  startTime: Date;
  endTime: Date;
  transactions: UsageTransaction[];
  totalCost: number;
  models: Set<string>;
}

type FormatDetailsFunction = (item: UsageTransaction) => string;
type FormatCreditsFunction = (amount: number) => string;

interface TransactionItemProps {
  transaction: UsageTransaction;
  formatDetails: FormatDetailsFunction;
  formatCredits: FormatCreditsFunction;
}

interface SessionGroupProps {
  group: SessionGroup;
  isExpanded: boolean;
  onToggle: () => void;
  formatCredits: FormatCreditsFunction;
  formatDetails: FormatDetailsFunction;
  isCurrentSession?: boolean;
}


const TransactionItem: FC<TransactionItemProps> = ({
  transaction,
  formatDetails,
  formatCredits,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div
      className="group"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/50 hover:shadow-sm transition-all duration-150 ease-out">
        {/* Icon */}
        <div className="flex-shrink-0">
          {transaction.transaction_type === 'credit' ? (
            <div className="p-1.5 bg-emerald-50 rounded-md border border-emerald-100 transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm group-hover:rotate-[2deg] group-hover:bg-gradient-to-br group-hover:from-emerald-50 group-hover:to-green-50">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
            </div>
          ) : (
            <div className="p-1.5 bg-blue-50 rounded-md border border-blue-100 transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm group-hover:rotate-[-2deg] group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-indigo-50">
              <Timer className="h-3.5 w-3.5 text-blue-600 transition-transform duration-200 group-hover:scale-110" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-medium text-gray-900 truncate">
              {formatDetails(transaction)}
            </p>
            <span className={`text-sm font-medium tabular-nums ${
              transaction.transaction_type === 'debit'
                ? 'text-blue-600'
                : 'text-emerald-600'
            }`}>
              {transaction.transaction_type === 'credit' ? '+' : '-'}
              {formatCredits(transaction.amount)}
            </span>
          </div>
          <p className="text-[11px] text-gray-500">
            {format(new Date(transaction.timestamp), 'p')}
          </p>
        </div>
      </div>

      {/* Token Breakdown - Display for API calls with token data */}
      {transaction.type === 'api_call' && transaction.metadata.input_tokens && transaction.metadata.output_tokens && (
        <div className="ml-9">
          <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <span className="font-medium">Input:</span> {transaction.metadata.input_tokens?.toLocaleString()} tokens
              <span className="mx-2">•</span>
              <span className="font-medium">Output:</span> {transaction.metadata.output_tokens?.toLocaleString()} tokens
              {transaction.metadata.cached_tokens && transaction.metadata.cached_tokens > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <span className="font-medium">Cached:</span> {transaction.metadata.cached_tokens.toLocaleString()} tokens
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SessionGroup: FC<SessionGroupProps> = React.memo(({ 
  group, 
  isExpanded, 
  onToggle, 
  formatCredits,
  formatDetails,
  isCurrentSession = false
}) => {
  return (
    <div className={`
      ${isCurrentSession ? 'bg-blue-50/30 border-l-4 border-blue-200 rounded-r-lg' : ''}
      transition-all duration-200
    `}>
      <div
        className={`
          px-4 py-3 cursor-pointer 
          ${isCurrentSession 
            ? 'hover:bg-blue-50/50' 
            : 'hover:bg-gradient-to-r from-indigo-50/40 via-blue-50/30 to-transparent'} 
          hover:shadow-sm group transition-all duration-200 ease-out
        `}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-blue-100 transition-all duration-200 group-hover:scale-110 group-hover:rotate-[-2deg] group-hover:shadow-sm">
              <Code2 className="h-4 w-4 text-blue-600 transition-colors duration-200 group-hover:text-indigo-500" />
            </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {format(group.startTime, 'MMMM d')}
                    <span className="text-gray-500 ml-2">
                      {format(group.startTime, 'p')}
                    </span>
                  </p>
                  {isCurrentSession && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-full border border-blue-200">
                      Current Session
                    </span>
                  )}
                </div>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-blue-600">
                {formatCredits(group.totalCost)}
              </p>
              <p className="text-[11px] text-gray-500">
                {group.transactions.length} requests
              </p>
            </div>
            <ChevronRight 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`mx-4 mb-4 transform transition-all duration-200 ${isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          <div className="mt-2 bg-blue-50/20 rounded-lg border border-blue-100/70">
            <div className="py-3 space-y-1 px-4">
              {group.transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  formatDetails={formatDetails}
                  formatCredits={formatCredits}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SessionGroup.displayName = 'SessionGroup';

const LoadingState: FC = () => (
  <div className="px-6 py-12 text-center">
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-indigo-600 border-indigo-300">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-100 scale-150 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-gray-700">Loading transactions</p>
        <p className="text-xs text-gray-500">This may take a moment...</p>
      </div>
    </div>
  </div>
);

const EmptyState: FC<{ searchTerm: string; onClear: () => void }> = ({ searchTerm, onClear }) => (
  <div className="px-6 py-12 text-center">
    <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center transform transition-transform hover:scale-110 hover:rotate-[-3deg]">
      <Search className="h-8 w-8 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-700">No transactions found</p>
    <p className="text-xs text-gray-500 mt-1">
      {searchTerm ? 'Try adjusting your search term' : 'Your transaction history will appear here'}
    </p>
    {searchTerm && (
      <button
        onClick={onClear}
        className="mt-4 px-3 py-1 text-xs bg-white rounded-md border border-gray-200 text-blue-600 
          transition-all duration-200 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm 
          hover:scale-[1.02] active:scale-[0.98]"
      >
        Clear search
      </button>
    )}
  </div>
);

export const UsageList: FC<UsageListProps> = ({ initialUsage }) => {
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paginatedData, setPaginatedData] = useState(initialUsage);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const formatDetails = useCallback((item: UsageTransaction): string => {
    if (!item.metadata.model) {
      return item.description;
    }

    return item.description;
  }, []);

  const formatCredits = useCallback((amount: number): string => {
    const value = Math.abs(amount);
    
    if (value === 0) return "0.00 $";
    
    if (value < 0.0001) {
      return `${value.toExponential(2)} $`;
    }
    
    if (value < 0.01) {
      return `${value.toFixed(6)} $`;
    }
    
    return `${value.toFixed(4)} $`;
  }, []);

  const isInCurrentSession = useCallback((timestamp: string): boolean => {
  const now = new Date();
  const transactionTime = new Date(timestamp);
  const diffInMinutes = differenceInMinutes(now, transactionTime);
  return diffInMinutes <= 60; // Consider transactions within the last hour as current session
}, []);

const groupTransactions = useCallback((transactions: UsageTransaction[]): SessionGroup[] => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const groups: SessionGroup[] = [];
    let currentGroup: SessionGroup | null = null;

    sortedTransactions.forEach((transaction) => {
      const transactionTime = new Date(transaction.timestamp);
      
      if (!currentGroup) {
        currentGroup = {
          id: transaction.id,
          startTime: transactionTime,
          endTime: transactionTime,
          transactions: [transaction],
          totalCost: transaction.amount,
          models: new Set(transaction.metadata.model ? [transaction.metadata.model] : [])
        };
      } else {
        const timeDiff = differenceInMinutes(transactionTime, currentGroup.endTime);
        
        if (timeDiff <= 60) {
          currentGroup.endTime = transactionTime;
          currentGroup.transactions.push(transaction);
          currentGroup.totalCost += transaction.amount;
          if (transaction.metadata.model) {
            currentGroup.models.add(transaction.metadata.model);
          }
        } else {
          groups.push(currentGroup);
          currentGroup = {
            id: transaction.id,
            startTime: transactionTime,
            endTime: transactionTime,
            transactions: [transaction],
            totalCost: transaction.amount,
            models: new Set(transaction.metadata.model ? [transaction.metadata.model] : [])
          };
        }
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, []);

  const filteredTransactions = useMemo(() => {
    return paginatedData.items.filter((item: UsageTransaction) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const details = formatDetails(item).toLowerCase();
      const type = item.type.toLowerCase();
      
      return details.includes(searchLower) || type.includes(searchLower);
    });
  }, [paginatedData.items, searchTerm, formatDetails]);

  const sessionGroups = useMemo(() => {
    const groups = groupTransactions(filteredTransactions);
    return groups.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [filteredTransactions, groupTransactions]);

  const handlePageChange = useCallback(async (direction: 'prev' | 'next') => {
    if (!session) return;

    const currentPage = paginatedData.pagination.currentPage;
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;

    if (direction === 'prev' && currentPage === 1) return;
    if (direction === 'next' && !paginatedData.pagination.hasNextPage) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/usage-transactions?page=${newPage}&pageSize=20`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UsageTransactionsResponse = await response.json();
      setPaginatedData({
        items: data.data,
        pagination: data.pagination,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, paginatedData.pagination.currentPage, paginatedData.pagination.hasNextPage]);

  const toggleExpand = useCallback((id: string) => {
    if (expandedItem === id) {
      // Just close if clicking the same item
      setExpandedItem(null);
    } else {
      // First close current item, then open new one after transition
      setExpandedItem(null);
      setTimeout(() => {
        setExpandedItem(id);
      }, 150); // Match the CSS transition duration
    }
  }, [expandedItem]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-opacity duration-200">
      <div className="p-4 bg-gradient-to-r from-gray-50/80 via-white to-white border-b border-gray-100 shadow-[0_1px_1px_rgba(0,0,0,0.01)] flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-md">
            <Timer className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-700">Usage History</h3>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full h-8 pl-8 pr-3 text-sm bg-white border border-gray-200 rounded-md 
                transition-all duration-200 ease-out
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none 
                hover:border-gray-300"
            />
            <Search 
              className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2 transition-colors duration-200" 
              style={{ 
                color: searchTerm ? '#3b82f6' : 'currentColor'
              }}
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState />
          ) : sessionGroups.length > 0 ? (
            <div className="py-2">
              {sessionGroups.map((group) => {
                const isCurrentSession = isInCurrentSession(group.startTime.toISOString());
                return (
                  <SessionGroup
                    key={group.id}
                    group={group}
                    isExpanded={expandedItem === group.id}
                    onToggle={() => toggleExpand(group.id)}
                    formatCredits={formatCredits}
                    formatDetails={formatDetails}
                    isCurrentSession={isCurrentSession}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState 
              searchTerm={searchTerm} 
              onClear={() => setSearchTerm('')}
            />
          )}
        </AnimatePresence>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Page {paginatedData.pagination.currentPage} of {paginatedData.pagination.totalPages} 
            ({paginatedData.pagination.totalItems} total transactions)
          </span>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange('prev')}
              disabled={paginatedData.pagination.currentPage === 1 || isLoading}
              className={`px-3 py-1 text-xs bg-white rounded-md border border-gray-200 text-gray-600 transition-all duration-200
                ${paginatedData.pagination.currentPage === 1 || isLoading ? 
                  'opacity-50 cursor-not-allowed' : 
                  'hover:border-blue-300 hover:text-blue-600 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange('next')}
              disabled={!paginatedData.pagination.hasNextPage || isLoading}
              className={`px-3 py-1 text-xs bg-white rounded-md border border-gray-200 text-gray-600 transition-all duration-200
                ${!paginatedData.pagination.hasNextPage || isLoading ? 
                  'opacity-50 cursor-not-allowed' : 
                  'hover:border-blue-300 hover:text-blue-600 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
