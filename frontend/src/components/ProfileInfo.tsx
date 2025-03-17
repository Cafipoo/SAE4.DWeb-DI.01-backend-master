import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProfileInfoProps {
  bio: string;
  location?: string;
  website?: string;
  joinedDate: string;
  stats: {
    following: number;
    followers: number;
  };
}

const ProfileInfo = ({ bio, location, website, joinedDate, stats }: ProfileInfoProps) => {
  return (
    <div className="px-4">
      <p className="mb-4">{bio}</p>
      <div className="flex flex-wrap gap-4 text-gray-500 mb-4">
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
      <div className="flex gap-4 mb-4">
        <span>
          <strong>{stats.following}</strong>{' '}
          <span className="text-gray-500">abonnements</span>
        </span>
        <span>
          <strong>{stats.followers}</strong>{' '}
          <span className="text-gray-500">abonnés</span>
        </span>
      </div>
    </div>
  );
};

export default ProfileInfo; 