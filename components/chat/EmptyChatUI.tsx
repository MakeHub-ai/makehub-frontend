interface EmptyChatUIProps {
  children: React.ReactNode;
  isNewChat?: boolean;
}

export function EmptyChatUI({ children, isNewChat = false }: EmptyChatUIProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {'Start a new conversation'}
        </h2>
      </div>
      <div className="w-full max-w-3xl">
        {children}
      </div>
    </div>
  );
}
