import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import TweetModal from './TweetModal';
import userData from '../data/user.json';

const navItems = [
  { icon: "home", label: "Accueil", path: "/home" },
  { icon: "explore", label: "Explorer", path: "/explore" },
  { icon: "notifications", label: "Notifications", path: "/notifications" },
  { icon: "messages", label: "Messages", path: "/messages" },
  { icon: "profile", label: "Profil", path: "/profile" },
  { icon: "more", label: "Plus", path: "/more" }
];

const Sidebar = () => {
  const location = useLocation();
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);

  const handleTweet = (content: string) => {
    // Simuler l'ajout d'un tweet
    const newTweet = {
      id: String(Date.now()),
      content,
      date: new Date().toISOString(),
      likes: 0,
      reposts: 0,
      replies: 0
    };
    
    console.log('Nouveau tweet:', newTweet);
    // Ici vous ajouteriez la logique pour sauvegarder le tweet
  };

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 ${
                location.pathname === item.path ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Icon name={item.icon} className="w-7 h-7" />
            </Link>
          ))}
          <button
            onClick={() => setIsTweetModalOpen(true)}
            className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
          >
            <Icon name="compose" className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed h-screen w-72 bg-black border-r border-gray-800">
        {/* Logo avec alignement */}
        <div className="px-4">
          <Link to="/home" className="inline-block p-3 rounded-full hover:bg-gray-900">
            <Icon name="logo" className="w-8 h-8 text-white" />
          </Link>
        </div>

        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group flex items-center text-xl p-3 rounded-full hover:bg-gray-900 transition-colors ${
                    location.pathname === item.path
                      ? 'text-white font-bold'
                      : 'text-gray-500'
                  }`}
                >
                  <Icon name={item.icon} className="w-7 h-7" />
                  <span className="ml-4 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tweet Button */}
          <div className="mt-4 px-2">
            <button
              onClick={() => setIsTweetModalOpen(true)}
              className="w-full bg-blue-500 text-white rounded-full py-3 font-bold hover:bg-blue-600 transition-colors"
            >
              Tweet
            </button>
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 mt-auto border-t border-gray-800">
          <button className="flex items-center w-full gap-3 p-3 rounded-full hover:bg-gray-900 transition-colors">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=current-user"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 text-left">
              <div className="font-bold text-white">John Doe</div>
              <div className="text-gray-500">@johndoe</div>
            </div>
            <Icon name="more" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <TweetModal
        isOpen={isTweetModalOpen}
        onClose={() => setIsTweetModalOpen(false)}
        onTweet={handleTweet}
      />
    </>
  );
};

export default Sidebar; 