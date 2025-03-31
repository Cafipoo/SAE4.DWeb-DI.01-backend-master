import Button from "../ui/Button";
import { useState } from "react";
import {DataRequests} from "../data/data-requests";

interface ProfileHeaderProps {
  coverImage: string | null;
  avatar: string | null;
  displayName: string;
  username: string;
}

const ProfileHeader = ({ coverImage, avatar, displayName, username }: ProfileHeaderProps) => {
  const [localAvatar, setLocalAvatar] = useState<string>(avatar || '');
  const [localCover, setLocalCover] = useState<string>(coverImage || '');
  const [error, setError] = useState<string | null>(null);

  // const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append('avatar', file);

  //   try {
  //     setError(null);
  //     const response = await fetch(`/profile/${username}/avatar`, {
  //       method: 'POST',
  //       body: formData
  //     });

  //     const data = await response.json();
      
  //     if (!response.ok) {
  //       throw new Error(data.error || 'Une erreur est survenue');
  //     }

  //     if (data.avatar && data.mimeType) {
  //       setLocalAvatar(`data:${data.mimeType};base64,${data.avatar}`);
  //     } else {
  //       throw new Error('Réponse invalide du serveur');
  //     }
  //   } catch (error) {
  //     console.error('Error uploading avatar:', error);
  //     setError(error instanceof Error ? error.message : 'Une erreur est survenue');
  //   }
  // };

  // const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   console.log('Tentative d\'upload d\'une image de couverture:', file.name, 'taille:', file.size, 'type:', file.type);

  //   try {
  //     setError(null);
  //     const data = await DataRequests.uploadCover(username, file);
      
  //     console.log('Réponse de uploadCover:', data);
      
  //     // Priorité à l'URL si elle est disponible
  //     if (data.coverUrl) {
  //       // Utiliser l'URL complète
  //       setLocalCover(data.coverUrl);
  //     } else if (data.cover && data.mimeType) {
  //       // Fallback sur les données base64
  //       setLocalCover(`data:${data.mimeType};base64,${data.cover}`);
  //     } else {
  //       throw new Error('Réponse invalide du serveur');
  //     }
  //   } catch (error) {
  //     console.error('Error uploading cover:', error);
  //     setError(error instanceof Error ? error.message : 'Une erreur est survenue');
  //   }
  // };

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
          <img 
            src="./assets/images/default-cover.webp"
            alt="Cover" 
            className="w-full h-full object-cover"
          />
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