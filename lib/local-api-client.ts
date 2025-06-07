/**
 * Local API Client for Dashboard Data
 * 
 * This module provides client-side functions to interact with local Next.js API routes
 * for dashboard data instead of the external MakeHub API. It maintains compatibility
 * with the existing dashboard interface while using local Supabase data.
 */

import { UserStats, Wallet, Request as ApiRequest, Transaction } from './supabase-server';
import type { UsageResponse, UsageItem, GraphItem, SavingsDataItem, CostDistributionItem } from '@/types/dashboard';

// Local API endpoints
const LOCAL_API_BASE = '/api';

/**
 * Fetch user statistics from local API
 */
async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch(`${LOCAL_API_BASE}/user/stats`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to fetch user stats: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch user wallet from local API
 */
async function fetchUserWallet(): Promise<Wallet> {
  const response = await fetch(`${LOCAL_API_BASE}/user/wallet`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to fetch wallet: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch user requests from local API
 */
async function fetchUserRequests(page: number = 1, pageSize: number = 20): Promise<{
  data: ApiRequest[];
  pagination: any;
}> {
  const response = await fetch(`${LOCAL_API_BASE}/user/requests?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to fetch requests: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch user transactions from local API
 */
async function fetchUserTransactions(page: number = 1, pageSize: number = 100): Promise<{
  data: Transaction[];
  pagination: any;
}> {
  const response = await fetch(`${LOCAL_API_BASE}/user/transactions?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

/**
 * Transform local API request to UsageItem format
 */
function transformRequestToUsageItem(request: ApiRequest): UsageItem {
  const cost = ((request.input_tokens || 0) * 0.0001 + (request.output_tokens || 0) * 0.0002); // Approximate cost calculation
  
  return {
    id: request.request_id,
    timestamp: request.created_at,
    type: request.status === 'completed' ? 'API Call' : 'Failed Request',
    units: `$${cost.toFixed(4)}`,
    description: `${request.provider}/${request.model}`,
    metadata: {
      transaction_type: 'debit',
      details: {
        model: request.model,
        provider: request.provider,
        input_tokens: request.input_tokens,
        output_tokens: request.output_tokens,
        status: request.status,
        error: request.error_message,
      }
    }
  };
}

/**
 * Generate graph items from requests
 */
function generateGraphItems(requests: ApiRequest[]): GraphItem[] {
  const modelCounts: { [key: string]: number } = {};
  
  requests.forEach(request => {
    if (request.status === 'completed') {
      const key = `${request.provider}/${request.model}`;
      modelCounts[key] = (modelCounts[key] || 0) + 1;
    }
  });

  return Object.entries(modelCounts).map(([model, count], index) => ({
    id: `graph_${index}`,
    model,
    usage_count: count
  }));
}

/**
 * Generate cost distribution from transactions
 */
function generateCostDistribution(transactions: Transaction[]): CostDistributionItem[] {
  const costByDate: { [date: string]: { total: number; models: { [model: string]: number } } } = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0];
    if (!costByDate[date]) {
      costByDate[date] = { total: 0, models: {} };
    }
    costByDate[date].total += Math.abs(transaction.amount);
  });

  return Object.entries(costByDate).map(([date, data]) => ({
    date,
    total_cost: data.total,
    models: data.models
  })).slice(-30); // Last 30 days
}

/**
 * Generate savings data (placeholder implementation)
 */
function generateSavingsData(transactions: Transaction[]): SavingsDataItem[] {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const dayTransactions = transactions.filter(t => 
      new Date(t.created_at).toISOString().split('T')[0] === date
    );
    
    const actualCost = dayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const maxCost = actualCost * 1.3; // Assume 30% savings
    
    return {
      date,
      actual_cost: actualCost,
      max_cost: maxCost,
      savings: maxCost - actualCost,
      count: dayTransactions.length
    };
  });
}

/**
 * Calculate total usage for current month
 */
function calculateMonthlyUsage(transactions: Transaction[]): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.amount < 0; // Only debit transactions
    })
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
}

/**
 * Main function to get user usage data compatible with existing dashboard
 */
export async function getUserUsageLocal(offset: number = 0): Promise<{ data: UsageResponse['data'] }> {
  try {
    
    // Fetch all required data in parallel
    const [userStats, wallet, requestsResponse, transactionsResponse] = await Promise.all([
      fetchUserStats(),
      fetchUserWallet(),
      fetchUserRequests(1, 20 + offset), // Adjust pagination
      fetchUserTransactions(1, 100) // Get more transactions for analysis
    ]);

    // Transform data to match existing format
    const usageItems = requestsResponse.data.map(transformRequestToUsageItem);
    const graphItems = generateGraphItems(requestsResponse.data);
    const costDistribution = generateCostDistribution(transactionsResponse.data);
    const savingsData = generateSavingsData(transactionsResponse.data);
    const monthlyUsage = calculateMonthlyUsage(transactionsResponse.data);

    // Determine plan type
    const isFree = wallet.balance <= 0;
    const currentPlan = isFree ? 'Free Plan' : 'Paid Plan';

    const data: UsageResponse['data'] = {
      object: 'usage_report',
      total_usage: monthlyUsage,
      total_credits: wallet.balance,
      total_requests: userStats.total_requests,
      current_plan: currentPlan,
      is_free_plan: isFree,
      items: usageItems,
      graph_items: graphItems,
      cost_distribution: costDistribution,
      savings_data: savingsData,
      has_more: requestsResponse.pagination.hasNextPage,
      next_offset: requestsResponse.pagination.hasNextPage ? offset + 20 : null,
    };

    return { data };
  } catch (error) {
    throw error;
  }
}
