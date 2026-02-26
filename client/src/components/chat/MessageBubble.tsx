import { Message } from '@/types/chat';
import { useRole } from '@/contexts/chat-role-context';
import MessageStatusIcon from './MessageStatusIcon';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { Pin, HelpCircle, CheckCircle2, FileText, Megaphone } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    showAvatar?: boolean;
    replyMessage?: Message;
}

function formatTime(date: Date) {
    return format(date, 'h:mm a');
}

function formatDate(date: Date) {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd MMM yyyy');
}

export function DayDivider({ date }: { date: Date }) {
    return (
        <div className="flex items-center gap-3 my-4 px-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium px-2">
                {formatDate(date)}
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>
    );
}

export default function MessageBubble({ message, showAvatar = true, replyMessage }: MessageBubbleProps) {
    const { currentUser } = useRole();
    const isOwn = message.senderId === currentUser.id;

    const isAnnouncement = message.type === 'announcement';
    const isAssignment = message.type === 'assignment';
    const isDoubt = message.type === 'doubt';

    // Full-width special message types
    if (isAnnouncement) {
        return (
            <div className="mx-4 my-2 rounded-xl border border-announcement/40 bg-announcement-bg p-3 flex gap-3 items-start animate-slide-in">
                <Megaphone className="h-5 w-5 text-announcement mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-announcement mb-0.5">Announcement</p>
                    <p className="text-sm text-foreground">{message.content}</p>
                    <span className="text-xs text-muted-foreground mt-1 block">{formatTime(new Date(message.timestamp))}</span>
                </div>
            </div>
        );
    }

    if (isAssignment && message.assignmentData) {
        const { title, dueDate, subject } = message.assignmentData;
        return (
            <div className="mx-4 my-2 rounded-xl border border-assignment/40 bg-assignment-bg p-3 flex gap-3 items-start animate-slide-in">
                <FileText className="h-5 w-5 text-assignment mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-assignment">Assignment · {subject}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(new Date(dueDate), 'dd MMM yyyy')}
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">{formatTime(new Date(message.timestamp))}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex items-end gap-2 px-4 py-0.5 group animate-slide-in', isOwn ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar placeholder */}
            {showAvatar && !isOwn ? (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mb-1">
                    {message.senderId.charAt(0).toUpperCase()}
                </div>
            ) : (
                <div className="w-7 flex-shrink-0" />
            )}

            <div className={cn('max-w-[75%] flex flex-col', isOwn ? 'items-end' : 'items-start')}>
                {/* Reply preview */}
                {replyMessage && (
                    <div className={cn(
                        'text-xs px-2 py-1 rounded-t-lg border-l-2 mb-0.5 max-w-full truncate',
                        isOwn ? 'bg-bubble-own/60 border-primary/50 text-bubble-own-foreground/70' : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                    )}>
                        {replyMessage.content}
                    </div>
                )}

                {/* Bubble */}
                <div className={cn(
                    'rounded-2xl px-3 py-2 text-sm relative',
                    isOwn
                        ? 'bg-bubble-own text-bubble-own-foreground rounded-br-sm'
                        : 'bg-bubble-other text-bubble-other-foreground shadow-sm border border-border rounded-bl-sm',
                    isDoubt && !isOwn && 'border-l-2 border-doubt bg-doubt-bg',
                )}>
                    {isDoubt && (
                        <div className="flex items-center gap-1 text-xs font-medium text-doubt mb-1">
                            {message.isDoubtAnswered
                                ? <><CheckCircle2 className="h-3 w-3" /> Doubt Answered</>
                                : <><HelpCircle className="h-3 w-3" /> Doubt</>
                            }
                        </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

                    {/* Time + status */}
                    <div className={cn('flex items-center gap-1 mt-0.5', isOwn ? 'justify-end' : 'justify-start')}>
                        <span className="text-[10px] opacity-60">{formatTime(new Date(message.timestamp))}</span>
                        {isOwn && <MessageStatusIcon status={message.status} className="opacity-80" />}
                    </div>
                </div>

                {/* Pinned indicator */}
                {message.isPinned && (
                    <div className="flex items-center gap-0.5 text-[10px] text-pinned mt-0.5">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                    </div>
                )}
            </div>
        </div>
    );
}
