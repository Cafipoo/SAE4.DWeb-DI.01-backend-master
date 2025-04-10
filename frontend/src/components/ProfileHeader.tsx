import Button from "../ui/Button";
import { useState } from "react";

interface ProfileHeaderProps {
  coverImage: string | null;
  avatar: string | null;
  displayName: string;
  username: string;
}

const ProfileHeader = ({ coverImage, avatar, displayName, username }: ProfileHeaderProps) => {
  const [localAvatar, ] = useState<string>(avatar || '');
  const [localCover, ] = useState<string>(coverImage || '');
  const [error, ] = useState<string | null>(null);

  return (
    <>
      <div className="h-48 relative">
        {localCover ? (
          <img
            src={`http://localhost:8080/uploads/covers/${localCover}`}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
          className="w-full h-full bg-bg flex items-center justify-center"
        >
          <span className="text-white text-xl font-semibold">Banner</span>
        </div>
        )}
      </div>
      <div className="px-4">
        <div className="relative -mt-16 mb-4">
          {localAvatar ? (
            <img
              src={`http://localhost:8080/uploads/avatar/${localAvatar}`}
              alt={displayName}
              className="w-32 h-32 rounded-full border-4 border-black bg-black"
            />
          ) : (
            <img 
              src="/src/assets/default-avatar.webp"
              alt="Avatar" 
              className="w-32 h-32 rounded-full border-4 border-black bg-black"
            />
          )}
        </div>
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-gray-500">@{username}</p>
          </div>
          <Button variant="secondary" size="default" rounded="full">Éditer le profil</Button>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader; 