'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Smile } from 'lucide-react';
import { useCallStore, CallState } from '@/store/useCallStore';

interface CallControlsProps {
  remoteUserId: string;
  onPeerConnect: (peerId: string) => void;
  onCallEnd: () => void;
}

export default function CallControls({ remoteUserId, onPeerConnect, onCallEnd }: CallControlsProps) {
  const { 
    status, 
    callType, 
    isCameraOn, 
    isMicrophoneOn, 
    toggleCamera, 
    toggleMicrophone, 
    endCall 
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  // Start media stream when component mounts
  useEffect(() => {
    const startMedia = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: callType === 'video' ? { width: 1280, height: 720 } : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);

        if (callType === 'video' && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Notify peer about media state
        onPeerConnect(remoteUserId);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Could not access camera/microphone. Please check permissions.');
      }
    };

    startMedia();

    return () => {
      // Cleanup stream on unmount
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callType, remoteUserId, onPeerConnect]);

  // Start call duration timer when connected
  useEffect(() => {
    if (status === 'connected') {
      setCallDuration(0);
      durationRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [status]);

  const handleHangup = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    endCall();
    onCallEnd();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={handleHangup}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Video call layout */}
      {callType === 'video' && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          {/* Remote video (fullscreen) */}
          <video
            id={`remote-video-${remoteUserId}`}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />

          {/* Local video (picture-in-picture) */}
          {isCameraOn && (
            <div className="absolute bottom-24 right-4 w-48 md:w-64 rounded-lg overflow-hidden shadow-xl border-2 border-white/20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Call duration */}
          {status === 'connected' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-mono">{formatDuration(callDuration)}</span>
            </div>
          )}
        </div>
      )}

      {/* Audio call layout */}
      {callType === 'audio' && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center z-50">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full animate-pulse" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Center content */}
          <div className="relative text-center text-white">
            {/* Avatar */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-5xl font-bold">
                {(status === 'ringing' ? '📞' : '🎙️')}
              </span>
            </div>

            {/* Status */}
            <p className="text-xl font-semibold mb-2">
              {status === 'ringing' && 'Ringing...'}
              {status === 'connecting' && 'Connecting...'}
              {status === 'connected' && 'Connected'}
            </p>

            {/* Duration */}
            {status === 'connected' && (
              <p className="text-white/70 font-mono">{formatDuration(callDuration)}</p>
            )}
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 z-50">
        {/* Mute button */}
        <button
          onClick={toggleMicrophone}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
            isMicrophoneOn
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isMicrophoneOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicrophoneOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        {/* Camera toggle (video calls only) */}
        {callType === 'video' && (
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
              isCameraOn
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        )}

        {/* Hangup button */}
        <button
          onClick={handleHangup}
          className="w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
          title="Hang up"
        >
          <PhoneOff size={28} />
        </button>

        {/* More options button (placeholder) */}
        <button
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
          title="More options"
        >
          <Smile size={24} />
        </button>
      </div>
    </>
  );
}
