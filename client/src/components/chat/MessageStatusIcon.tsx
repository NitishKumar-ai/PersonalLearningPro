import { MessageStatus } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusIconProps {
    status: MessageStatus;
    className?: string;
}

export default function MessageStatusIcon({ status, className }: MessageStatusIconProps) {
    if (status === 'sending') {
        return <span className={cn('text-muted-foreground/50 text-xs', className)}>⏳</span>;
    }
    if (status === 'sent') {
        return <Check className={cn('h-3 w-3 text-status-sent', className)} />;
    }
    if (status === 'delivered') {
        return <CheckCheck className={cn('h-3 w-3 text-status-delivered', className)} />;
    }
    if (status === 'read') {
        return <CheckCheck className={cn('h-3 w-3 text-status-read', className)} />;
    }
    return null;
}
