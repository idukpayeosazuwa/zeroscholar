import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CommunityPost, Reply, UserProfile } from '../types';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

// New Avatar Component
const Avatar: React.FC<{ name: string, size?: 'sm' | 'md' }> = ({ name, size = 'md' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-600', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = (name.charCodeAt(0) || 0) % colors.length;
    const color = colors[colorIndex];
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';

    return (
        <div className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${color} ${sizeClasses}`}>
            {initial}
        </div>
    );
};

// New Replies Component
const PostReplies: React.FC<{ postId: string }> = ({ postId }) => {
    const [replies, setReplies] = useState<Reply[]>([]);

    useEffect(() => {
        const repliesQuery = query(
            collection(db, 'communityPosts', postId, 'replies'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
            const repliesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reply));
            setReplies(repliesData);
        });

        return () => unsubscribe();
    }, [postId]);
    
    if (replies.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {replies.map(reply => (
                <div key={reply.id} className="flex items-start">
                    <Avatar name={reply.author} size="sm" />
                    <div className="ml-3 bg-gray-100 rounded-lg px-3 py-2 w-full">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-gray-800">{reply.author}</p>
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


const formatTimestamp = (timestamp: Timestamp): string => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

interface CommunityBoardProps {
  user: User;
  userProfile: UserProfile;
}

const CommunityBoard: React.FC<CommunityBoardProps> = ({ user, userProfile }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState('General');
  const [isLoading, setIsLoading] = useState(true);
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: CommunityPost[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as CommunityPost);
      });
      setPosts(postsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim() === '') return;

    const newPost = {
      author: userProfile.fullName,
      authorId: user.uid,
      tag: newPostTag,
      content: newPostContent,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'communityPosts'), newPost);
      setNewPostContent('');
      setNewPostTag('General');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handlePostReply = async (postId: string) => {
    if (replyContent.trim() === '') return;
    
    try {
      const replyRef = collection(db, 'communityPosts', postId, 'replies');
      await addDoc(replyRef, {
          author: userProfile.fullName,
          authorId: user.uid,
          content: replyContent,
          timestamp: serverTimestamp(),
      });
      
      setReplyContent('');
      setActiveReplyPostId(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-blue-500" />
        <h2 className="text-3xl font-bold text-gray-800 mt-2">Scholar Community</h2>
        <p className="text-gray-500 mt-1">Share tips, ask questions, and connect with fellow scholars.</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handleAddPost}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder={`What's on your mind, ${userProfile.fullName.split(' ')[0]}?`}
          ></textarea>
          <div className="flex justify-between items-center mt-2">
            <input 
              type="text"
              value={newPostTag}
              onChange={(e) => setNewPostTag(e.target.value)}
              placeholder="Tag (e.g., 'Agbami 2025')"
              className="p-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Post
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                {post.avatar ? <div className="text-2xl mt-1">{post.avatar}</div> : <Avatar name={post.author} />}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800">{post.author}</span>
                      <span className="text-sm text-gray-400 ml-2">{formatTimestamp(post.timestamp)}</span>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{post.tag}</span>
                  </div>
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>

              {/* Actions and Reply Form */}
              <div className="mt-4 pl-14">
                <button 
                  onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id!)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>

                {activeReplyPostId === post.id && (
                  <form onSubmit={(e) => { e.preventDefault(); handlePostReply(post.id!); }} className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-grow p-2 border border-gray-300 rounded-full text-sm focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </form>
                )}
              </div>

              {/* Replies Section */}
              <PostReplies postId={post.id!} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityBoard;
