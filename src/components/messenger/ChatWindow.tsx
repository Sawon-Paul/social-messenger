'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Phone, Video } from 'lucide-react';
import Peer from 'peerjs';
import { createClient } from '@/lib/supabase/client';
import { useCallStore } from '@/store/useCallStore';
import MessageInput from './MessageInput';
import IncomingCallModal from '../calling/IncomingCallModal';

interface ChatWindowProps {
  userId: string;
  chatUserId: string;
  chatUserName: string;
  chatUserAvatar: string;
  onBack?: () => void;
  isFloating?: boolean;
  onClose?: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function ChatWindow({ userId, chatUserId, chatUserName, chatUserAvatar, onBack, isFloating, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<'online' | 'offline' | null>(null);
  const [showCallControls, setShowCallControls] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const peerRef = useRef<Peer | null>(null);

  const {
    status: callStatus,
    callType,
    remoteUserId,
    remoteUserName,
    isIncomingCall,
    startOutgoingCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
  } = useCallStore();

  // PeerJS setup
  useEffect(() => {
    if (!userId) return;

    peerRef.current = new Peer(userId);

    peerRef.current.on('call', (call) => {
      // Get caller info
      const callerId = call.peer;
      const callTypeVal = call.metadata?.type || 'audio';
      startOutgoingCall(callerId, callerId, callTypeVal as 'audio' | 'video');
      // We'll handle the incoming modal in the parent or here
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [userId, startOutgoingCall]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${chatUserId}),and(sender_id.eq.${chatUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', chatUserId)
        .eq('receiver_id', userId)
        .eq('is_read', false);
    };

    loadMessages();

    // Subscribe to new messages in real-time
    subscriptionRef.current = createClient()
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [userId, chatUserId]);

  // Check online status
  useEffect(() => {
    const checkOnline = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('online_status')
          .select('is_online')
          .eq('user_id', chatUserId)
          .single();

        if (data) setOnlineStatus(data.is_online ? 'online' : 'offline');
      } catch (error) {
        console.error('Error checking online status:', error);
      }
    };

    checkOnline();

    // Subscribe to online status changes
    const subscription = createClient()
      .channel('online_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'online_status',
          filter: `user_id.eq.${chatUserId}`,
        },
        (payload) => {
          setOnlineStatus(payload.new.is_online ? 'online' : 'offline');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatUserId]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full ${isFloating ? 'bg-white dark:bg-gray-800 rounded-lg shadow-xl' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {onBack && (
          <button onClick={onBack} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft size={24} />
          </button>
        )}
        
        {/* Avatar */}
        {chatUserAvatar ? (
          <img src={chatUserAvatar} alt={chatUserName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {chatUserName.substring(0, 1).toUpperCase()}
          </div>
        )}

        {/* User info */}
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{chatUserName}</p>
          <p className={`text-xs ${onlineStatus === 'online' ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
            {onlineStatus === 'online' ? 'Online' : 'Offline'}
          </p>
        </div>

        {/* Call buttons */}
        <button
          onClick={() => {
            startOutgoingCall(chatUserId, chatUserName, 'audio');
            setShowCallControls(true);
          }}
          className="text-blue-600 hover:text-blue-700 p-2 transition-colors"
          aria-label="Audio call"
        >
          <Phone size={20} />
        </button>
        <button
          onClick={() => {
            startOutgoingCall(chatUserId, chatUserName, 'video');
            setShowCallControls(true);
          }}
          className="text-blue-600 hover:text-blue-700 p-2 transition-colors"
          aria-label="Video call"
        >
          <Video size={20} />
        </button>

        {/* Close button (for floating chat) */}
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Incoming Call Modal */}
      {isIncomingCall && remoteUserId && (
        <IncomingCallModal
          userId={remoteUserId}
          userName={remoteUserName || 'Unknown'}
          userAvatar={chatUserAvatar}
          callType={callType || 'audio'}
          onAccept={() => {
            acceptIncomingCall();
            setShowCallControls(true);
          }}
          onReject={() => rejectIncomingCall()}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Send a message to start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isMine
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                  {formatTime(msg.created_at)}
                  {isMine && (
                    <span className="ml-1">
                      {msg.is_read ? '✓✓' : '✓'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput userId={userId} chatUserId={chatUserId} onSend={() => {}} />
    </div>
  );
}
