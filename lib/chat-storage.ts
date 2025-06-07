import { Conversation, Message } from '@/types/chat';

interface StoredConversation extends Omit<Conversation, 'createdAt'> {
  createdAt: string;
}

type ConversationStorage = Record<string, StoredConversation>;

export const ChatStorage = {
  // Ensure new conversations always have a messages array and model
  saveConversation: (conversation: Conversation) => {
    console.log('Saving conversation:', {
      id: conversation.id,
      messageCount: conversation.messages?.length || 0,
      model: conversation.model
    });

    const savedData = localStorage.getItem('conversations');
    const conversations: ConversationStorage = savedData ? JSON.parse(savedData) : {};
    
    const storageFormat: StoredConversation = {
      ...conversation,
      createdAt: conversation.createdAt.toISOString(),
      // Ensure messages is always an array
      messages: conversation.messages || [],
      // Make sure model is saved
      model: conversation.model || ''
    };
    
    conversations[conversation.id] = storageFormat;
    localStorage.setItem('conversations', JSON.stringify(conversations));
  },

  getConversations: (): Record<string, Conversation> => {
    const saved = localStorage.getItem('conversations');
    
    if (!saved) return {};
    
    const stored: ConversationStorage = JSON.parse(saved);
    const converted: Record<string, Conversation> = {};
    
    Object.entries(stored).forEach(([id, conv]) => {
      converted[id] = {
        ...conv,
        createdAt: new Date(conv.createdAt)
      };
    });
    
    return converted;
  },

  deleteConversation: (id: string) => {
    console.log('Deleting conversation:', id);
    const savedData = localStorage.getItem('conversations');
    if (!savedData) return;

    const conversations: ConversationStorage = JSON.parse(savedData);
    delete conversations[id];
    localStorage.setItem('conversations', JSON.stringify(conversations));
  },

  updateConversationTitle: (id: string, title: string) => {
    console.log('Updating conversation title:', { id, title });
    const savedData = localStorage.getItem('conversations');
    if (!savedData) return;

    const conversations: ConversationStorage = JSON.parse(savedData);
    if (conversations[id]) {
      conversations[id].title = title;
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  },

  updateConversationMessages: (id: string, messages: Message[]) => {
    console.log('Updating messages in storage:', { id, messageCount: messages.length });
    
    const savedData = localStorage.getItem('conversations');
    if (!savedData) {
      console.warn('No conversations found in storage');
      return;
    }

    const conversations: ConversationStorage = JSON.parse(savedData);
    if (conversations[id]) {
      conversations[id] = {
        ...conversations[id],
        messages
      };
      localStorage.setItem('conversations', JSON.stringify(conversations));
      console.log('Successfully saved messages to storage');
    } else {
      console.warn('Conversation not found in storage:', id);
    }
  },

  // Update conversation model
  updateConversationModel: (id: string, model: string) => {
    console.log('Updating conversation model:', { id, model });
    const savedData = localStorage.getItem('conversations');
    if (!savedData) return;

    const conversations: ConversationStorage = JSON.parse(savedData);
    if (conversations[id]) {
      conversations[id].model = model;
      localStorage.setItem('conversations', JSON.stringify(conversations));
      console.log('Successfully updated model in storage');
    } else {
      console.warn('Conversation not found in storage:', id);
    }
  },

  getConversation: (id: string): Conversation | null => {
    console.log('Fetching conversation from storage:', id);
    const saved = localStorage.getItem('conversations');
    if (!saved) {
      console.warn('No conversations in storage');
      return null;
    }
    
    const stored: ConversationStorage = JSON.parse(saved);
    const conversation = stored[id];
    
    if (!conversation) {
      console.warn('Conversation not found:', id);
      return null;
    }

    // Ensure messages is always an array
    if (!conversation.messages) {
      conversation.messages = [];
    }

    const converted = {
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      // Always return a new array reference to avoid state issues
      messages: [...conversation.messages]
    };

    console.log('Retrieved conversation:', {
      id: converted.id,
      messageCount: converted.messages.length
    });

    return converted;
  }
};
