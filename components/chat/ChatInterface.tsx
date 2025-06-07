"use client"

import { useState, useEffect, useRef } from "react"
import { createStreamingChat, generateConversationTitle, fetchFilteredModels, FilteredModelInfo } from "@/lib/makehub-client" // Updated import
import type React from "react"
import { ChatInput } from "./ChatInput"
import { ChatMessages } from "./ChatMessages"
import { useAuth } from '@/contexts/auth-context'
import { StreamMetrics, calculateMetrics } from '@/lib/metrics-utils'
import { Conversation } from '@/types/chat'
import { ChatStorage } from '@/lib/chat-storage'
import { EmptyChatUI } from "./EmptyChatUI"
import { createNewChat } from "@/lib/chat-utils"
import { SignInDialog } from "@/components/sign_in/sign-in-dialog"
import { isInsufficientFundsError, createInsufficientFundsError } from '@/lib/error-utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  selectedModel: string;
  minThroughput?: number | "best";
  maxLatency?: number;
  onMetricsUpdate?: (metrics: StreamMetrics) => void;
  currentConversation?: Conversation | null;
  onSelectChat: (conversation: Conversation) => void; // Add this prop
  providerButtons?: React.ReactNode;
}

export function ChatInterface({ 
  selectedModel, 
  minThroughput, 
  maxLatency, 
  onMetricsUpdate,
  currentConversation,
  onSelectChat, // Add this prop
  providerButtons,
}: ChatInterfaceProps) {
  const { session } = useAuth();
  
  // Add new state for provider info
  const [currentProviderInfo, setCurrentProviderInfo] = useState<FilteredModelInfo | null>(null);
  // Add state for error handling
  const [chatError, setChatError] = useState<Error | null>(null);

  // Add authentication check at the top level
  if (!session) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Welcome to Chat</h2>
          <p className="text-gray-600">Please log in to start chatting</p>
          <SignInDialog className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700" />
        </div>
      </div>
    );
  }

  console.log('ChatInterface initialized with:', {
    selectedModel,
    minThroughput,
    maxLatency,
    hasSession: !!session
  });

  // Add session state logging
  useEffect(() => {
    console.log('Auth session state:', {
      isAuthenticated: !!session,
      hasAccessToken: !!session?.access_token,
      user: session?.user?.email
    });
  }, [session]);

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [metrics, setMetrics] = useState<StreamMetrics>();

  // DEBUG: Monitor conversation changes
  useEffect(() => {
    console.log('ChatInterface conversation update:', {
      conversationId: currentConversation?.id,
      messageCount: currentConversation?.messages?.length,
      loadedMessages: messages.length
    });
  }, [currentConversation, messages]);

  // Fix: Use useRef instead of React.useRef
  const isTitleUpdateInProgress = useRef(false);

  // Reset state when conversation changes
  useEffect(() => {
    console.log('Conversation changed, resetting state with:', {
      conversationId: currentConversation?.id,
      messageCount: currentConversation?.messages?.length
    });
    
    setInput('');
    
    // Important: Always reset the messages state based on the current conversation
    if (currentConversation) {
      // Use currentConversation.messages directly instead of keeping potential stale messages
      setMessages([...(currentConversation.messages || [])]);
    } else {
      // If no conversation is selected, clear messages
      setMessages([]);
    }
  }, [currentConversation?.id]); // Fix: Only depend on the ID, not the entire object

  // Sync messages with storage only when they actually change
  useEffect(() => {
    if (currentConversation?.id && messages.length > 0) {
      console.log('Syncing messages to storage:', {
        conversationId: currentConversation.id,
        messageCount: messages.length
      });
      
      // Fix: Skip storage update if title update is in progress
      if (isTitleUpdateInProgress.current) return;
      
      const updatedConversation = {
        ...currentConversation,
        messages: [...messages] // Create new array reference
      };
      ChatStorage.saveConversation(updatedConversation);
    }
  }, [messages, currentConversation?.id]);

  // Use useEffect to handle metrics updates
  useEffect(() => {
    if (metrics) {
      onMetricsUpdate?.(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  // Track the actual model being used (from props or conversation)
  const effectiveModel = currentConversation?.model || selectedModel;

  // Replace updateMetricsWithProviderInfo with this simpler version
  const updateMetrics = (currentMetrics: StreamMetrics) => {
    if (currentProviderInfo) {
      const updatedMetrics = {
        ...currentMetrics,
        provider: currentProviderInfo.provider,
        totalCost: calculateMetrics.calculateTotalCost(
          currentMetrics.inputTokenCount,
          currentMetrics.outputTokenCount,
          currentProviderInfo.price_per_input_token,
          currentProviderInfo.price_per_output_token
        )
      };
      
      onMetricsUpdate?.(updatedMetrics);
      setMetrics(updatedMetrics);
    }
  };

  // Fetch provider info once when parameters change - Update to use effectiveModel
  useEffect(() => {
    const fetchProviderInfo = async () => {
      if (!session) {
        console.log('Skipping provider info fetch - no session available');
        return;
      }

      try {
        const { data } = await fetchFilteredModels({
          model_id: effectiveModel, // Use effectiveModel instead of selectedModel
          min_throughput: minThroughput,
          max_latency: maxLatency
        }, session); // Pass the session here

        if (data && data.length > 0) {
          setCurrentProviderInfo(data[0]);
        }
      } catch (error) {
        console.error('Error fetching provider info:', error);
      }
    };

    fetchProviderInfo();
  }, [effectiveModel, minThroughput, maxLatency, session]); // Add session to the dependency array

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any previous errors
    setChatError(null);
    
    if (!session?.access_token) {
      console.error('No auth session available');
      return;
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      console.log('Empty input, skipping submission');
      return;
    }

    // Calculate initial metrics with input tokens
    const initialMetrics = calculateMetrics.initializeMetrics(selectedModel);
    initialMetrics.inputTokenCount = calculateMetrics.countTokens(trimmedInput);
    setMetrics(initialMetrics);

    let activeConversation = currentConversation;
    let currentMessages = messages;
    
    // Better way to determine if this is the first message of a conversation:
    // A conversation is new if it has no messages or only has the current message we're adding
    let isNewConversation = !activeConversation || 
                         (activeConversation.messages.length === 0) ||
                         (activeConversation.messages.length === 1 && 
                          activeConversation.messages[0].content === trimmedInput);

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // If no active conversation, create one with the initial message
    if (!activeConversation) {
      console.log('Creating new chat for first message:', trimmedInput);
      const newChat = createNewChat(trimmedInput, effectiveModel); // Use effectiveModel
      ChatStorage.saveConversation(newChat);
      activeConversation = newChat;
      currentMessages = newChat.messages;
      onSelectChat(newChat);
    } else {
      // Add message to existing conversation
      const userMessage = {
        id: `user-${messageId}`,
        role: 'user' as const,
        content: trimmedInput
      };
      currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
    }

    // Generate a title for the conversation if this is the first message
    if (isNewConversation) {
      try {
        console.log('Generating title for new conversation with first message:', 
                    trimmedInput.substring(0, 30) + '...');
        
        const conversationToSend = [{
          role: 'user',
          content: trimmedInput
        }];
        
        // Fix: Set the ref before title generation
        isTitleUpdateInProgress.current = true;
        
        // Fire and forget - don't await this, so we don't delay the chat response
        generateConversationTitle(session, conversationToSend)
          .then(title => {
            if (title && activeConversation) {
              console.log('Setting generated title:', title);
              // Update title in storage
              ChatStorage.updateConversationTitle(activeConversation.id, title);
              
              // Update the active conversation object with new title
              const updatedConversation = {
                ...activeConversation,
                title
              };
              
              // Reset ref after updating
              isTitleUpdateInProgress.current = false;
              
              // Notify parent component about the title change
              onSelectChat(updatedConversation);
            }
          })
          .catch(err => {
            console.error('Failed to generate title:', err);
            // Reset ref on error
            isTitleUpdateInProgress.current = false;
            // Title generation failed, but chat continues with default title
          });
      } catch (error) {
        console.error('Error in title generation:', error);
        // Reset ref on error
        isTitleUpdateInProgress.current = false;
        // We don't want title generation errors to block the chat
      }
    }

    setInput('');

    // Save to storage
    if (activeConversation) {
      ChatStorage.updateConversationMessages(activeConversation.id, currentMessages);
    }

    // Create message content string for metrics before streaming starts
    const messageContent = currentMessages.map(msg => msg.content).join(' ');

    // Continue with chat streaming...
    try {
      // Start streaming with all messages including the new one
      await createStreamingChat(
        {
          model: effectiveModel, // Use effectiveModel instead of selectedModel
          messages: currentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          min_throughput: minThroughput,
          max_latency: maxLatency,
        },
        (content) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              // Update existing assistant message
              const updatedMessages: Message[] = [...prev.slice(0, -1), {
                ...lastMessage,
                content: lastMessage.content + content
              }];
              if (activeConversation) {
                ChatStorage.updateConversationMessages(activeConversation.id, updatedMessages);
              }
              return updatedMessages;
            } else {
              // Create new assistant message with the same messageId scope
              const newMessage: Message = {
                id: `assistant-${messageId}`, // Now messageId is accessible
                role: 'assistant',
                content
              };
              const updatedMessages: Message[] = [...prev, newMessage];
              if (activeConversation) {
                ChatStorage.updateConversationMessages(activeConversation.id, updatedMessages);
              }
              return updatedMessages;
            }
          });
        },
        (error) => {
          console.error('Chat error:', error);
          
          // Store the error in state so we can display it in the UI
          setChatError(error);
          
          // Check if it's an insufficient funds error specifically
          if (isInsufficientFundsError(error)) {
            // Don't append an error message - the ChatMessages component will handle it
            console.log('Insufficient funds error detected:', error.message);
          } else {
            // For other errors, append an error message
            setMessages(prev => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                role: 'assistant' as const,
                content: 'Sorry, there was an error processing your request.'
              }
            ]);
          }
        },
        () => {
          console.log('Chat completed');
        },
        (updatedMetrics) => {
          // Preserve the input token count we calculated
          updateMetrics({
            ...updatedMetrics,
            inputTokenCount: initialMetrics.inputTokenCount
          });
        },
        session
      );

    } catch (error) {
      console.error('Failed to process request:', {
        error,
        model: effectiveModel, // Use effectiveModel
        messageCount: messages.length
      });
      
      // Store the error in state
      setChatError(error as Error);
      
      // Check if it's an insufficient funds error
      if (error instanceof Error && isInsufficientFundsError(error)) {
        console.log('Caught insufficient funds error:', error.message);
        // Don't append error message - ChatMessages will handle it
      } else {
        // Append generic error message for other errors
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant' as const,
            content: 'Sorry, there was an error processing your request.'
          }
        ]);
      }
    }
  };
  
  // Update onChange handler for textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const showEmptyState = !currentConversation || messages.length === 0;

  return (
    <div className="absolute inset-0 flex flex-col">
      {showEmptyState ? (
        <EmptyChatUI>
          <div className="space-y-2">
            {providerButtons && (
              <div className="flex justify-center px-4">{providerButtons}</div>
            )}
            <ChatInput 
              value={input} 
              onChange={handleInputChange} 
              onSubmit={handleSubmit}
              placeholder="Send a message to start a new chat..."
            />
          </div>
        </EmptyChatUI>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pb-0">
            <ChatMessages messages={messages} error={chatError} />
          </div>
          <div className="bg-gradient-to-b from-white/0 via-white to-white space-y-2 pt-2">
            {providerButtons && (
              <div className="flex justify-center px-4">{providerButtons}</div>
            )}
            <ChatInput 
              value={input} 
              onChange={handleInputChange} 
              onSubmit={handleSubmit} 
            />
          </div>
        </>
      )}
    </div>
  )
}

