import React, { useState, useEffect } from 'react';
import { Models, Query, RealtimeResponseEvent } from 'appwrite';
import { client, databases, ID, DATABASE_ID, POSTS_COLLECTION_ID } from '../appwriteConfig';
import { CommunityPost, Reply, UserProfile } from '../types';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

// This would be a separate replies collection in a real app, but for simplicity, we'll mock it on the client
const PostReplies: React.FC<{ postId: string, user: Models.User<Models.Preferences>, userProfile: UserProfile }> = ({ postId, user, userProfile }) => {
    // This is a simplified version. A full implementation would involve another collection and real-time subscription.
    return null;
};


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


const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
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
  user: Models.User<Models.Preferences>;
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
    const fetchPosts = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                POSTS_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            setPosts(response.documents as unknown as CommunityPost[]);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchPosts();

    const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${POSTS_COLLECTION_ID}.documents`, (response: RealtimeResponseEvent<CommunityPost>) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            setPosts(prevPosts => [response.payload, ...prevPosts]);
        }
    });

    return () => unsubscribe();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim() === '') return;

    const newPost = {
      author: userProfile.fullName,
      authorId: user.$id,
      tag: newPostTag,
      content: newPostContent,
      avatar: '' // field no longer used
    };

    try {
      await databases.createDocument(DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), newPost);
      setNewPostContent('');
      setNewPostTag('General');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  
  // Note: Appwrite doesn't have subcollections. Replies would typically be in their own collection
  // with a relationship to the parent post. This is a simplified implementation.
  const handlePostReply = async (postId: string) => {
    if (replyContent.trim() === '') return;
    console.log("Replying is a premium feature in this simplified Appwrite migration.");
    setReplyContent('');
    setActiveReplyPostId(null);
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
            <div key={post.$id} className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar name={post.author} />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800">{post.author}</span>
                      <span className="text-sm text-gray-400 ml-2">{formatTimestamp(post.$createdAt)}</span>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{post.tag}</span>
                  </div>
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>

              {/* Actions and Reply Form */}
              <div className="mt-4 pl-14">
                <button 
                  onClick={() => setActiveReplyPostId(activeReplyPostId === post.$id ? null : post.$id!)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>

                {activeReplyPostId === post.$id && (
                  <form onSubmit={(e) => { e.preventDefault(); handlePostReply(post.$id!); }} className="mt-2 flex items-center gap-2">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityBoard;