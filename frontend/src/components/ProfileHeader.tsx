import Button from "../ui/Button";
import { useState } from "react";

interface ProfileHeaderProps {
  coverImage: string;
  avatar: string;
  displayName: string;
  username: string;
}

const ProfileHeader = ({ coverImage, avatar, displayName, username }: ProfileHeaderProps) => {
  const [localAvatar, setLocalAvatar] = useState<string>(avatar);
  const [localCover, setLocalCover] = useState<string>(coverImage);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setError(null);
      const response = await fetch(`/profile/${username}/avatar`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      if (data.avatar && data.mimeType) {
        setLocalAvatar(`data:${data.mimeType};base64,${data.avatar}`);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cover', file);

    try {
      setError(null);
      const response = await fetch(`/profile/${username}/cover`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      if (data.cover && data.mimeType) {
        setLocalCover(`data:${data.mimeType};base64,${data.cover}`);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <>
      <div className="h-48 relative">
        {localCover ? (
          <img 
            src={localCover} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Ajouter une photo de couverture
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </label>
          </div>
        )}
      </div>
      <div className="px-4">
        <div className="relative -mt-16 mb-4">
          {localAvatar ? (
            <img
              src={localAvatar}
              alt={displayName}
              className="w-32 h-32 rounded-full border-4 border-black bg-black"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-200 flex items-center justify-center">
              <label className="cursor-pointer text-center">
                <span className="block text-sm mb-2">Ajouter une photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
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