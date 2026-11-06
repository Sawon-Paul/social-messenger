'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, X, CheckCheck, Filter, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { NOTIFICATION_CONFIG, type Notification, type NotificationType } from '@/lib/notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Get current filter from URL
  const typeFilter = searchParams.get('type') as NotificationType | null;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get current user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);

        // Fetch notifications
        let query = supabase
          .from('notifications')
          .select(`
            *,
            from_user:from_user_id(full_name, username, avatar_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Apply unread filter
        if (filter === 'unread') {
          query = query.eq('is_read', false);
        }

        const { data } = await query;

        if (data) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [router, filter]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('is_read', true);

      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } catch (error) {
      console.error('Error deleting all read notifications:', error);
    }
  };

  // Filter by search query
  const filteredNotifications = notifications.filter((notification) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query)
    );
  });

  // Filter by type
  const getTypeFilteredNotifications = () => {
    if (!typeFilter) return filteredNotifications;
    return filteredNotifications.filter((n) => n.type === typeFilter);
  };

  const displayNotifications = getTypeFilteredNotifications();

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = displayNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <CheckCheck size={18} className="inline-block mr-1" />
                  Mark all read
                </button>
              )}
              {notifications.some((n) => n.is_read) && (
                <button
                  onClick={deleteAllRead}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={18} className="inline-block mr-1" />
                  Clear read
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
            <Filter size={16} className="text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'No matching notifications' : filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try a different search term'
                : 'When you get notifications, they\'ll appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayNotifications.map((notification) => {
              const config = NOTIFICATION_CONFIG[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`group flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all ${
                    !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  {/* Avatar */}
                  <Link
                    href={`/profile/${notification.from_user_id}`}
                    className="flex-shrink-0"
                  >
                    {notification.from_user?.avatar_url ? (
                      <img
                        src={notification.from_user.avatar_url}
                        alt={notification.from_user.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {notification.from_user?.full_name?.substring(0, 1) || '?'}
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {!notification.is_read && (
                            <span className="mr-1 font-bold text-blue-600 dark:text-blue-400">•</span>
                          )}
                          <Link
                            href={`/profile/${notification.from_user_id}`}
                            className="font-semibold hover:underline"
                          >
                            {notification.from_user?.full_name || 'Unknown'}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                            <span>{config.icon}</span>
                            <span>{notification.type.replace('_', ' ')}</span>
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Action buttons based on type */}
                    {notification.type === 'friend_request' && (
                      <div className="flex items-center gap-2 mt-3">
                        <Link
                          href="/friends"
                          onClick={() => markAsRead(notification.id)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Request
                        </Link>
                      </div>
                    )}

                    {(notification.type === 'post_like' || notification.type === 'comment') && (
                      <div className="flex items-center gap-2 mt-3">
                        <Link
                          href={`/posts/${notification.metadata?.post_id}`}
                          onClick={() => markAsRead(notification.id)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Post
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
