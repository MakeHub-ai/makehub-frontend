'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Settings, Menu } from 'lucide-react'
import { Sidebar } from "@/components/chat/Sidebar"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ParametersSidebar } from "@/components/chat/ParametersSidebar"
import { Button } from "@/components/ui/button"
import { ModelSelector } from "@/components/chat/ModelSelector"
import { StreamMetrics } from '@/lib/metrics-utils'
import { Conversation } from '@/types/chat';
import { ChatStorage } from '@/lib/chat-storage';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Model } from "@/types/models"
import { FastestProviderButton } from "@/components/chat/FastestProvider"
import { CheapestProviderButton } from "@/components/chat/CheapestProvider"

enum ProviderType {
  FASTEST = 'fastest',
  CHEAPEST = 'cheapest',
  NONE = 'none'
}

type ThroughputValue = number | "best" | undefined;

export default function ChatPage() {
  const searchParams = useSearchParams()
  const [isParametersOpen, setIsParametersOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(
    searchParams?.get('model') || "mistral/mistral-small-24B-fp8"
  )
  const [minThroughput, setMinThroughput] = useState<ThroughputValue>(undefined);
  const [maxLatency, setMaxLatency] = useState<number>()
  const [metrics, setMetrics] = useState<StreamMetrics>()
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter();
  const { session } = useAuth();
  const [selectedModelData, setSelectedModelData] = useState<Model | undefined>()
  const [activeProvider, setActiveProvider] = useState<ProviderType>(ProviderType.NONE)

  // DEBUG: Monitor state changes
  useEffect(() => {
    console.log('Current conversation changed:', {
      id: currentConversation?.id,
      title: currentConversation?.title,
      messageCount: currentConversation?.messages.length
    });
  }, [currentConversation]);

  // Load initial conversation if exists
  useEffect(() => {
    if (!session) return; // Don't load conversations if not authenticated
    
    console.log('Loading initial conversations');
    const conversations = ChatStorage.getConversations();
    if (Object.keys(conversations).length > 0) {
      const lastConversation = Object.values(conversations)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      console.log('Setting initial conversation:', lastConversation.id);
      
      // Also set the selected model from the conversation
      if (lastConversation.model) {
        console.log('Restoring model from conversation:', lastConversation.model);
        setSelectedModel(lastConversation.model);
      }
      
      setCurrentConversation(lastConversation);
    }
  }, [session]); // Add session to dependencies

  const handleMetricsUpdate = (newMetrics: StreamMetrics) => {
    // Use requestAnimationFrame to avoid the state update during render
    requestAnimationFrame(() => {
      console.log('Updating metrics in ChatPage:', newMetrics);
      setMetrics(newMetrics);
    });
  }

  const handleNewChat = () => {
    console.log('Creating new chat');
    
    // Clear the current conversation first to ensure clean state
    setCurrentConversation(null);
    
    const timestamp = Date.now();
    const existingConversations = ChatStorage.getConversations();
    const chatNumber = Object.keys(existingConversations).length + 1;
    
    const newConversation: Conversation = {
      id: `chat-${timestamp}`,
      title: `New Chat ${chatNumber}`,
      messages: [], // Ensure this is an empty array
      createdAt: new Date(timestamp),
      model: selectedModel // Save the currently selected model
    };
    
    console.log('Saving new conversation:', {
      id: newConversation.id,
      title: newConversation.title,
      model: newConversation.model
    });
    
    // Save to storage first, then update state
    ChatStorage.saveConversation(newConversation);
    
    // Set with a slight delay to ensure state update happens after clear
    setTimeout(() => {
      setCurrentConversation(newConversation);
    }, 0);
    
    return newConversation;
  };

  // Make onCreateNewChat async
  const onCreateNewChat = async () => {
    return new Promise<void>((resolve) => {
      const newChat = handleNewChat();
      setCurrentConversation(newChat);
      resolve();
    });
  };

  const handleSelectChat = (conversation: Conversation) => {
    console.log('Switching conversation:', {
      from: currentConversation?.id,
      to: conversation.id,
      title: conversation.title
    });

    if (currentConversation?.id === conversation.id) {
      // Fix: Only update if the title has actually changed to prevent update loops
      if (currentConversation.title !== conversation.title) {
        setCurrentConversation({...conversation});
      }
      return;
    }

    // Clear current conversation first to ensure clean switch

    setCurrentConversation(null);

    // Get fresh conversation data from storage
    const storedConversation = ChatStorage.getConversation(conversation.id);
    
    // Use setTimeout to ensure state updates happen in separate render cycles
    setTimeout(() => {
      if (storedConversation) {
        console.log('Loading stored conversation:', {
          id: storedConversation.id,
          title: storedConversation.title,
          messageCount: storedConversation.messages.length,
          model: storedConversation.model
        });
        
        setCurrentConversation(storedConversation);
        
        // Set the model from the saved conversation if available
        if (storedConversation.model) {
          console.log('Restoring model from conversation:', storedConversation.model);
          setSelectedModel(storedConversation.model);
        }
      } else {
        // If conversation doesn't exist in storage, save it first
        ChatStorage.saveConversation(conversation);
        setCurrentConversation(conversation);
        
        // Set the model from the conversation if available
        if (conversation.model) {
          setSelectedModel(conversation.model);
        }
      }
    }, 0);
  };

  const handleDeleteChat = (deletedId: string) => {
    if (currentConversation?.id === deletedId) {
      // If we're deleting the current chat
      const conversations = ChatStorage.getConversations();
      const remaining = Object.values(conversations);
      
      if (remaining.length > 0) {
        // Navigate to most recent chat
        setCurrentConversation(remaining[0]);
      } else {
        // No chats left, go to empty state
        setCurrentConversation(null);
      }
    }
    // If we're deleting a different chat, no need to change current
  };

  useEffect(() => {
    const model = searchParams?.get('model')
    if (model) {
      console.log('Updating selected model from URL:', model)
      setSelectedModel(model)
    }
  }, [searchParams])

  // Handle closing the parameters sidebar
  const handleParametersClose = () => {
    setIsParametersOpen(false);
  };

  const handleProviderClick = (providerType: ProviderType) => {
    if (activeProvider === providerType) {
      // Reset both values when deactivating
      setActiveProvider(ProviderType.NONE);
      setMinThroughput(undefined);
      setMaxLatency(undefined);
    } else {
      setActiveProvider(providerType);
      if (providerType === ProviderType.FASTEST) {
        setMinThroughput("best");
        setMaxLatency(undefined);
      } else if (providerType === ProviderType.CHEAPEST) {
        setMinThroughput(undefined);
        setMaxLatency(undefined);
      }
    }
  };

  const handleManualParameterChange = () => {
    setActiveProvider(ProviderType.NONE);
  };

  // Add a handler to update the model for the current conversation
  const handleModelChange = (modelId: string, model?: Model) => {
    setSelectedModel(modelId);
    setSelectedModelData(model);
    
    // If there's an active conversation, update its model
    if (currentConversation) {
      const updatedConversation = {
        ...currentConversation,
        model: modelId
      };
      
      console.log('Updating conversation model:', {
        id: updatedConversation.id,
        model: modelId
      });
      
      // Save the updated conversation with the new model
      ChatStorage.saveConversation(updatedConversation);
      setCurrentConversation(updatedConversation);
    }
  };

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 bg-gradient-to-b from-white to-gray-50/30 flex">
      {/* Mobile menu button - adjusted position */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="absolute left-4 top-4 z-50 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar - Updated positioning and styling */}
      <div className={`
        fixed md:static top-20 bottom-0 left-0 z-40 w-[320px]
        transition-transform duration-300 ease-in-out shadow-md md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full bg-white rounded-tr-xl">
          <Sidebar 
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            currentChatId={currentConversation?.id}
            onClose={() => setIsMobileMenuOpen(false)}
            onDeleteChat={handleDeleteChat}
          />
        </div>
      </div>

      {/* Main chat area with improved styling */}
      <div className={`
        flex-1 flex flex-col min-w-0 bg-white md:rounded-l-xl overflow-hidden
        border-l border-t border-gray-100 md:shadow-sm
        transition-[margin] duration-300 ease-in-out
        ${isParametersOpen ? 'mr-80' : ''}
      `}>
        {/* Model selector - improved styling */}
        <div className="h-14 flex items-center px-4 bg-white border-b border-gray-100">
          <div className="w-full max-w-full overflow-hidden pl-12 md:pl-0">
            <ModelSelector 
              value={selectedModel} 
              onValueChange={handleModelChange}
              onSettingsClick={() => setIsParametersOpen(true)}
            />
          </div>
        </div>

        {/* Chat interface with provider buttons */}
        <div className="flex-1 relative overflow-hidden">
          <ChatInterface
            selectedModel={selectedModel}
            minThroughput={minThroughput}
            maxLatency={maxLatency}
            onMetricsUpdate={handleMetricsUpdate}
            currentConversation={currentConversation}
            onSelectChat={handleSelectChat}
            providerButtons={
              <div className="flex gap-2">
                <FastestProviderButton 
                  isActive={activeProvider === ProviderType.FASTEST}
                  onClick={() => handleProviderClick(ProviderType.FASTEST)}
                />
                <CheapestProviderButton 
                  isActive={activeProvider === ProviderType.CHEAPEST}
                  onClick={() => handleProviderClick(ProviderType.CHEAPEST)}
                />
              </div>
            }
          />
        </div>
      </div>

      {/* Parameters sidebar - updated positioning */}
      <div className={`
        fixed top-20 bottom-0 right-0 z-40 w-80
        transition-transform duration-300 ease-in-out bg-white shadow-md
        rounded-l-xl border-l border-t border-gray-100
        ${isParametersOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <ParametersSidebar 
          isOpen={isParametersOpen} 
          onClose={handleParametersClose}
          onThroughputChange={(value) => {
            setMinThroughput(value);
            handleManualParameterChange();
          }}
          onLatencyChange={(value) => {
            setMaxLatency(value);
            handleManualParameterChange();
          }}
          metrics={metrics}
          selectedModel={selectedModelData}
          minThroughput={minThroughput}
          maxLatency={maxLatency}
        />
      </div>

      {/* Overlays - adjusted for cleaner UX */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {isParametersOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden"
          onClick={handleParametersClose}
        />
      )}
    </div>
  )
}
