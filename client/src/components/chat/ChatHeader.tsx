import { Conversation } from '@/types/chat';
import { useRole } from '@/contexts/chat-role-context';
import { ArrowLeft, Phone, Video, MoreVertical, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
    conversation: Conversation;
    onBack?: () => void;
}

const categoryLabels: Record<string, string> = {
    announcement: 'Announcements',
    class: 'Class',
    teacher: 'Teacher',
    friend: 'Friend',
    parent: 'Parent',
};

const categoryColors: Record<string, string> = {
    announcement: 'bg-announcement/15 text-announcement border-announcement/30',
    class: 'bg-primary/10 text-primary border-primary/20',
    teacher: 'bg-role-teacher/10 text-role-teacher border-role-teacher/20',
    friend: 'bg-role-student/10 text-role-student border-role-student/20',
    parent: 'bg-role-parent/10 text-role-parent border-role-parent/20',
};

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
    const { currentUser } = useRole();
    const otherParticipants = conversation.participants.filter(p => p.id !== currentUser.id);
    const partner = !conversation.isGroup ? otherParticipants[0] : null;
    const isOnline = partner?.isOnline ?? (conversation.isGroup ? conversation.participants.some(p => p.isOnline) : false);

    return (
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-background flex-shrink-0">
            {/* Mobile back button */}
            {onBack && (
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 -ml-1" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}

            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold',
                    conversation.isGroup ? 'bg-primary/15 text-primary' : 'bg-muted',
                )}>
                    {conversation.isGroup
                        ? conversation.icon || <Users className="h-4 w-4" />
                        : (conversation.name?.[0] || '?')}
                </div>
                {!conversation.isGroup && isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-online border-2 border-background" />
                )}
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground truncate">
                        {conversation.name || (partner?.name || 'Chat')}
                    </h2>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 hidden sm:flex', categoryColors[conversation.category])}>
                        {categoryLabels[conversation.category]}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                    {conversation.isGroup
                        ? `${conversation.participants.length} members`
                        : isOnline ? 'Online' : partner?.lastSeen ? `Last seen ${new Date(partner.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Offline'}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {!conversation.isGroup && (
                    <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Video className="h-4 w-4" />
                        </Button>
                    </>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
