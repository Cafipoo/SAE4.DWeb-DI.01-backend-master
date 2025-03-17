interface ProfileHeaderProps {
  coverImage: string;
  avatar: string;
  displayName: string;
  username: string;
}

const ProfileHeader = ({ coverImage, avatar, displayName, username }: ProfileHeaderProps) => {
  return (
    <>
      <div className="h-48 relative">
        <img 
          src={coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-4">
        <div className="relative -mt-16 mb-4">
          <img
            src={avatar}
            alt={displayName}
            className="w-32 h-32 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-gray-500">@{username}</p>
          </div>
          <button className="px-4 py-2 rounded-full border border-gray-600 hover:bg-gray-900">
            Éditer le profil
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader; 