// Notification types and their display configurations

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'post_like'
  | 'comment'
  | 'story_view'
  | 'community_join'
  | 'message';

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
  from_user?: {
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

export const NOTIFICATION_CONFIG: Record<NotificationType, { icon: string; color: string; bgColor: string }> = {
  friend_request: {
    icon: '👥',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  friend_accepted: {
    icon: '✅',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  post_like: {
    icon: '❤️',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  comment: {
    icon: '💬',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  story_view: {
    icon: '👁️',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  community_join: {
    icon: '🏘️',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  message: {
    icon: '✉️',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },
};

export const NOTIFICATION_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'unread', label: 'Unread First' },
] as const;
