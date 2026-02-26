import { Check, CheckCheck, Clock } from 'lucide-react';
import { MessageStatus as Status } from '@/types/chat';

interface MessageStatusProps {
  status: Status;
}

const MessageStatusIcon = ({ status }: MessageStatusProps) => {
  switch (status) {
    case 'sending':
      return <Clock className="h-3.5 w-3.5 text-status-sent" />;
    case 'sent':
      return <Check className="h-3.5 w-3.5 text-status-sent" />;
    case 'delivered':
      return <CheckCheck className="h-3.5 w-3.5 text-status-delivered" />;
    case 'read':
      return <CheckCheck className="h-3.5 w-3.5 text-status-read" />;
    default:
      return null;
  }
};

export default MessageStatusIcon;
