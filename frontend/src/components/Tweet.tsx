import { Link, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { DataRequests, Post, PostInteraction } from '../data/data-requests';
import { useEffect, useState } from 'react';
import DeleteModal from './DeleteModal';
import EditTweetModal from './EditTweetModal';
import MediaViewer from './MediaViewer';
import RetweetModal from './RetweetModal';
import EditCommentModal from './EditCommentModal';
import EditRetweetModal from './EditRetweetModal';

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
      privateMode?: boolean;
      isLimited?: boolean;
    };
  };
  onDelete?: (postId: number) => void;
  onFollowUpdate?: (userId: number, isFollowed: boolean) => void;
  onEdit?: (editedPost: Post) => void;
  onPin?: (postId: number) => void;
  onUnpin?: (postId: number) => void;
  showPinButton?: boolean;
  onHashtagClick?: (hashtag: string) => void;
  onRetweet?: (postId: number, comment?: string) => void;
}

const Tweet = ({ post, onDelete, onFollowUpdate, onEdit, onPin, onUnpin, showPinButton = false, onHashtagClick, onRetweet }: TweetProps) => {
  let name = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(post.isFollowed || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<PostInteraction | null>(null);
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
  const [isEditRetweetModalOpen, setIsEditRetweetModalOpen] = useState(false);
  
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

  const handleEditComment = async (commentId: number, newContent: string) => {
    try {
      setError(null);
      if (!currentPost.comments) return;
      
      const response = await DataRequests.editComment(commentId, newContent);
      const updatedComments = currentPost.comments.map((comment: PostInteraction) => 
        comment.id === commentId ? response : comment
      );
      setCurrentPost({ ...currentPost, comments: updatedComments });
      setIsEditCommentModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'édition du commentaire:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'édition du commentaire');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      setError(null);
      if (!currentPost.comments) return;
      
      await DataRequests.deleteComment(commentId);
      // Mettre à jour les commentaires en filtrant celui qui a été supprimé
      const updatedComments = currentPost.comments.filter((comment: PostInteraction) => 
        comment.id !== commentId
      );
      setCurrentPost({ ...currentPost, comments: updatedComments });
      setIsDeleteCommentModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du commentaire');
    }
  };

  const handleLockUnlock = async () => {
    try {
      if (currentPost.isLocked) {
        await DataRequests.unlockPost(currentPost.id);
        setCurrentPost(prev => ({ ...prev, isLocked: false }));
      } else {
        await DataRequests.lockPost(currentPost.id);
        setCurrentPost(prev => ({ ...prev, isLocked: true }));
      }
    } catch (error) {
      console.error('Erreur lors du verrouillage/déverrouillage du post:', error);
      // Vous pouvez ajouter une notification d'erreur ici si vous le souhaitez
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
              <div className="flex items-center text-secondary text-sm mb-2">
                <Icon name="repost" className="w-4 h-4 mr-2" />
                <span>Retweeté par {author.name}</span>
              </div>
            )}
            <div className="flex gap-4">
              {author.avatar === null ? (
                <img
                  src={`src/assets/default-avatar.webp`}
                  alt={author.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <img
                  src={`http://localhost:8080/uploads/avatar/${author.avatar}`}
                  alt={author.name}
                  className="w-12 h-12 rounded-full"
              />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Link to={`/profile/${author.username}`} className="font-bold text-white hover:underline">
                      {author.name}
                    </Link>
                  <p className="text-secondary"> @{author.username}</p>
                  <span className="text-secondary">·</span>
                  <time className="text-secondary">{new Date(currentPost.created_at).toLocaleDateString()}</time>
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
                      {currentPost.isLocked ? (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={handleLockUnlock}
                          title="Déverrouiller le post"
                        >
                          <Icon name="lock" />
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={handleLockUnlock}
                          title="Verrouiller le post"
                        >
                          <Icon name="unlock" />
                        </Button>
                      )}
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
                    {currentPost.original_post?.author.privateMode && !currentPost.original_post?.author.isFollowed && currentPost.original_post?.author.id !== name.id ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <svg className="w-8 h-8 text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-secondary text-center">
                          Ce compte est privé
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={`http://localhost:8080/uploads/avatar/${currentPost.original_post?.author.avatar}`}
                            alt={currentPost.original_post?.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <span className="font-bold text-white">{currentPost.original_post?.author.name}</span>
                            <span className="text-secondary ml-2">@{currentPost.original_post?.author.username}</span>
                          </div>
                        </div>
                        <p className="text-white mb-3 break-all break-words whitespace-pre-wrap overflow-hidden max-w-full">
                          {processText(currentPost.original_post?.content || '')}
                        </p>
                        {currentPost.original_post?.media && currentPost.original_post.media.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {currentPost.original_post.media.map((mediaUrl, index) => {
                              const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);
                              return (
                                <div key={index} className="relative aspect-square">
                                  {isVideo ? (
                                    <video
                                      src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                      className="w-full h-full object-cover rounded-lg"
                                      controls
                                    />
                                  ) : (
                                    <img
                                      src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                      alt={`Media ${index + 1}`}
                                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                                      onClick={() => openMediaViewer(index)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {author.privateMode && !currentPost.isFollowed && author.id !== name.id ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <svg className="w-8 h-8 text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-secondary text-center">
                          Ce compte est privé
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-white mb-3 break-all break-words whitespace-pre-wrap overflow-hidden max-w-full">
                          {processText(currentPost.content)}
                        </p>
                        {currentPost.media && currentPost.media.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {currentPost.media.map((mediaUrl, index) => {
                              const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);
                              return (
                                <div key={index} className="relative aspect-square">
                                  {isVideo ? (
                                    <video
                                      src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                      className="w-full h-full object-cover rounded-lg"
                                      controls
                                    />
                                  ) : (
                                    <img
                                      src={`http://localhost:8080/uploads/posts/${mediaUrl}`}
                                      alt={`Media ${index + 1}`}
                                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                                      onClick={() => openMediaViewer(index)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                {(!author.lecture && (!author.privateMode || post.isFollowed || name.id === post.author.id)) && (
                  <div className="flex justify-between text-secondary max-w-md">
                    {currentPost.isLocked || (author.isLimited && !post.isFollowed && name.id !== post.author.id) ? (
                      <Button 
                        className="bg-transparent flex items-center gap-2 text-secondary cursor-not-allowed"
                        disabled
                      >
                        <Icon name="limited" className="w-5 h-5" />
                        <span>{currentPost.comments?.length || 0}</span>
                      </Button>
                    ) : (
                      <Button 
                        className="bg-transparent flex items-center gap-2 hover:text-blue-500 transition-colors"
                        onClick={() => setIsCommenting(!isCommenting)}
                      >
                        <Icon name="reply" className="w-5 h-5" />
                        <span>{currentPost.comments?.length || 0}</span>
                      </Button>
                    )}
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
                {!currentPost.isLocked && (
                  <div className="mt-4 space-y-4">
                    {Array.isArray(currentPost.comments) && currentPost.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <img
                          src={`http://localhost:8080/uploads/avatar/${comment.user.avatar}`}
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
                            {name.username === comment.user.username && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setIsEditCommentModalOpen(true);
                                  }}
                                >
                                  <Icon name="edit" />
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setIsDeleteCommentModalOpen(true);
                                  }}
                                >
                                  <Icon name="delete" />
                                </Button>
                              </>
                            )}
                          </div>
                          <p className="mt-1 text-white">{comment.comments}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Zone de commentaire */}
                {!currentPost.isLocked && isCommenting && (
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
          
          {isEditModalOpen && (
            currentPost.retweet ? (
              <EditRetweetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                retweet={currentPost}
                onEditSuccess={handleEditSuccess}
              />
            ) : (
              <EditTweetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={currentPost}
                onEditSuccess={handleEditSuccess}
              />
            )
          )}

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

          {selectedComment && (
            <EditCommentModal
              isOpen={isEditCommentModalOpen}
              onClose={() => {
                setIsEditCommentModalOpen(false);
                setSelectedComment(null);
              }}
              comment={selectedComment}
              onEditSuccess={(editedComment) => {
                if (selectedComment && editedComment.comments) {
                  handleEditComment(selectedComment.id, editedComment.comments);
                }
              }}
            />
          )}

          <DeleteModal
            isOpen={isDeleteCommentModalOpen}
            onClose={() => {
              setIsDeleteCommentModalOpen(false);
              setSelectedComment(null);
            }}
            onConfirm={() => {
              if (selectedComment) {
                handleDeleteComment(selectedComment.id);
              }
            }}
          />
        </>
      )}
    </>
  );
};

export default Tweet; 