'use client';

import { create } from 'zustand';

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

export interface CallState {
  // Current call info
  status: CallStatus;
  callType: CallType | null;
  remoteUserId: string | null;
  remoteUserName: string | null;
  remoteUserAvatar: string | null;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
  isIncomingCall: boolean;
  
  // Actions
  startOutgoingCall: (callType: CallType, remoteUserId: string, remoteUserName?: string, remoteUserAvatar?: string) => void;
  acceptIncomingCall: () => void;
  rejectIncomingCall: () => void;
  endCall: () => void;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  setCallStatus: (status: CallStatus) => void;
}

export const useCallStore = create<CallState>((set) => ({
  // Initial state
  status: 'idle',
  callType: null,
  remoteUserId: null,
  remoteUserName: null,
  remoteUserAvatar: null,
  isCameraOn: true,
  isMicrophoneOn: true,
  isIncomingCall: false,

  // Start outgoing call
  startOutgoingCall: (callType, remoteUserId, remoteUserName = '', remoteUserAvatar = '') => {
    set({
      status: 'ringing',
      callType,
      remoteUserId,
      remoteUserName,
      remoteUserAvatar,
      isCameraOn: callType === 'video',
      isMicrophoneOn: true,
      isIncomingCall: false,
    });
  },

  // Accept incoming call
  acceptIncomingCall: () => {
    set({
      status: 'connecting',
      isIncomingCall: false,
    });
  },

  // Reject incoming call
  rejectIncomingCall: () => {
    set({
      status: 'ended',
      isIncomingCall: false,
    });
  },

  // End current call
  endCall: () => {
    set({
      status: 'idle',
      callType: null,
      remoteUserId: null,
      remoteUserName: null,
      remoteUserAvatar: null,
      isCameraOn: true,
      isMicrophoneOn: true,
      isIncomingCall: false,
    });
  },

  // Toggle camera
  toggleCamera: () => {
    set((state) => ({ isCameraOn: !state.isCameraOn }));
  },

  // Toggle microphone
  toggleMicrophone: () => {
    set((state) => ({ isMicrophoneOn: !state.isMicrophoneOn }));
  },

  // Set call status directly
  setCallStatus: (status) => {
    set({ status });
  },
}));
