// src/app/profile/page.tsx — User Profile page
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, Edit2, Save, X, MapPin, Link as LinkIcon, Calendar, Users, Heart, Image as ImageIcon, Video } from 'lucide-react'

interface ProfileData {
  full_name: string
  username: string
  avatar_url: string
  bio: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    username: '',
    avatar_url: '',
    bio: '',
    email: '',
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData || { full_name: '', username: '', avatar_url: '', bio: '', email: user.email || '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      setEditing(false)
      await loadProfile()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-950">
      {/* Cover photo */}
      <div className="h-64 bg-gradient-to-r from-[#1877f2] via-blue-500 to-purple-500 relative">
        <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
          <Camera className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Profile info */}
      <div className="max-w-4xl mx-auto px-4 -mt-20">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
            {/* Avatar */}
            <div className="relative -mt-16">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-900">
                  {profile.full_name.charAt(0) || 'U'}
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-[#1877f2] rounded-full border-2 border-white dark:border-gray-900 hover:bg-[#166fe5] transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Name and username */}
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="text-2xl font-bold w-full px-3 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.full_name || 'User'}</h1>
              )}
              <p className="text-gray-500 dark:text-gray-400">@{profile.username || 'username'}</p>
            </div>

            {/* Edit/Save buttons */}
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          {editing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Write about yourself..."
              className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-800 dark:border-gray-600"
              rows={3}
            />
          ) : profile.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>Friendship status available</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Logout */}
          <button onClick={handleLogout} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
            Log Out
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['Posts', 'Friends', 'Photos', 'Videos'].map((tab) => (
              <button key={tab} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'Posts' ? 'text-[#1877f2] border-b-2 border-[#1877f2]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No posts yet</p>
              <p className="text-sm">Share something with your friends!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
