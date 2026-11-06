'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useCallStore } from '@/store/useCallStore';

interface IncomingCallModalProps {
  userId: string;
  userName: string;
  userAvatar: string | null;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  userName,
  userAvatar,
  callType,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play ringtone when modal opens
    if (ringtoneRef.current) {
      ringtoneRef.current.play().catch(() => {
        // Autoplay policy may block audio — that's okay
      });
    }

    return () => {
      // Stop ringtone on cleanup
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Ringtone element */}
      <audio ref={ringtoneRef} loop preload="auto">
        <source src="/ringtone.mp3" type="audio/mpeg" />
      </audio>

      {/* Modal */}
      <div className="mx-4 w-full max-w-sm animate-in fade-in zoom-in duration-300">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Caller Info */}
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 px-6 pb-8 pt-10 text-center text-white">
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="h-48 w-48 animate-[ping_1.5s_ease-in-out_infinite] rounded-full bg-white/10" />
              <div className="absolute h-32 w-32 animate-[ping_1.5s_ease-in-out_infinite_delay-500] rounded-full bg-white/10" />
            </div>

            {/* Avatar */}
            <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white/20 shadow-lg">
              {userAvatar ? (
                <img
                  src={userAvatar.startsWith('http') ? userAvatar : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${userAvatar}`}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg className="h-14 w-14 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>

            {/* Name & Call Type */}
            <h2 className="text-2xl font-bold">{userName}</h2>
            <p className="mt-1 text-sm text-white/80">
              {callType === 'video' ? 'Video Call' : 'Audio Call'} Incoming...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-around bg-white px-6 py-6">
            {/* Reject Button */}
            <button
              onClick={onReject}
              className="flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              aria-label="Reject call"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30 transition-colors hover:bg-red-600">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.28 6.72 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.66-.94l-6.58-2.1a1 1 0 00-1.06.26l-1.7 1.7a9.97 9.97 0 01-4.24-4.24l1.7-1.7a1 1 0 00.26-1.06L8.94 3.66A1 1 0 008 2.72H5z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-600">Reject</span>
            </button>

            {/* Accept Button */}
            <button
              onClick={onAccept}
              className="flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              aria-label="Accept call"
            >
              <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30 transition-colors hover:bg-green-600">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.66l.81 2.43a1 1 0 01-.42 1.11l-1.35.9a7.96 7.96 0 003.54 3.54l.9-1.35a1 1 0 011.11-.42l2.43.81a1 1 0 01.66.94V19a2 2 0 01-2 2h-1C9.71 21 3 14.29 3 7V5z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-600">Accept</span>
            </button>
          </div>
        </div>

        {/* Fallback: no ringtone file */}
        <p className="mt-4 text-center text-xs text-white/60">
          Please add <code className="rounded bg-white/10 px-1 py-0.5">/ringtone.mp3</code> to public folder for audio
        </p>
      </div>
    </div>
  );
}
