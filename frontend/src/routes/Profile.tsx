import userData from '../data/user.json';
import ProfileHeader from '../components/ProfileHeader';
import ProfileInfo from '../components/ProfileInfo';
import Tweet from '../components/Tweet';
import Sidebar from '../components/Sidebar';

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  reposts: number;
  replies: number;
  media?: {
    type: string;
    url: string;
  };
}

const Profile = () => {
  // Fusionner tous les types de posts en une seule liste
  const allPosts = [
    ...userData.posts,
    ...(userData.mediaPost || []),
    ...(userData.reposts || []),
    ...(userData.likedPosts || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as Post[];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-72 pb-16 md:pb-0">
        <ProfileHeader
          coverImage={userData.coverImage}
          avatar={userData.avatar}
          displayName={userData.displayName}
          username={userData.username}
        />
        
        <ProfileInfo
          bio={userData.bio}
          location={userData.location}
          website={userData.website}
          joinedDate={userData.joinedDate}
          stats={userData.stats}
        />

        {/* Barre Posts */}
        <div className="border-b border-gray-800">
          <div className="px-4">
            <div className="text-white font-bold py-4">
              Posts
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="space-y-4 py-4">
            {allPosts.map(post => (
              <Tweet
                key={post.id}
                id={post.id}
                author={post.author}
                content={post.content}
                date={post.date}
                likes={post.likes}
                reposts={post.reposts}
                replies={post.replies}
                media={post.media}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 