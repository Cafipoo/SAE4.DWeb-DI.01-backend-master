import { useState } from 'react';
import { User } from '../data/data-requests';
import Button from '../ui/Button';

interface ProfileTabsProps {
  userId: number;
  activeTab: 'posts' | 'banned';
  onTabChange: (tab: 'posts' | 'banned') => void;
}

const ProfileTabs = ({ userId, activeTab, onTabChange }: ProfileTabsProps) => {
  return (
    <div className="border-b border-gray-800">
      <div className="flex">
        <Button
          onClick={() => onTabChange('posts')}
          className={`flex-1 py-4 px-4 text-center font-bold transition-colors rounded-none bg-transparent ${
            activeTab === 'posts'
              ? 'text-white border-b-2 border-primary'
              : 'text-secondary hover:text-white'
          }`}
        >
          Posts
        </Button>
        <Button
          onClick={() => onTabChange('banned')}
          className={`flex-1 py-4 px-4 text-center font-bold transition-colors rounded-none bg-transparent ${
            activeTab === 'banned'
              ? 'text-white border-b-2 border-primary'
              : 'text-secondary hover:text-white'
          }`}
        >
          Utilisateurs bannis
        </Button>
      </div>
    </div>
  );
};

export default ProfileTabs; 