import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'reposts', label: 'Reposts' },
  { id: 'media', label: 'Médias' },
  { id: 'likes', label: 'J\'aime' }
];

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
  return (
    <div className="border-b border-gray-800">
      <nav className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-4 px-4 text-center hover:bg-gray-900/50 transition-colors relative ${
              activeTab === tab.id ? 'text-white font-bold' : 'text-gray-500'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs; 