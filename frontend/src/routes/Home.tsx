import { useState } from 'react';
import actuData from '../data/actu.json';
import Sidebar from '../components/Sidebar';
import Tweet from '../components/Tweet';
import TweetModal from '../components/TweetModal';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeline, setTimeline] = useState(actuData.timeline);

  const handleTweet = (content: string) => {
    // Simuler l'ajout d'un nouveau tweet
    const newTweet = {
      id: `tweet-${Date.now()}`,
      author: {
        name: "Mon Compte",
        username: "moncompte",
        avatar: "/avatars/default.jpg"
      },
      content,
      date: new Date().toISOString(),
      likes: 0,
      reposts: 0,
      replies: 0
    };

    setTimeline([newTweet, ...timeline]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-72 pb-16 md:pb-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Accueil</h1>
          </div>
        </div>

        {/* Tweet Box */}
        <div className="border-b border-gray-800 px-4 py-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full text-left text-gray-400 hover:text-white py-2"
          >
            Quoi de neuf ?
          </button>
        </div>

        {/* Timeline */}
        <div>
          {timeline.map(tweet => (
            <div key={tweet.id} className="px-4 py-3">
              <Tweet
                id={tweet.id}
                author={tweet.author}
                content={tweet.content}
                date={tweet.date}
                likes={tweet.likes}
                reposts={tweet.reposts}
                replies={tweet.replies}
                media={tweet.media}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tweet Modal */}
      <TweetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTweet={handleTweet}
      />

      {/* Mobile Tweet Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-4 bottom-20 md:hidden bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
};

export default Home;