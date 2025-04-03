import { Link, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { DataRequests, Post, PostInteraction } from '../data/data-requests';
import { useEffect, useState } from 'react';
import DeleteModal from './DeleteModal';
import EditTweetModal from './EditTweetModal';
import MediaViewer from './MediaViewer';
import RetweetModal from './RetweetModal';

interface TweetProps {
  post: Post & {
    reposts?: number;
    replies?: number;
    isLiked?: boolean;
    isFollowed?: boolean;
    isPinned?: boolean;
    author?: {
      id: number;
      name: string;
      username: string;
      avatar: string;
      banned: boolean;
      lecture?: boolean;
    };
  };
  onDelete?: (postId: number) => void;
  onFollowUpdate?: (userId: number, isFollowed: boolean) => void;
  onEdit?: (editedPost: Post) => void;
  onPin?: (postId: number) => void;
  showPinButton?: boolean;
  onHashtagClick?: (hashtag: string) => void;
  onRetweet?: (postId: number, comment?: string) => void;
}

const Tweet = ({ post, onDelete, onFollowUpdate, onEdit, onPin, showPinButton = false, onHashtagClick, onRetweet }: TweetProps) => {
  let name = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(post.isFollowed || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post>({
    ...post,
    comments: Array.isArray(post.comments) ? post.comments : 
             typeof post.comments === 'object' && post.comments !== null ? 
             Object.values(post.comments) : []
  });
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRetweetModalOpen, setIsRetweetModalOpen] = useState(false);
  const [isRetweeting, setIsRetweeting] = useState(false);
  
  useEffect(() => {
    if (name.id) {
      // Vérifier si liked_by est un tableau avant d'utiliser includes
      const likedByArray = Array.isArray(post.liked_by) ? post.liked_by : [];
      setIsLiked(likedByArray.includes(name.id));
      setIsFollowed(post.isFollowed || false);
    }
    setCurrentPost({
      ...post,
      comments: Array.isArray(post.comments) ? post.comments : 
               typeof post.comments === 'object' && post.comments !== null ? 
               Object.values(post.comments) : []
    });
  }, [name.id, post]);
  
  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setError(null);
      const response = await DataRequests.addComment(post.id, name.id, newComment);
      const updatedComments = [...(Array.isArray(currentPost.comments) ? currentPost.comments : 
                                 typeof currentPost.comments === 'object' && currentPost.comments !== null ? 
                                 Object.values(currentPost.comments) : [])];
      const existingCommentIndex = updatedComments.findIndex((c: any) => c.user.id === name.id);
      
      if (existingCommentIndex !== -1) {
        updatedComments[existingCommentIndex] = response;
      } else {
        updatedComments.push(response);
      }
      
      setCurrentPost({ ...currentPost, comments: updatedComments as PostInteraction[] });
      setNewComment('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout du commentaire');
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await DataRequests.deletePost(post.id);
      // Appeler la fonction onDelete pour mettre à jour l'interface
      if (onDelete) {
        onDelete(post.id);
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
    }
  };

  const handleLike = async () => {
    try {
      setError(null);
      
      
      await DataRequests.likePost(post.id, name.id, isLiked);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de like:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout du like');
    }
  };

  const handleEditSuccess = (editedPost: Post) => {
    setCurrentPost(editedPost);
    if (onEdit) {
      onEdit(editedPost);
    }
  };

  const openMediaViewer = (index: number) => {
    setMediaViewerIndex(index);
    setIsMediaViewerOpen(true);
  };

  const handlePin = async () => {
    try {
      setError(null);
      if (onPin) {
        onPin(post.id);
      }
    } catch (error) {
      console.error('Erreur lors de l\'épinglage:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'épinglage');
    }
  };

  const handleRetweet = async (comment?: string) => {
    if (!onRetweet) return;
    
    try {
      setIsRetweeting(true);
      await onRetweet(post.id, comment);
      setIsRetweetModalOpen(false);
    } catch (error) {
      console.error('Erreur lors du retweet:', error);
    } finally {
      setIsRetweeting(false);
    }
  };

  // Valeurs par défaut pour les données manquantes
  const defaultAuthor = {
    name: "Utilisateur",
    username: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    banned: false
  };

  const author = currentPost.author || defaultAuthor;
  const reposts = currentPost.reposts || 0;
  const replies = currentPost.replies || 0;

  const processText = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-blue-500 font-bold hover:underline cursor-pointer"
            onClick={() => onHashtagClick && onHashtagClick(part)}
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <Link
            key={index}
            to={`/profile/${username}`}
            className="text-blue-500 font-bold hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <>
      {author && author.banned === true ? (
        <div className="border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
          <p className="text-white">Le propriétaire de ce tweet a été banni</p>
        </div>
      ) : 
      currentPost.censored && !currentPost.retweet ? (
        <div className="border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
          <p className="text-white">Ce tweet a été censuré</p>
        </div>
      ) : (
        <>
          <article className={`border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer ${post.isPinned ? 'bg-gray-900/30' : ''}`}>
            {currentPost.retweet && !currentPost.content && (
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <Icon name="repost" className="w-4 h-4 mr-2" />
                <span>Retweeté par {author.name}</span>
              </div>
            )}
            <div className="flex gap-4">
              <img
                src={`http://localhost:8080/uploads/avatar/${author.avatar}`}
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
                  <time className="text-gray-500">{new Date(currentPost.created_at).toLocaleDateString()}</time>
                  {name.name === author.name ? (
                    <div className="flex gap-2">
                      {showPinButton && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={handlePin}
                        >
                          <Icon name={post.isPinned ? "pinned" : "pin"} />
                        </Button>
                      )}
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Icon name="edit" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => setIsDeleteModalOpen(true)}
                      >
                        <Icon name="delete" />
                      </Button>
                    </div>
                  ) : (
                    null
                  )}
                </div>
                {currentPost.retweet && currentPost.content && (
                  <div className="mb-4">
                    <p className="text-white mb-3 break-all break-words whitespace-pre-wrap overflow-hidden max-w-full">
                      {processText(currentPost.content)}
                    </p>
                  </div>
                )}
                {currentPost.retweet ? (
                  <div className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={`http://localhost:8080/uploads/avatar/${currentPost.original_post?.author.avatar}`}
                        alt={currentPost.original_post?.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <span className="font-bold text-white">{currentPost.original_post?.author.name}</span>
                        <span className="text-gray-500 ml-2">@{currentPost.original_post?.author.username}</span>
                      </div>
                    </div>
                    <p className="text-white mb-3 break-all break-words whitespace-pre-wrap overflow-hidden max-w-full">
                      {processText(currentPost.original_post?.content || '')}
                    </p>
                    {currentPost.original_post?.media && currentPost.original_post.media.length > 0 && (
                      <div className="mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          {currentPost.original_post.media.map((mediaUrl, index) => {
                            const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);
                            return (
                              <div key={index} className="relative">
                                {isVideo ? (
                                  <video
                                    src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                    onClick={() => {
                                      setMediaViewerIndex(index);
                                      setIsMediaViewerOpen(true);
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                    alt={`Média ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                    onClick={() => {
                                      setMediaViewerIndex(index);
                                      setIsMediaViewerOpen(true);
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-white mb-3 break-all break-words whitespace-pre-wrap overflow-hidden max-w-full">
                        {processText(currentPost.content)}
                      </p>
                    </div>
                    {currentPost.media && currentPost.media.length > 0 && (
                      <div className="mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          {currentPost.media.map((mediaUrl, index) => {
                            const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);
                            return (
                              <div key={index} className="relative">
                                {isVideo ? (
                                  <video
                                    src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                    onClick={() => {
                                      setMediaViewerIndex(index);
                                      setIsMediaViewerOpen(true);
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                    alt={`Média ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                    onClick={() => {
                                      setMediaViewerIndex(index);
                                      setIsMediaViewerOpen(true);
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {author.lecture === false || author.lecture === null && (
                  <div className="flex justify-between text-gray-500 max-w-md">
                    <Button 
                      className="bg-transparent flex items-center gap-2 hover:text-blue-500 transition-colors"
                      onClick={() => setIsCommenting(!isCommenting)}
                    >
                      <Icon name="reply" className="w-5 h-5" />
                      <span>{replies}</span>
                    </Button>
                    <Button 
                      className="bg-transparent flex items-center gap-2 hover:text-green-500 transition-colors"
                      onClick={() => setIsRetweetModalOpen(true)}
                      disabled={isRetweeting}
                    >
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
                )}
                {/* Commentaires */}
                <div className="mt-4 space-y-4">
                  {Array.isArray(currentPost.comments) && currentPost.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.user.avatar || '/default-avatar.png'}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full text-white"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{comment.user.name}</span>
                          <span className="text-secondary">@{comment.user.username}</span>
                          <span className="text-secondary">·</span>
                          <span className="text-secondary">
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="mt-1 text-white">{comment.comments}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zone de commentaire */}
                {isCommenting && (
                    <div className="mt-4">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Écrire un commentaire..."
                            className="w-full p-2 border rounded-lg resize-none text-white"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsCommenting(false);
                                    setNewComment('');
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleComment}
                                disabled={!newComment.trim()}
                            >
                                Commenter
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </article>

          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
          />
          
          <EditTweetModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            post={currentPost}
            onEditSuccess={handleEditSuccess}
          />

          <MediaViewer
            isOpen={isMediaViewerOpen}
            onClose={() => setIsMediaViewerOpen(false)}
            media={currentPost.media || []}
            initialIndex={mediaViewerIndex}
          />

          <RetweetModal
            isOpen={isRetweetModalOpen}
            onClose={() => setIsRetweetModalOpen(false)}
            onRetweet={handleRetweet}
            postContent={currentPost.content}
            authorName={author.name}
            authorUsername={author.username}
          />
        </>
      )}
    </>
  );
};

export default Tweet; 