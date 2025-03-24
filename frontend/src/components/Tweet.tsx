import { Link, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { DataRequests } from '../data/data-requests';
import { useEffect, useState } from 'react';
import DeleteModal from './DeleteModal';


interface TweetProps {
  post: {
    id: number;
    content: string;
    created_at: string;
    author?: {
      id: number;
      name: string;
      username: string;
      avatar: string;
      banned: boolean;
    };
    likes_count?: number;
    liked_by?: number[];
    media?: {
      url: string;
    };
    reposts?: number;
    replies?: number;
    isLiked?: boolean;
    isFollowed?: boolean;
  };
  onDelete?: (postId: number) => void;
}

const Tweet = ({ post, onDelete }: TweetProps) => {
  let name = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(post.isFollowed || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  
  useEffect(() => {
    if (name.id) {
      // Vérifier si liked_by est un tableau avant d'utiliser includes
      const likedByArray = Array.isArray(post.liked_by) ? post.liked_by : [];
      setIsLiked(likedByArray.includes(name.id));
      setIsFollowed(post.isFollowed || false);
    }
  }, [name.id, post.liked_by, post.isFollowed]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      await DataRequests.deletePost(post.id);
      // Appeler la fonction onDelete pour mettre à jour l'interface
      if (onDelete) {
        onDelete(post.id);
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      await DataRequests.likePost(post.id, name.id, isLiked);
    } catch (error) {
      // En cas d'erreur, on revient à l'état précédent
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      console.error('Erreur lors de l\'ajout de like:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (!post.author?.id) {
        console.error('ID de l\'auteur non disponible');
        return;
      }
      const currentIsFollowed = isFollowed;
      setIsFollowed(!currentIsFollowed);
      await DataRequests.followUser(name.id, post.author.id, currentIsFollowed);
    } catch (error) {
      // En cas d'erreur, on revient à l'état précédent
      setIsFollowed(!isFollowed);
      console.error('Erreur lors du suivi:', error);
    }
  };

  // Valeurs par défaut pour les données manquantes
  const defaultAuthor = {
    name: "Utilisateur",
    username: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    banned: false
  };

  const author = post.author || defaultAuthor;
  const reposts = post.reposts || 0;
  const replies = post.replies || 0;

  return (
    <>
      {author && author.banned === true ? (
        <div className="border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
          <p className="text-white">Le propriétaire de ce tweet a été banni</p>
        </div>
      ) : (
        <>
          <article className="border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
            <div className="flex gap-4">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {name.username === author.username ? (
                    <Link to={`/profile`} className="font-bold text-white hover:underline">
                      {author.name}
                    </Link>
                  ) : (
                    <Link to={`/profile/${author.username}`} className="font-bold text-white hover:underline">
                      {author.name}
                    </Link>
                  )}
                  <p className="text-gray-500"> @{author.username}</p>
                  <span className="text-gray-500">·</span>
                  <time className="text-gray-500">{new Date(post.created_at).toLocaleDateString()}</time>
                  {name.name === author.name ? (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      Supprimer
                    </Button>
                  ) : (
                    <Button 
                      variant={isFollowed ? "secondary" : "tertiary"} 
                      size="sm" 
                      rounded="full"
                      onClick={handleFollow}
                    >
                      {isFollowed ? "Ne plus suivre" : "Suivre"}
                    </Button>
                  )}
                </div>
                <p className="text-white mb-3">{post.content}</p>
                {post.media && (
                  <div className="mb-3 rounded-2xl overflow-hidden">
                    <img
                      src={post.media.url}
                      alt="Media content"
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <div className=" flex justify-between text-gray-500 max-w-md">
                  <Button className="bg-transparent flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <Icon name="reply" className="w-5 h-5" />
                    <span>{replies}</span>
                  </Button>
                  <Button className="bg-transparent  flex items-center gap-2 hover:text-green-500 transition-colors">
                    <Icon name="repost" className="w-5 h-5" />
                    <span>{reposts}</span>
                  </Button>
                  {isLiked ? (
                    <Button className="bg-transparent border-none flex items-center gap-2 fill-pink-500 text-pink-500 transition-colors" onClick={() => handleLike()}>
                      <Icon name="like" className="w-5 h-5" />
                      <span>{likesCount}</span>
                  </Button>
                  ) : (
                    <Button className="bg-transparent border-none flex items-center gap-2 hover:text-pink-400 transition-colors" onClick={() => handleLike()}>
                      <Icon name="like" className="w-5 h-5" />
                      <span>{likesCount}</span>
                    </Button>
                  )}
                  <Button className="bg-transparent border-none flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <Icon name="share" className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </article>

          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
          />
        </>
      )}
    </>
  );
};

export default Tweet; 