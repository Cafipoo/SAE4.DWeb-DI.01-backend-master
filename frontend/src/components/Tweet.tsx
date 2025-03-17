import Icon from './Icon';
interface TweetProps {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  reposts: number;
  replies: number;
  isRepost?: boolean;
  isLiked?: boolean;
  media?: {
    type: string;
    url: string;
  };
}

const Tweet = ({
  author,
  content,
  date,
  likes,
  reposts,
  replies,
  isRepost,
  isLiked,
  media
}: TweetProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <article className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors">
      {isRepost && (
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Icon name="repost" className="w-4 h-4 mr-2" />
          <span>Reposté</span>
        </div>
      )}
      
      <div className="flex">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-12 h-12 rounded-full mr-3"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold text-white hover:underline">
              {author.name}
            </span>
            <span className="text-gray-500">@{author.username}</span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500 hover:underline">
              {formatDate(date)}
            </time>
          </div>

          <p className="text-white mb-3 whitespace-pre-wrap">{content}</p>

          {media && (
            <div className="mb-3 rounded-2xl overflow-hidden max-w-md">
              <img
                src={media.url}
                alt="Media content"
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="flex justify-between text-gray-500 max-w-md">
            <button className="flex items-center group">
              <div className="p-2 group-hover:bg-blue-500/20 rounded-full transition-colors">
                <Icon name="reply" className="w-5 h-5 group-hover:text-blue-500" />
              </div>
              <span className="ml-1 text-sm group-hover:text-blue-500">{replies}</span>
            </button>

            <button className="flex items-center group">
              <div className={`p-2 group-hover:bg-green-500/20 rounded-full transition-colors ${
                isRepost ? 'bg-green-500/10' : ''
              }`}>
                <Icon 
                  name="repost" 
                  className={`w-5 h-5 group-hover:text-green-500 ${
                    isRepost ? 'text-green-500' : ''
                  }`} 
                />
              </div>
              <span className={`ml-1 text-sm group-hover:text-green-500 ${
                isRepost ? 'text-green-500' : ''
              }`}>{reposts}</span>
            </button>

            <button className="flex items-center group">
              <div className={`p-2 group-hover:bg-pink-500/20 rounded-full transition-colors ${
                isLiked ? 'bg-pink-500/10' : ''
              }`}>
                <Icon 
                  name="like" 
                  className={`w-5 h-5 group-hover:text-pink-500 ${
                    isLiked ? 'text-pink-500' : ''
                  }`} 
                />
              </div>
              <span className={`ml-1 text-sm group-hover:text-pink-500 ${
                isLiked ? 'text-pink-500' : ''
              }`}>{likes}</span>
            </button>

            <button className="flex items-center group">
              <div className="p-2 group-hover:bg-blue-500/20 rounded-full transition-colors">
                <Icon name="share" className="w-5 h-5 group-hover:text-blue-500" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Tweet; 