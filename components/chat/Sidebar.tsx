"use client"
import { useState, useEffect } from "react"
import { PenSquare, Search, Pencil, Trash2, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Conversation } from "@/types/chat"
import { ChatStorage } from "@/lib/chat-storage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  // Callback to create a new chat, must return the created conversation
  onNewChat: () => Conversation;
  // Callback when a chat is selected
  onSelectChat: (conversation: Conversation) => void;
  // ID of the currently active chat
  currentChatId?: string;
  // Callback to close the sidebar on mobile
  onClose?: () => void;
  // Add new prop for handling deletion navigation
  onDeleteChat: (id: string) => void;
}

export function Sidebar({ onNewChat, onSelectChat, currentChatId, onClose, onDeleteChat }: SidebarProps) {
  // State to store all conversations
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");
  // State for tracking which conversation is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  // State for storing the new title during editing
  const [newTitle, setNewTitle] = useState("");

  // Load conversations from storage when component mounts
  useEffect(() => {
    setConversations(ChatStorage.getConversations());
  }, []);

  // Add refresh interval
  useEffect(() => {
    // Initial load
    setConversations(ChatStorage.getConversations());

    // Set up refresh interval
    const refreshInterval = setInterval(() => {
      const updated = ChatStorage.getConversations();
      setConversations(updated);
    }, 1000); // Check every second

    return () => clearInterval(refreshInterval);
  }, []);

  // Handle creating a new chat
  const handleNewChat = () => {
    // Call parent's onNewChat and get the new conversation
    const newConversation = onNewChat();
    
    // Update local state with the new conversation
    setConversations(prev => ({
      ...prev,
      [newConversation.id]: newConversation
    }));
  };

  // Modified delete handler
  const handleDelete = (id: string) => {
    ChatStorage.deleteConversation(id);
    
    // Get updated conversations
    const updatedConversations = ChatStorage.getConversations();
    setConversations(updatedConversations);
    
    // Notify parent component about deletion
    onDeleteChat(id);
    
    // Find next conversation to navigate to
    const remainingConversations = Object.values(updatedConversations);
    if (remainingConversations.length > 0) {
      // Navigate to the most recent conversation
      const nextChat = remainingConversations.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      onSelectChat(nextChat);
    }
  };

  // Handle renaming a chat
  const handleRename = (id: string) => {
    if (newTitle.trim()) {
      ChatStorage.updateConversationTitle(id, newTitle);
      // Refresh conversations list after rename
      setConversations(ChatStorage.getConversations());
      setEditingId(null); // Exit edit mode
    }
  };

  // Filter and sort conversations based on search term and date
  const filteredConversations = Object.values(conversations)
    // Filter by search term
    .filter(conv => conv.title.toLowerCase().includes(searchTerm.toLowerCase()))
    // Sort by creation date, newest first
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Add animation variants
  const sidebarVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 bg-opacity-70">
      {/* Header section */}
      <motion.div 
        className="p-3 flex items-center gap-2 shrink-0 border-b border-gray-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 md:hidden hover:bg-gray-200/70 transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1 font-semibold text-gray-700">Your Chats</div>
      </motion.div>

      {/* New Chat button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="p-3"
      >
        <Button 
          className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </motion.div>

      {/* Search box */}
      <motion.div 
        className="p-3 shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search conversations" 
            className="pl-9 bg-white border-gray-200 focus-visible:ring-blue-500/40 h-9 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Conversations list */}
      <motion.div 
        className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 mt-2"
        variants={sidebarVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {filteredConversations.length === 0 && (
            <motion.div 
              className="text-center py-6 text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No conversations found
            </motion.div>
          )}
        </AnimatePresence>
        
        {filteredConversations.map((conversation) => (
          <motion.div 
            key={conversation.id} 
            className="conversation-item"
            variants={itemVariants}
            layout
          >
            {editingId === conversation.id ? (
              // Rename input field
              <div className="flex gap-2 items-center p-1">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(conversation.id)}
                  autoFocus
                  className="flex-1 bg-white focus-visible:ring-blue-500/40 h-9"
                />
                <Button 
                  size="sm" 
                  onClick={() => handleRename(conversation.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                >
                  Save
                </Button>
              </div>
            ) : (
              // Conversation item with dropdown menu
              <div className="flex group items-center rounded-lg overflow-hidden hover:bg-white transition-colors duration-150">
                <Button
                  variant={currentChatId === conversation.id ? "default" : "ghost"}
                  className={`flex-1 justify-start text-sm px-3 py-2 h-auto rounded-lg
                    ${currentChatId === conversation.id 
                      ? 'bg-blue-50 text-blue-800 hover:bg-blue-100' 
                      : 'text-gray-700 hover:bg-white'}`}
                  onClick={() => onSelectChat(conversation)}
                >
                  <span className="truncate">{conversation.title}</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 ml-1 mr-1"
                    >
                      <span className="sr-only">Actions</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500">
                        <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 rounded-lg overflow-hidden p-1">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingId(conversation.id);
                        setNewTitle(conversation.title);
                      }}
                      className="rounded-md text-sm cursor-pointer flex gap-2 items-center px-3 py-1.5 hover:bg-gray-100"
                    >
                      <Pencil className="h-3.5 w-3.5 text-gray-500" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(conversation.id)}
                      className="rounded-md text-sm cursor-pointer flex gap-2 items-center px-3 py-1.5 hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

