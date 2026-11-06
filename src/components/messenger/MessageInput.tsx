'use client';

import { useState, useRef } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MessageInputProps {
  userId: string;
  chatUserId: string;
  onSend?: () => void;
}

export default function MessageInput({ userId, chatUserId, onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!message.trim() || isSending) return;

    setError(null);
    setIsSending(true);
    try {
      const supabase = createClient();
      const { error: sendError } = await supabase.from('messages').insert({
        sender_id: userId,
        receiver_id: chatUserId,
        content: message.trim(),
        is_read: false,
      });

      if (sendError) throw sendError;

      setMessage('');
      onSend?.();
      inputRef.current?.focus();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Error message */}
      {error && (
        <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-bold hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Attachment button */}
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <Paperclip size={20} />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        {/* Emoji button */}
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
          <Smile size={20} />
        </button>

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={!message.trim() || isSending}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
