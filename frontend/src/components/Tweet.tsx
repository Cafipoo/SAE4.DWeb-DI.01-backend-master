import Icon from './Icon';

interface TweetProps {
  post: {
    id: number;
    content: string;
    created_at: string;
    author?: {
      name: string;
      username: string;
      avatar: string;
    };
    likes?: number;
    reposts?: number;
    replies?: number;
    media?: {
      type: string;
      url: string;
    };
  };
}

const Tweet = ({ post }: TweetProps) => {
  // Valeurs par défaut pour les données manquantes
  const defaultAuthor = {
    name: "Utilisateur",
    username: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
  };

  const author = post.author || defaultAuthor;
  const likes = post.likes || 0;
  const reposts = post.reposts || 0;
  const replies = post.replies || 0;

  return (
    <article className="border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
      <div className="flex gap-4">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-white">{author.name}</h2>
            <span className="text-gray-500">@{author.username}</span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500">{new Date(post.created_at).toLocaleDateString()}</time>
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
          <div className="flex justify-between text-gray-500 max-w-md">
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <Icon name="reply" className="w-5 h-5" />
              <span>{replies}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
              <Icon name="repost" className="w-5 h-5" />
              <span>{reposts}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
              <Icon name="like" className="w-5 h-5" />
              <span>{likes}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <Icon name="share" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Tweet; 