// src/store/useAppStore.ts — Zustand global state store
import { create } from 'zustand'

export interface MiniChat {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  lastMessage?: string
  lastMessageTime?: string
}

export interface OnlineUser {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
}

export interface CallState {
  isActive: boolean
  isVideo: boolean
  isPinned: boolean
  remotePeerId?: string
  remoteName?: string
  direction: 'incoming' | 'outgoing' | 'none'
}

interface AppState {
  // Mini chat docks (max 3)
  miniChats: MiniChat[]
  activeMiniChatId: string | null
  addMiniChat: (chat: MiniChat) => void
  removeMiniChat: (id: string) => void
  setActiveMiniChat: (id: string | null) => void

  // Online users
  onlineUsers: OnlineUser[]
  setOnlineUsers: (users: OnlineUser[]) => void
  updateOnlineStatus: (userId: string, status: 'online' | 'offline' | 'away') => void

  // Call state
  callState: CallState
  setCallState: (state: Partial<CallState>) => void
  clearCallState: () => void

  // Notifications
  unreadNotifications: number
  incrementNotifications: () => void
  resetNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  miniChats: [],
  activeMiniChatId: null,
  addMiniChat: (chat) =>
    set((state) => {
      const exists = state.miniChats.find((c) => c.id === chat.id)
      if (exists) return state
      if (state.miniChats.length >= 3) {
        return { miniChats: [...state.miniChats.slice(1), chat] }
      }
      return { miniChats: [...state.miniChats, chat] }
    }),
  removeMiniChat: (id) =>
    set((state) => ({
      miniChats: state.miniChats.filter((c) => c.id !== id),
      activeMiniChatId: state.activeMiniChatId === id ? null : state.activeMiniChatId,
    })),
  setActiveMiniChat: (id) => set({ activeMiniChatId: id }),

  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  updateOnlineStatus: (userId, status) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.map((u) =>
        u.id === userId ? { ...u, status } : u
      ),
    })),

  callState: {
    isActive: false,
    isVideo: false,
    isPinned: false,
    direction: 'none',
  },
  setCallState: (state) =>
    set((prev) => ({
      callState: { ...prev.callState, ...state },
    })),
  clearCallState: () =>
    set({
      callState: {
        isActive: false,
        isVideo: false,
        isPinned: false,
        direction: 'none',
      },
    }),

  unreadNotifications: 0,
  incrementNotifications: () =>
    set((state) => ({ unreadNotifications: state.unreadNotifications + 1 })),
  resetNotifications: () => set({ unreadNotifications: 0 }),
}))
