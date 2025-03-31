import { useState } from 'react';
import Button from '../ui/Button';

interface HomeTabProps {
  onTabChange: (tab: 'all' | 'following') => void;
  currentTab: 'all' | 'following';
}

const HomeTab = ({ onTabChange, currentTab }: HomeTabProps) => {
  return (
    <div className="flex border-b border-gray-700">
      <Button
        onClick={() => onTabChange('all')}
        className={`flex-1 rounded-none bg-transparent text-center hover:bg-gray-800/50 transition-colors ${
          currentTab === 'all' 
            ? 'text-white border-b-2 border-blue-500 font-bold' 
            : 'text-gray-500'
        }`}
      >
        Tous les posts
      </Button>
      <Button
        onClick={() => onTabChange('following')}
        className={`flex-1 rounded-none bg-transparent text-center hover:bg-gray-800/50 transition-colors ${
          currentTab === 'following' 
            ? 'text-white border-b-2 border-blue-500 font-bold' 
            : 'text-gray-500'
        }`}
      >
        Vos abonnements
      </Button>
    </div>
  );
};

export default HomeTab; 