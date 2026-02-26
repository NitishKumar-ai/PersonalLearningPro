import { useState, useRef } from 'react';
import { Send, Paperclip, Smile, HelpCircle, FileText, AlertTriangle } from 'lucide-react';
import { useRole } from '@/contexts/chat-role-context';

interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'doubt') => void;
  isReadOnly?: boolean;
}

const MessageInput = ({ onSend, isReadOnly }: MessageInputProps) => {
  const [text, setText] = useState('');
  const [doubtMode, setDoubtMode] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { currentRole } = useRole();

  if (isReadOnly) {
    return (
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">This is a read-only announcement channel</span>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, doubtMode ? 'doubt' : 'text');
    setText('');
    setDoubtMode(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      {/* Quick actions */}
      {(currentRole === 'student' || currentRole === 'teacher') && (
        <div className="flex items-center gap-2 mb-2">
          {currentRole === 'student' && (
            <button
              onClick={() => setDoubtMode(!doubtMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                doubtMode
                  ? 'bg-doubt text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Ask Doubt
            </button>
          )}
          {currentRole === 'teacher' && (
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground transition-all">
              <FileText className="h-3.5 w-3.5" />
              Send Assignment
            </button>
          )}
        </div>
      )}

      {doubtMode && (
        <div className="flex items-center gap-2 mb-2 px-2">
          <span className="text-[11px] text-doubt font-medium">🟣 Doubt mode — your message will be tagged as a question</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
          <Paperclip className="h-5 w-5" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
          <Smile className="h-5 w-5" />
        </button>
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={doubtMode ? 'Type your doubt...' : 'Type a message...'}
            rows={1}
            className={`w-full resize-none rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-2.5 text-sm focus:outline-none focus:ring-1 scrollbar-thin max-h-32 ${
              doubtMode ? 'focus:ring-doubt border border-doubt/30' : 'focus:ring-ring'
            }`}
            style={{ minHeight: '40px' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
