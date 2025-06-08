/**
 * MakeHub API Client
 * 
 * This module provides client-side functions to interact with the MakeHub backend API.
 * It includes functions for user authentication, chat completions, usage statistics, 
 * API key management, and other platform features.
 * 
 * The client handles authentication, error handling, and data formatting to provide
 * a consistent interface for all API interactions across the application.
 */

import { Session } from '@supabase/supabase-js'
import { StreamMetrics, calculateMetrics } from './metrics-utils';
import { checkForInsufficientFunds, createInsufficientFundsError } from './error-utils';
import type { UsageResponse } from '@/types/dashboard';
import type { ApiKeyResponse, CreateApiKeyResponse } from '@/types/api-keys';
import type { ModelsResponse, Model } from '@/types/models';

// API configuration - base URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL
console.log('🌍 API_URL configured as:', API_URL);

if (!API_URL) {
  console.error('❌ API_URL is not configured! Check your .env file');
}

// Common type definitions used across API functions
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  provider?: string;
  min_throughput?: number | "best";
  max_latency?: number;
}

export interface ProviderInfo {
  provider: string;
  model: string;
  provider_model_id: string;
  price_per_input_token: number;
  price_per_output_token: number;
  throughput: number;
  latency: number;
}

// ------------------------------ MODELS PAGE FUNCTIONS and SIDEPARAM ------------------------------

/**
 * fetchModels - Retrieves all available AI models
 * Used by: Models page, Model Selector, Model Carousel
 * 
 * This function fetches the complete list of models available in the platform.
 * 
 * @returns Promise<ModelsResponse> - Array of available models or error
 */
export async function fetchModels(): Promise<ModelsResponse> {
  try {
    const response = await fetch(`${API_URL}/v1/models?details_provider=true`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data: data.data || [] };
  } catch (error) {
    console.error('Error fetching models:', error);
    return { data: [], error: 'Failed to fetch models' };
  }
}

export interface FilteredModelInfo {
  model: string;
  provider: string;
  context: number;
  latency: number;
  throughput: number;
  price_per_input_token: number;
  price_per_output_token: number;
}

export interface ModelFilter {
  model_id: string;
  min_throughput?: number | "best";
  max_latency?: number;
}

/**
 * fetchFilteredModels - Retrieves models filtered by performance criteria
 * Used by: Chat page for provider selection
 * 
 * This function finds the optimal model providers based on throughput and latency requirements.
 * 
 * @param params - Filter criteria including model ID, throughput, and latency
 * @param session - The authenticated user session
 * @returns Promise with array of filtered model providers
 * @throws Error if authentication is missing or API request fails
 */
