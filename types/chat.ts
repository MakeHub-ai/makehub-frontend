export interface ChatCompletionResponse {
  id: string;
  providers: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    completion_tokens_details: {
      reasoning_tokens: number;
      accepted_prediction_tokens: number;
      rejected_prediction_tokens: number;
    };
  };
  choices: {
    message: {
      role: 'assistant' | 'user';
      content: string;
    };
    logprobs: null;
    finish_reason: string;
    index: number;
  }[];
}

export interface ChatCompletionRequest {
  model: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  model: string;
}
