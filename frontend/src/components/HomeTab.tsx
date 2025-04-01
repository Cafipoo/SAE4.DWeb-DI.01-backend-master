import { useState } from 'react';
import Button from '../ui/Button';

interface HomeTabProps {
  onTabChange: (tab: 'all' | 'following') => void;
  currentTab: 'all' | 'following';
}

const HomeTab = ({ onTabChange, currentTab }: HomeTabProps) => {
  return (
    <div className="flex border-b border-secondary">
      <Button
        onClick={() => onTabChange('all')}
        className={`flex-1 rounded-none bg-transparent text-center hover:bg-black/50 transition-colors ${
          currentTab === 'all' 
            ? 'text-white border-b-2 border-blue font-bold' 
            : 'text-secondary'
        }`}
      >
        Tous les posts
      </Button>
      <Button
        onClick={() => onTabChange('following')}
        className={`flex-1 rounded-none bg-transparent text-center hover:bg-black/50 transition-colors ${
          currentTab === 'following' 
            ? 'text-white border-b-2 border-blue font-bold' 
            : 'text-secondary'
        }`}
      >
        Vos abonnements
      </Button>
    </div>
  );
};

export default HomeTab; 