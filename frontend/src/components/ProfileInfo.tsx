import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import Button from '../ui/Button';
import { DataRequests } from '../data/data-requests';
import AuthService from '../services/auth.service';

interface ProfileInfoProps {
  bio: string;
  location?: string;
  website?: string;
  joinedDate: string;
  stats: {
    following: number;
    followers: number;
  };
  userId: number;
  isInitiallyFollowed?: boolean;
  isInitiallyBanned?: boolean;
  onFollowUpdate?: (userId: number, isFollowed: boolean) => void;
  onBannedUpdate?: (userId: number, isBanned: boolean) => void;
}

const ProfileInfo = ({ 
  bio, 
  location, 
  website, 
  joinedDate, 
  stats, 
  userId,
  isInitiallyFollowed = false,
  isInitiallyBanned = false,
  onFollowUpdate,
  onBannedUpdate 
}: ProfileInfoProps) => {
  const [isFollowed, setIsFollowed] = useState(isInitiallyFollowed);
  const [isBanned, setIsBanned] = useState(isInitiallyBanned);

  const handleFollow = async () => {
    try {
      const currentUserId = AuthService.getUserId();
      if (!currentUserId) {
        console.error('Utilisateur non connecté');
        return;
      }

      // Vérifier si l'utilisateur est banni
      if (isBanned) {
        console.error('Vous ne pouvez pas suivre un utilisateur banni');
        return;
      }

      const currentIsFollowed = isFollowed;
      setIsFollowed(!currentIsFollowed);
      console.log(currentUserId, userId, currentIsFollowed);
      await DataRequests.followUser(currentUserId, userId, currentIsFollowed);

      if (onFollowUpdate) {
        onFollowUpdate(userId, currentIsFollowed);
      }
    } catch (error) {
      setIsFollowed(isFollowed);
      console.error('Erreur lors du suivi:', error);
    }
  };

  const handleBanned = async () => {
    try {
      const currentUserId = AuthService.getUserId();
      if (!currentUserId) {
        console.error('Utilisateur non connecté');
        return;
      }

      const currentIsBanned = isBanned;
      setIsBanned(!currentIsBanned);
      console.log(currentUserId, userId, currentIsBanned);
      
      await DataRequests.bannedUser(currentUserId, userId, currentIsBanned);
      if (currentIsBanned === false) {
        setIsFollowed(false);
      }
      if (onBannedUpdate) {
        onBannedUpdate(userId, currentIsBanned);
      }
    } catch (error) {
      setIsBanned(isBanned);
      console.error('Erreur lors du suivi:', error);
    }
  };

  return (
    <div className="px-4">
      <p className="mb-4">{bio}</p>
      <div className="flex flex-wrap gap-4 text-secondary mb-4">
        {location && (
          <span className="flex items-center">
            <i className="fas fa-location-dot mr-2"></i>
            {location}
          </span>
        )}
        {website && (
          <a href={website} className="flex items-center text-blue-400 hover:underline">
            <i className="fas fa-link mr-2"></i>
            {website.replace('https://', '')}
          </a>
        )}
        <span className="flex items-center">
          <i className="far fa-calendar mr-2"></i>
          A rejoint {format(new Date(joinedDate), 'MMMM yyyy', { locale: fr })}
        </span>
      </div>
      {userId !== AuthService.getUserId() && 
        <>
        <Button 
          variant={isFollowed ? "secondary" : "tertiary"} 
          size="sm" 
          rounded="full"
          onClick={handleFollow}
          disabled={isBanned}
        >
          {isFollowed ? "Ne plus suivre" : "Suivre"}
        </Button>
        <Button 
          variant={isBanned ? "secondary" : "default"} 
          size="sm" 
          rounded="full"
          onClick={handleBanned}
        >
          {isBanned ? "Débloquer" : "Bloquer"}
        </Button>
        </>
      }
      <div className="flex gap-4 mb-4">
        <span>
          <strong>{stats.following}</strong>{' '}
          <span className="text-secondary">abonnements</span>
        </span>
        <span>
          <strong>{stats.followers}</strong>{' '}
          <span className="text-secondary">abonnés</span>
        </span>
      </div>
    </div>
  );
};

export default ProfileInfo; 