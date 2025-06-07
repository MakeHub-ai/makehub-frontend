export function generateDefaultTitle(message: string): string {
  // Split message into words and take first two
  const words = message.split(/\s+/).slice(0, 2);
  // Join with space and add ellipsis if there were more words
  const title = words.join(' ');
  return title + (message.split(/\s+/).length > 2 ? '...' : '');
}

export function createNewChat(message: string, model: string): {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  model: string;
} {
  // Create the initial message
  const initialMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: message
  };

  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: generateDefaultTitle(message),
    messages: [initialMessage], // Include the initial message
    createdAt: new Date(),
    model: model || "mistral/Mistral-Small-24B-Instruct-2501-fp8" // Ensure a default model is always set
  };
}
