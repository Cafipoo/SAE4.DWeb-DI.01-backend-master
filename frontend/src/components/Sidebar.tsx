import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import TweetModal from './TweetModal';
import Button from './Button';
import Logo from './Logo';
import { DataRequests, User } from '../data/data-requests';
import AuthService from '../services/auth.service';
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
  const [user, setUser] = useState<User | null>(null);
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await DataRequests.getCurrentUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleTweetSuccess = () => {
    if (location.pathname === "/home") {
      window.dispatchEvent(new CustomEvent('tweet-created'));
    }
  };

  if (!user) {
    return null; // ou un loader si vous préférez
  }

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
          <Link to="/home" className="inline-block p-3 rounded-full hover:bg-red-900">
            <Logo />
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
            <Button
              variant="default"
              size="xl"
              rounded="full"
              onClick={() => setIsTweetModalOpen(true)}
              className="mt-2 px-2"
            >
              Tweet
            </Button>
            <Button
              variant="default"
              size="xl"
              rounded="full"
              onClick={() => AuthService.logout()}
              className="mt-2 px-2"
            >
              Se déconnecter
            </Button>
        </nav>
        

        {/* <div className="p-4 mt-auto border-t border-gray-800">
          <button className="flex items-center w-full gap-3 p-3 rounded-full hover:bg-gray-900 transition-colors">
            <img
              src={user.avatar || ''}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 text-left">
              <div className="font-bold text-white">{user.name}</div>
              <div className="text-gray-500">@{user.username}</div>
            </div>
            <Icon name="more" className="w-5 h-5 text-gray-500" />
          </button>
        </div> */}
      </div>

      <TweetModal
        isOpen={isTweetModalOpen}
        onClose={() => setIsTweetModalOpen(false)}
        onTweetSuccess={handleTweetSuccess}
      />
    </>
  );
};

export default Sidebar; 