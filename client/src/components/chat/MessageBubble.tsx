import { Message } from '@/types/chat';
import MessageStatusIcon from './MessageStatusIcon';
import { format } from 'date-fns';
import { Pin, HelpCircle, CheckCircle2, Megaphone, FileText, Calendar, Reply } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  senderName?: string;
  replyContent?: string;
}

const MessageBubble = ({ message, isOwn, showSender, senderName, replyContent }: MessageBubbleProps) => {
  const time = format(message.timestamp, 'HH:mm');

  // Announcement
  if (message.type === 'announcement') {
    return (
      <div className="flex justify-center mb-2 px-4 animate-slide-in">
        <div className="max-w-[85%] bg-announcement-bg border border-announcement/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Megaphone className="h-4 w-4 text-announcement" />
            <span className="text-xs font-semibold text-announcement">Announcement</span>
            {message.isPinned && <Pin className="h-3 w-3 text-pinned" />}
          </div>
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground">{senderName}</span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // Assignment
  if (message.type === 'assignment' && message.assignmentData) {
    const ad = message.assignmentData;
    return (
      <div className="flex justify-center mb-2 px-4 animate-slide-in">
        <div className="max-w-[85%] w-full bg-assignment-bg border border-assignment/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-assignment" />
            <span className="text-xs font-semibold text-assignment">Assignment</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1">{ad.title}</h4>
          <p className="text-sm text-foreground/80 mb-2">{message.content}</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-assignment">
              <Calendar className="h-3 w-3" />
              Due: {format(ad.dueDate, 'MMM d, yyyy')}
            </span>
            <span className="text-muted-foreground">{ad.subject}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground">{senderName} • {time}</span>
          </div>
        </div>
      </div>
    );
  }

  // Doubt
  const isDoubt = message.type === 'doubt';

  // System
  if (message.type === 'system') {
    return (
      <div className="flex justify-center mb-2 px-4 animate-slide-in">
        <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{message.content}</span>
      </div>
    );
  }

  // Regular text / media / doubt
  const roleColorClass =
    message.senderRole === 'teacher'
      ? 'text-role-teacher'
      : message.senderRole === 'parent'
      ? 'text-role-parent'
      : 'text-role-student';

  return (
    <div className={`flex animate-slide-in ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
          isDoubt ? 'border border-doubt/30 ' : ''
        }${
          isOwn
            ? `${isDoubt ? 'bg-doubt-bg' : 'bg-bubble-own'} text-bubble-own-foreground rounded-br-md`
            : `${isDoubt ? 'bg-doubt-bg' : 'bg-bubble-other'} text-bubble-other-foreground rounded-bl-md`
        }`}
      >
        {/* Doubt badge */}
        {isDoubt && (
          <div className="flex items-center gap-1.5 mb-1">
            <HelpCircle className="h-3.5 w-3.5 text-doubt" />
            <span className="text-[10px] font-semibold text-doubt">
              {message.isDoubtAnswered === false ? 'Doubt — Unanswered' : message.isDoubtAnswered ? 'Doubt — Answered ✅' : 'Doubt'}
            </span>
          </div>
        )}

        {/* Sender name */}
        {showSender && senderName && (
          <p className={`text-xs font-semibold mb-0.5 ${roleColorClass}`}>{senderName}</p>
        )}

        {/* Reply preview */}
        {replyContent && (
          <div className="flex items-center gap-1.5 mb-1.5 pl-2 border-l-2 border-primary/40">
            <Reply className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground truncate">{replyContent}</span>
          </div>
        )}

        {/* Pinned badge */}
        {message.isPinned && (
          <div className="flex items-center gap-1 mb-1">
            <Pin className="h-3 w-3 text-pinned" />
            <span className="text-[10px] text-pinned font-medium">Pinned</span>
          </div>
        )}

        {/* Image */}
        {message.type === 'image' && message.mediaUrl && (
          <div className="mb-1.5 overflow-hidden rounded-lg">
            <img src={message.mediaUrl} alt={message.content} className="w-full max-w-[280px] h-auto object-cover" loading="lazy" />
          </div>
        )}

        {/* Text content */}
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>

        {/* Mentions */}
        {message.mentions && message.mentions.length > 0 && (
          <div className="mt-0.5">
            {message.mentions.map((m) => (
              <span key={m} className="text-[10px] text-primary font-medium">@mentioned </span>
            ))}
          </div>
        )}

        {/* Time + status */}
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isOwn && <MessageStatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
