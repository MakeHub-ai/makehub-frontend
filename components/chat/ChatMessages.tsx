import { Message } from 'ai'
import { useEffect, useRef } from 'react'
import { MessageActions } from './MessageActions'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import { useAuth } from '@/contexts/auth-context'
import { SignInDialog } from "@/components/sign_in/sign-in-dialog"
import { InsufficientFundsError } from '@/components/ui/insufficient-funds-error'
import { isInsufficientFundsError } from '@/lib/error-utils'
import 'highlight.js/styles/github-dark.css'
import { ReasoningContent } from './ReasoningContent'

// Add an interface for the API error format
interface ApiError extends Error {
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
}

interface ChatMessagesProps {
  messages: Message[]
  error?: Error | null
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface ParsedMessage {
  reasoning?: string;
  answer: string;
}

function parseMessageContent(content: string): ParsedMessage {
  // Using [\s\S]* instead of .* with /s flag to match any character including newlines
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>\s*([\s\S]*)/);
  if (thinkMatch) {
    return {
      reasoning: thinkMatch[1].trim(),
      answer: thinkMatch[2].trim()
    };
  }
  return { answer: content };
}

// Extracted reusable MarkdownRenderer component
const MarkdownRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown
    rehypePlugins={[
      rehypeRaw,
      rehypeSanitize,
      rehypeHighlight
    ]}
    className="markdown-content"
    components={{
      code({ node, inline, className, children, ...props }: CodeProps) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
          <div className="relative group">
            <pre className={`${className} rounded-lg p-4 bg-gray-900`}>
              <code {...props} className={className}>
                {children}
              </code>
            </pre>
            <button
              className="absolute top-2 right-2 p-1 rounded bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
              }}
            >
              <svg 
                className="h-4 w-4 text-white/70 hover:text-white"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        ) : (
          <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" {...props}>
            {children}
          </code>
        )
      },
      table({ children }) {
        return (
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300 dark:border-gray-700 w-full">
              {children}
            </table>
          </div>
        )
      },
      th({ children }) {
        return (
          <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800">
            {children}
          </th>
        )
      },
      td({ children }) {
        return (
          <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
            {children}
          </td>
        )
      },
      ul({ children }) {
        return (
          <ul className="list-disc pl-6 space-y-1">
            {children}
          </ul>
        )
      },
      ol({ children, start }) {
        return (
          <ol className="list-decimal pl-6 space-y-1" start={start || 1}>
            {children}
          </ol>
        )
      },
      li({ children }) {
        return (
          <li className="mb-1">
            {children}
          </li>
        )
      },
      p({ children }) {
        return (
          <p className="mb-4 last:mb-0">
            {children}
          </p>
        )
      }
    }}
  >
    {content}
  </ReactMarkdown>
);

export function ChatMessages({ messages, error }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Enhanced check for insufficient funds errors to handle both error objects and 402 status
  const isInsufficientFunds = 
    // Check direct error properties
    error?.name === "InsufficientFundsError" || 
    error?.message?.includes("Insufficient funds") || 
    // Check nested error properties that might come from a 402 response
    (error as ApiError)?.error?.type === "InsufficientFunds" ||
    (error as ApiError)?.error?.message?.includes("Insufficient funds") ||
    // Check last message if it contains an error message
    (messages.length > 0 && 
     messages[messages.length - 1].role === 'assistant' &&
     (messages[messages.length - 1].content.includes('Insufficient funds') ||
      messages[messages.length - 1].content.includes('{"error"') && 
      messages[messages.length - 1].content.includes('InsufficientFunds')));

  // If we have an insufficient funds error, show the friendly error message
  if (isInsufficientFunds) {
    const errorMessage = 
      (error as ApiError)?.error?.message || 
      // Removed redundant cast
      error?.message || 
      'You have consumed all your credits. Please reload your balance to continue using our services.';
    
    return (
      <div className="h-full w-full max-w-4xl mx-auto px-4 py-8 flex items-center justify-center">
        <InsufficientFundsError message={errorMessage} />
      </div>
    )
  }

  return (
    <div className="h-full w-full max-w-4xl mx-auto px-4">
      {!user && messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Welcome to MakeHub Chat
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Sign in to start chatting with our AI models and save your conversations.
          </p>
          <SignInDialog className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700" />
        </div>
      )}
      <div className="py-4 space-y-6">
        {messages.map((message) => {
          const parsedContent = message.role === 'assistant' 
            ? parseMessageContent(message.content)
            : { answer: message.content };

          return (
            <div key={message.id} className="space-y-2">
              <div className="flex items-start gap-3 sm:gap-4">
                {message.role === "assistant" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs sm:text-sm font-medium">
                    AI
                  </div>
                )}
                {message.role === "user" ? (
                  <div className="flex-1 flex justify-end">
                    <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                    {parsedContent.reasoning && (
                      <ReasoningContent reasoning={parsedContent.reasoning} />
                    )}
                    <MarkdownRenderer content={parsedContent.answer} />
                  </div>
                )}
              </div>
              {message.role === "assistant" && <MessageActions content={parsedContent.answer} />}
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  )
}

