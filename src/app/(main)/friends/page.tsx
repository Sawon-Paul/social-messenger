// src/app/friends/page.tsx — Friends list & friend requests
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, X, Check, Search, Users, UserCheck, UserMinus } from 'lucide-react'

interface FriendRequest {
  id: string
  from_user: {
    full_name: string
    username: string
    avatar_url: string
  }
}

interface Friend {
  id: string
  friend: {
    full_name: string
    username: string
    avatar_url: string
  }
}

export default function FriendsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Load pending friend requests (received)
      const { data: received } = await supabase
        .from('friend_requests')
        .select(`
          id,
          from_user:from_user_id(full_name, username, avatar_url)
        `)
        .eq('to_user', user.id)
        .eq('status', 'pending')

      setPendingRequests(received || [])

      // Load sent friend requests
      const { data: sent } = await supabase
        .from('friend_requests')
        .select(`
          id,
          to_user:to_user_id(full_name, username, avatar_url)
        `)
        .eq('from_user', user.id)
        .eq('status', 'pending')

      setSentRequests(sent || [])

      // Load friends
      const { data: friendList } = await supabase
        .from('friends')
        .select(`
          id,
          friend:user1!inner(full_name, username, avatar_url)
        `)
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)

      setFriends(friendList || [])
    } catch (err) {
      console.error('Error loading friends:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .ilike('username', `${query}%`)
        .neq('id', user?.id)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  const sendFriendRequest = async (targetUserId: string) => {
    setActionLoading(targetUserId)
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          from_user: user.id,
          to_user: targetUserId,
          status: 'pending',
        })

      if (error) throw error
      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const acceptRequest = async (requestId: string, fromUserId: string) => {
    setActionLoading(requestId)
    try {
      // Accept the request
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      // Create friendship
      await supabase
        .from('friends')
        .insert([
          { user1: user.id, user2: fromUserId },
          { user1: fromUserId, user2: user.id },
        ])

      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const rejectRequest = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const removeFriend = async (friendId: string) => {
    try {
      const friend = friends.find(f => f.id === friendId)
      if (!friend) return

      await supabase
        .from('friends')
        .delete()
        .or(`user1.eq.${user.id},user2.eq.${friend.friend.user1 || friend.friend.id}`)

      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-950 pt-[var(--navbar-height)] pb-16 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Friends</h1>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                searchUsers(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:text-gray-200"
            />
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-2 border-t pt-2">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white font-medium">
                      {result.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{result.full_name}</p>
                      <p className="text-sm text-gray-500">@{result.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(result.id)}
                    disabled={actionLoading === result.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Friend Requests</h2>
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white font-medium">
                    {req.from_user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{req.from_user.full_name}</p>
                    <p className="text-sm text-gray-500">@{req.from_user.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(req.id, req.from_user.id)}
                    disabled={actionLoading === req.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    disabled={actionLoading === req.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friends List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Friends ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No friends yet</p>
              <p className="text-sm">Search for users above to add them as friends!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white font-medium">
                      {friend.friend.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{friend.friend.full_name}</p>
                      <p className="text-sm text-gray-500">@{friend.friend.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
