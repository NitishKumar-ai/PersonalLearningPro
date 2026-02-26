import { Conversation } from '@/types/chat';
import { ArrowLeft, Phone, Video, MoreVertical, Pin, Lock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { users as allUsers } from '@/data/mockData';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
}

const ChatHeader = ({ conversation, onBack }: ChatHeaderProps) => {
  const displayName =
    conversation.name || conversation.participants.map((p) => p.name).join(', ');

  const getSubtitle = () => {
    if (conversation.typing && conversation.typing.length > 0) {
      const typer = allUsers[conversation.typing[0]];
      return (
        <span className="text-xs text-typing font-medium">
          {typer?.name || 'Someone'} is typing…
        </span>
      );
    }
    if (conversation.isGroup) {
      const count = conversation.participants.length + 1;
      return (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" />
          {count} members
          {conversation.subject && <span>• {conversation.subject}</span>}
        </span>
      );
    }
    const user = conversation.participants[0];
    if (user?.isOnline) {
      return <span className="text-xs text-online">online</span>;
    }
    if (user?.lastSeen) {
      return (
        <span className="text-xs text-muted-foreground">
          last seen {formatDistanceToNow(user.lastSeen, { addSuffix: true })}
        </span>
      );
    }
    return null;
  };

  const getCategoryBadge = () => {
    switch (conversation.category) {
      case 'announcement':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-announcement bg-announcement-bg px-2 py-0.5 rounded-full">
            <Lock className="h-3 w-3" /> Announcement
          </span>
        );
      case 'class':
        return (
          <span className="text-[10px] font-medium text-role-teacher bg-role-teacher/10 px-2 py-0.5 rounded-full">
            Class Group
          </span>
        );
      default:
        return null;
    }
  };

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
      {onBack && (
        <button onClick={onBack} className="p-1 text-muted-foreground hover:text-foreground md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground">
          {initials}
        </div>
        {!conversation.isGroup && conversation.participants[0]?.isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-online border-2 border-card" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground truncate">{displayName}</h2>
          {getCategoryBadge()}
        </div>
        {getSubtitle()}
      </div>
      <div className="flex items-center gap-1">
        {!conversation.isReadOnly && (
          <>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <Video className="h-4 w-4" />
            </button>
          </>
        )}
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