export async function fetchFilteredModels(params: ModelFilter, session: Session | null) {
  console.log('Fetching filtered models with params:', params, {
    hasSession: !!session,
    hasAccessToken: !!session?.access_token
  });
  
  if (!session?.access_token) {
    console.error('No access token available');
    throw new Error('Authentication required');
  }
  
  const queryParams = new URLSearchParams();
  if (params.model_id) queryParams.append('model_id', params.model_id);
  if (params.min_throughput) queryParams.append('min_throughput', params.min_throughput.toString());
  if (params.max_latency) queryParams.append('max_latency', params.max_latency.toString());

  try {
    const response = await fetch(`${API_URL}/v1/models/filter?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Filtered models request failed:', error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data: FilteredModelInfo[] = await response.json();
    console.log('Filtered models response:', data);
    return { data };
  } catch (error) {
    console.error('Error fetching filtered models:', error);
    throw error;
  }
}

// ------------------------------ DASHBOARD PAGE FUNCTIONS ------------------------------

/**
 * getUserUsage - Fetches the user's usage statistics
 * Used by: Dashboard page
 * 
 * This function retrieves a user's platform usage including:
 * - Credit balance
 * - Total usage
 * - Usage history with detailed transactions
 * 
 * @param session - The authenticated user session
 * @param offset - Pagination offset for transaction history
 * @returns Promise<UsageResponse> - Usage data response
 * @throws Error if authentication is missing or API request fails
 */
export async function getUserUsage(session: Session | null, offset: number = 0): Promise<UsageResponse> {
  console.log('Fetching user usage data:', { hasSession: !!session, offset });

  // Check for valid authentication
  if (!session?.access_token) {
    console.error('No access token available');
    throw new Error('Authentication required');
  }

  try {
    // Fetch usage data from the API
    const response = await fetch(`${API_URL}/api/v1/user/usage?offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    // Handle API errors
    if (!response.ok) {
      const error = await response.json();
      console.error('Usage data fetch failed:', error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Parse and return the successful response
    const data: UsageResponse = await response.json();
    console.log('Usage data received:', data);
    if (!data.data) {
      console.error('No usage data found in response:', data);
      throw new Error('No usage data available');
    }

    return data;
  } catch (error) {
    console.error('Error fetching usage data:', error);
    throw error;
  }
}

// ------------------------------ CHAT PAGE FUNCTIONS ------------------------------

/**
 * createChatCompletion - Creates a non-streaming chat completion
 * Used by: Chat page (for non-streaming requests)
 * 
 * This function sends a request to the API to generate a chat completion
 * based on the provided messages and model parameters. It supports model-specific
 * parameters and routing constraints like throughput and latency.
 * 
 * @param params - ChatCompletionRequest with model, messages, and routing parameters
 * @returns Promise with the API response containing the completion
 * @throws Error for insufficient funds or other API errors
 */
export async function createChatCompletion(params: ChatCompletionRequest) {
  try {
    // Send the chat completion request
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('api_key')}`,
      },
      body: JSON.stringify({
        ...params,
        extra_params: {
          provider: params.provider,
          min_throughput: params.min_throughput,
          max_latency: params.max_latency
        }
      }),
    });

    // Special handling for insufficient funds error (402 status code)
    const { isInsufficientFunds, error } = await checkForInsufficientFunds(response);
    if (isInsufficientFunds) {
      throw createInsufficientFundsError(error?.error?.message || 'Insufficient funds');
    }

    // Handle other API errors
    if (!response.ok) {
      const errorData = error || await response.json();
      throw new Error(errorData.message || errorData.error?.message || 'API request failed');
    }

    // Return the successful response
    return await response.json();
  } catch (error) {
    console.error('Chat completion error:', error);
    throw error;
  }
}

/**
 * generateConversationTitle - Creates a title for a chat conversation
 * Used by: Chat page (for naming new conversations)
 * 
 * This function uses AI to generate a relevant title for a conversation
 * based on its content.
 * 
 * @param session - The authenticated user session
 * @param conversation - Array of chat messages in the conversation
 * @returns Promise<string> - The generated title
 * @throws Error if authentication is missing or API request fails
 */
export async function generateConversationTitle(
  session: Session | null,
  conversation: { role: string, content: string }[]
): Promise<string> {
  console.log('Generating title for conversation:', {
    hasSession: !!session,
    conversationPreview: conversation[0]?.content?.substring(0, 20) + '...'
  });

  // Validate authentication
  if (!session?.access_token) {
    console.error('No access token available');
    throw new Error('Authentication required');
  }

  try {
    // Make the API request
    const response = await fetch(`${API_URL}/v1/conversation/title`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    // Handle API errors
    if (!response.ok) {
      const error = await response.json();
      console.error('Title generation failed:', error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // The API returns the title as plain text
    const title = await response.text();
    console.log('Generated title:', title);
    return title;
  } catch (error) {
    // Log and rethrow errors
    console.error('Error generating conversation title:', error);
    throw error;
  }
}

/**
 * createStreamingChat - Creates a streaming chat completion with real-time metrics
 * Used by: Chat page (for streaming chat interface)
 * 
 * This function handles streaming API responses and provides callbacks for:
 * - Content updates as they arrive
 * - Real-time performance metrics (latency, throughput)
 * - Error handling
 * - Stream completion notification
 * 
 * @param params - ChatCompletionRequest parameters
 * @param onContent - Callback for content chunks
 * @param onError - Callback for error handling
 * @param onComplete - Callback for stream completion
 * @param onMetrics - Callback for performance metrics updates
 * @param session - The authenticated user session
 */
export async function createStreamingChat(
  params: ChatCompletionRequest,
  onContent: (content: string) => void,
  onError: (error: any) => void,
  onComplete: () => void,
  onMetrics: (metrics: any) => void,
  session: Session | null
) {
  console.log('Creating streaming chat with session:', {
    hasSession: !!session,
    hasAccessToken: !!session?.access_token,
    params
  });

  // Initialize metrics tracking
  const metrics = calculateMetrics.initializeMetrics(params.model);
  console.log('Initialized metrics:', metrics);
  let lastChunkTime = Date.now();
  
  try {
    // Validate authentication
    if (!session?.access_token) {
      console.error('No access token available. Session:', session);
      throw new Error('No access token available');
    }

    // Initiate the streaming request
    console.log('Making streaming request to:', `${API_URL}/v1/chat/completions`);
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        ...params,
        stream: true,
      }),
    });

    console.log('Received response status:', response.status);
    
    // Handle insufficient funds error immediately (402 status)
    if (response.status === 402) {
      console.error('402 Payment Required status detected');
      throw createInsufficientFundsError('Insufficient funds');
    }

    // Handle other error status codes
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Set up stream processing
    const reader = response.body?.getReader();
    console.log('Reader obtained:', !!reader);
    const decoder = new TextDecoder();
    let buffer = '';

    if (!reader) {
      console.error('No response body available');
      throw new Error('No response body');
    }

    try {
      // Process the stream one chunk at a time
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('Stream completed');
          break;
        }

        // Decode the chunk and add to buffer
        const currentTime = Date.now();
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk size:', chunk.length);
        buffer += chunk;
        
        // Process complete lines in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === '') continue;

          // Check for stream completion
          if (trimmedLine === 'data: [DONE]') {
            console.log('Received DONE signal');
            onComplete();
            return;
          }

          // Process SSE data lines
          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                const content = data.choices[0].delta.content;
                console.log('Processing content chunk:', {
                  size: content.length,
                  preview: content.slice(0, 20) + '...'
                });

                // Send content to the callback
                onContent(content);

                // Update performance metrics
                const chunkTokens = content.split(/\s+/).length;
                metrics.outputTokenCount += chunkTokens; // Changed from tokenCount
                
                // Calculate throughput for this chunk
                const timeDiff = currentTime - lastChunkTime;
                if (timeDiff > 0) {
                  const chunkThroughput = (chunkTokens / timeDiff) * 1000;
                  metrics.throughput.push(chunkThroughput);
                  console.log('Calculated throughput:', {
                    tokens: chunkTokens,
                    timeDiff,
                    throughput: chunkThroughput
                  });
                }

                // Record first response latency (time to first token)
                if (!metrics.latency && metrics.startTime) {
                  metrics.latency = currentTime - metrics.startTime;
                  console.log('First response latency:', metrics.latency);
                }

                // Update timestamp for next chunk
                lastChunkTime = currentTime;
                onMetrics(metrics);
              }
            } catch (e) {
              console.warn('Error parsing SSE message:', e, 'Line:', trimmedLine);
            }
          }
        }
      }
    } finally {
      // Clean up resources
      console.log('Cleaning up reader');
      reader.releaseLock();
    }
  } catch (error) {
    // Handle errors and send to callback
    console.error('Streaming chat error:', error);
    onError(error);
  }
}

// ------------------------------ API KEYS PAGE FUNCTIONS ------------------------------

/**
 * listApiKeys - Retrieves all API keys for the current user
 * Used by: API Keys page
 * 
 * This function fetches the list of API keys created by the user.
 * Each key includes metadata like creation date and name.
 * 
 * @param session - The authenticated user session
 * @returns Promise<ApiKeyResponse> - Array of API keys
 * @throws Error if authentication is missing or API request fails
 */
export async function listApiKeys(session: Session): Promise<ApiKeyResponse> {
  const requestId = `req_${Date.now()}`;
  const endpoint = `${API_URL}/v1/api-keys`;
  
  console.log(`[${requestId}] 🔑 API Request Details:`, {
    endpoint,
    hasSession: !!session,
    userId: session?.user?.id,
    token: session?.access_token?.substring(0, 10) + '...',
  });
  
  // Validate authentication
  if (!session?.access_token) {
    console.error(`[${requestId}] ❌ No access token available`);
    throw new Error('Authentication required');
  }

  try {
    // Make the API request
    console.log(`[${requestId}] 📡 Making API request to:`, endpoint);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      // Add these options to help with CORS
      credentials: 'include',
      mode: 'cors',
    });

    console.log(`[${requestId}] 📥 Response received:`, {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    });

    // Parse the response
    const rawData = await response.json();
    console.log(`[${requestId}] 📦 Raw response data:`, rawData);
    
    // Handle API errors
    if (!response.ok) {
      console.error(`[${requestId}] ❌ API request failed:`, {
        status: response.status,
        error: rawData
      });
      throw new Error(rawData.message || `HTTP error! status: ${response.status}`);
    }

    // Format the response
    const data = Array.isArray(rawData) ? rawData : [];
    console.log(`[${requestId}] ✅ API keys processed:`, {
      count: data.length,
      keys: data.map(k => ({ id: k.id, name: k.name }))
    });
    
    return { data };
  } catch (error) {
    // Log and rethrow errors
    console.error(`[${requestId}] 🚨 Request failed:`, {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * createApiKey - Creates a new API key for the current user
 * Used by: API Keys page
 * 
 * This function generates a new API key with the specified name.
 * 
 * @param session - The authenticated user session
 * @param name - The display name for the new API key
 * @returns Promise<CreateApiKeyResponse> - The newly created API key
 * @throws Error if authentication is missing or API request fails
 */
export async function createApiKey(session: Session, name: string): Promise<CreateApiKeyResponse> {
  const requestId = `req_${Date.now()}`;
  console.log(`[${requestId}] 🔑 Creating new API key:`, {
    name,
    userId: session?.user?.id
  });

  // Validate authentication
  if (!session?.access_token) {
    throw new Error('Authentication required');
  }

  try {
    // Make the API request
    const response = await fetch(`${API_URL}/v1/api-keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      body: JSON.stringify({ name })
    });

    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      console.error(`[${requestId}] ❌ API key creation failed:`, data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // Log success and return the data
    console.log(`[${requestId}] ✅ API key created successfully`, {
      keyId: data.id,
      keyName: data.name
    });
    
    return { data };
  } catch (error) {
    // Log and rethrow errors
    console.error(`[${requestId}] 🚨 Error creating API key:`, error);
    throw error;
  }
}

/**
 * deleteApiKey - Deletes an existing API key
 * Used by: API Keys page
 * 
 * This function removes an API key from the user's account.
 * 
 * @param session - The authenticated user session
 * @param apiKey - The API key to delete
 * @returns Promise<void>
 * @throws Error if authentication is missing or API request fails
 */
export async function deleteApiKey(session: Session, apiKey: string): Promise<void> {
  console.log('Deleting API key:', { apiKey });

  // Validate authentication
  if (!session?.access_token) {
    console.error('No access token available');
    throw new Error('Authentication required');
  }

  try {
    // Make the API request
    const response = await fetch(`${API_URL}/v1/api-keys/${apiKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    // Handle API errors
    if (!response.ok) {
      const error = await response.json();
      console.error('API key deletion failed:', error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    console.log('API key deleted successfully');
  } catch (error) {
    // Log and rethrow errors
    console.error('Error deleting API key:', error);
    throw error;
  }
}
