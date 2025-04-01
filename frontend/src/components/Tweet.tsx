import { Link, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { DataRequests, Post, PostInteraction } from '../data/data-requests';
import { useEffect, useState } from 'react';
import DeleteModal from './DeleteModal';
import EditTweetModal from './EditTweetModal';
import MediaViewer from './MediaViewer';

interface TweetProps {
  post: Post & {
    reposts?: number;
    replies?: number;
    isLiked?: boolean;
    isFollowed?: boolean;
  };
  onDelete?: (postId: number) => void;
  onFollowUpdate?: (userId: number, isFollowed: boolean) => void;
  onEdit?: (editedPost: Post) => void;
}

const Tweet = ({ post, onDelete, onFollowUpdate, onEdit }: TweetProps) => {
  let name = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(post.isFollowed || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [comments, setComments] = useState<PostInteraction[]>([]);
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  useEffect(() => {
    if (name.id) {
      // Vérifier si liked_by est un tableau avant d'utiliser includes
      const likedByArray = Array.isArray(post.liked_by) ? post.liked_by : [];
      setIsLiked(likedByArray.includes(name.id));
      setIsFollowed(post.isFollowed || false);
    }
    setCurrentPost(post);
    loadComments();
  }, [name.id, post]);
  
  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const postComments = await DataRequests.getPostComments(post.id);
      setComments(postComments);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await DataRequests.addComment(post.id, name.id, newComment);
      const updatedComments = [...comments];
      const existingCommentIndex = updatedComments.findIndex(c => c.user.id === name.id);
      
      if (existingCommentIndex !== -1) {
        updatedComments[existingCommentIndex] = response;
      } else {
        updatedComments.push(response);
      }
      
      setComments(updatedComments);
      setNewComment('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

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
      
      // Appeler la fonction de mise à jour du parent
      if (onFollowUpdate) {
        onFollowUpdate(post.author.id, currentIsFollowed);
      }
    } catch (error) {
      // En cas d'erreur, on revient à l'état précédent
      setIsFollowed(!isFollowed);
      console.error('Erreur lors du suivi:', error);
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
                <div>
                  <p className="text-white mb-3 break-all break-words whitespace-pre-wrap overflow-hidden max-w-full">{currentPost.content}</p>
                </div>
                {currentPost.media && currentPost.media.length > 0 && (
                  <div className={`mb-3 w-48 rounded-2xl overflow-hidden ${
                    currentPost.media.length === 1 ? 'w-24' : 'grid gap-1'
                  }`} style={{
                    gridTemplateColumns: currentPost.media.length === 1 ? '1fr' :
                      currentPost.media.length === 2 ? 'repeat(2, 1fr)' :
                      currentPost.media.length === 3 ? 'repeat(2, 1fr)' :
                      'repeat(2, 1fr)'
                  }}>
                    {currentPost.media.map((imageUrl: string, index: number) => (
                      <div
                        key={index}
                        className={`relative ${
                          currentPost.media.length === 3 && index === 2 ? 'col-span-2' : ''
                        } cursor-pointer group`}
                        onClick={() => openMediaViewer(index)}
                      >
                        {imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') || imageUrl.endsWith('.mov') ? (
                          <>
                            <video
                              src={`http://localhost:8080/uploads/posts/${imageUrl}`}
                              className="w-full h-auto object-cover"
                              style={{
                                aspectRatio: currentPost.media.length === 1 ? '16/9' : '1/1'
                              }}
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Icon name="play" className="w-10 h-10 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <img
                              src={`http://localhost:8080/uploads/posts/${imageUrl}`}
                              alt={`Media content ${index + 1}`}
                              className="w-full h-auto object-cover"
                              style={{
                                aspectRatio: currentPost.media.length === 1 ? '16/9' : '1/1'
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Icon name="search" className="w-10 h-10 text-white" />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className=" flex justify-between text-gray-500 max-w-md">
                  <Button 
                    className="bg-transparent flex items-center gap-2 hover:text-blue-500 transition-colors"
                    onClick={() => setIsCommenting(!isCommenting)}
                  >
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

                {/* Commentaires */}
                <div className="mt-4 space-y-4">
                    {comments.map((comment) => (
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
        </>
      )}
    </>
  );
};

export default Tweet; 