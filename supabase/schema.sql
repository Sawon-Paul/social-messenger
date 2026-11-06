-- Social Messenger Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text not null,
  username text unique not null,
  avatar_url text,
  bio text,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friend requests table
create table friend_requests (
  id uuid default uuid_generate_v4() primary key,
  from_user uuid references profiles(id) on delete cascade not null,
  to_user uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(from_user, to_user)
);

-- Friends table
create table friends (
  id uuid default uuid_generate_v4() primary key,
  user1 uuid references profiles(id) on delete cascade not null,
  user2 uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user1, user2)
);

-- Posts table (for News Feed)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Post likes table
create table post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- Post comments table
create table post_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table (for Messenger)
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stories table
create table stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  media_url text not null,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Communities/Groups table
create table communities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  avatar_url text,
  creator_id uuid references profiles(id) on delete cascade not null,
  privacy text check (privacy in ('public', 'private')) default 'public',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Community members table
create table community_members (
  id uuid default uuid_generate_v4() primary key,
  community_id uuid references communities(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(community_id, user_id)
);

-- Real-time presence (online status)
create table online_status (
  user_id uuid references profiles(id) on delete cascade primary key,
  is_online boolean default false,
  last_seen timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table friend_requests enable row level security;
alter table friends enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;
alter table messages enable row level security;
alter table stories enable row level security;
alter table communities enable row level security;
alter table community_members enable row level security;
alter table online_status enable row level security;

-- Profiles: users can read all profiles, update their own
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- Friend requests: users can manage their own requests
create policy "Users can view their friend requests" on friend_requests for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "Users can create friend requests" on friend_requests for insert with check (auth.uid() = from_user);
create policy "Users can update their friend requests" on friend_requests for update using (auth.uid() = from_user or auth.uid() = to_user);

-- Friends: users can view their friendships
create policy "Users can view their friends" on friends for select using (auth.uid() = user1 or auth.uid() = user2);

-- Posts: everyone can read, authors can manage their own
create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Authenticated users can create posts" on posts for insert with check (auth.uid() = author_id);
create policy "Users can update their own posts" on posts for update using (auth.uid() = author_id);
create policy "Users can delete their own posts" on posts for delete using (auth.uid() = author_id);

-- Post likes: everyone can read, users can manage their own
create policy "Post likes are viewable by everyone" on post_likes for select using (true);
create policy "Users can create post likes" on post_likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own post likes" on post_likes for delete using (auth.uid() = user_id);

-- Post comments: everyone can read, users can manage their own
create policy "Post comments are viewable by everyone" on post_comments for select using (true);
create policy "Authenticated users can create comments" on post_comments for insert with check (auth.uid() = user_id);
create policy "Users can update their own comments" on post_comments for update using (auth.uid() = user_id);
create policy "Users can delete their own comments" on post_comments for delete using (auth.uid() = user_id);

-- Messages: users can read/send their own messages
create policy "Users can view their messages" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on messages for insert with check (auth.uid() = sender_id);
create policy "Users can update their messages (mark read)" on messages for update using (auth.uid() = receiver_id);

-- Stories: users can view all stories, manage their own
create policy "Stories are viewable by everyone" on stories for select using (true);
create policy "Users can create their own stories" on stories for insert with check (auth.uid() = user_id);
create policy "Users can delete their own stories" on stories for delete using (auth.uid() = user_id);

-- Communities: everyone can read public ones, members can read private
create policy "Public communities are viewable by everyone" on communities for select using (privacy = 'public');
create policy "Members can view private communities" on communities for select using (exists (select 1 from community_members where community_members.community_id = communities.id and community_members.user_id = auth.uid()));
create policy "Authenticated users can create communities" on communities for insert with check (auth.uid() = creator_id);
create policy "Creators can update their communities" on communities for update using (auth.uid() = creator_id);

-- Community members: admins can manage, members can view
create policy "Members can view community members" on community_members for select using (exists (select 1 from community_members cm where cm.community_id = community_members.community_id and cm.user_id = auth.uid()));
create policy "Admins can add members" on community_members for insert with check (exists (select 1 from community_members cm where cm.community_id = community_members.community_id and cm.user_id = auth.uid() and cm.role = 'admin'));
create policy "Admins can remove members" on community_members for delete using (exists (select 1 from community_members cm where cm.community_id = community_members.community_id and cm.user_id = auth.uid() and cm.role = 'admin'));

-- Online status: users can manage their own
create policy "Users can update their online status" on online_status for all using (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

-- Notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  from_user_id uuid references profiles(id) on delete cascade not null,
  type text check (type in ('friend_request', 'friend_accepted', 'post_like', 'comment', 'story_view', 'community_join', 'message')) not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on notifications
alter table notifications enable row level security;

-- Notifications: users can read their own, create via trigger
create policy "Users can view their notifications" on notifications for select using (auth.uid() = user_id);
create policy "Notifications are insertable by system" on notifications for insert with check (true);
create policy "Users can update their notifications" on notifications for update using (auth.uid() = user_id);

-- Index for faster queries
create index idx_notifications_user_read on notifications(user_id, is_read);
create index idx_notifications_created on notifications(created_at desc);

-- ============================================
-- TRIGGERS
-- ============================================

-- Create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', new.email);
  
  insert into public.online_status (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Auto-create notification on friend request
create or replace function public.handle_friend_request_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, from_user_id, type, title, message, metadata)
  values (
    new.to_user,
    new.from_user,
    'friend_request',
    'New Friend Request',
    coalesce((select full_name from profiles where id = new.from_user), 'Someone') || ' sent you a friend request',
    '{"request_id": new.id::text}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_friend_request_created
  after insert on friend_requests
  for each row execute procedure public.handle_friend_request_notification();

-- Auto-create notification on friend accepted
create or replace function public.handle_friend_accepted_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, from_user_id, type, title, message, metadata)
  values (
    new.from_user,
    new.to_user,
    'friend_accepted',
    'Friend Request Accepted',
    coalesce((select full_name from profiles where id = new.to_user), 'Someone') || ' accepted your friend request',
    '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_friend_accepted
  after update of status on friend_requests
  for each row execute procedure public.handle_friend_accepted_notification()
  when (new.status = 'accepted');

-- Auto-create notification on post like
create or replace function public.handle_post_like_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, from_user_id, type, title, message, metadata)
  values (
    (select author_id from posts where id = new.post_id),
    new.user_id,
    'post_like',
    'Post Liked',
    coalesce((select full_name from profiles where id = new.user_id), 'Someone') || ' liked your post',
    '{"post_id": new.post_id}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_post_like_created
  after insert on post_likes
  for each row execute procedure public.handle_post_like_notification();

-- Auto-create notification on comment
create or replace function public.handle_comment_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, from_user_id, type, title, message, metadata)
  values (
    (select author_id from posts where id = new.post_id),
    new.user_id,
    'comment',
    'New Comment',
    coalesce((select full_name from profiles where id = new.user_id), 'Someone') || ' commented on your post',
    '{"post_id": new.post_id}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_comment_created
  after insert on post_comments
  for each row execute procedure public.handle_comment_notification();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger handle_profiles_updated_at
  before update on profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_posts_updated_at
  before update on posts
  for each row execute procedure public.handle_updated_at();

create trigger handle_friend_requests_updated_at
  before update on friend_requests
  for each row execute procedure public.handle_updated_at();

create trigger handle_communities_updated_at
  before update on communities
  for each row execute procedure public.handle_updated_at();
