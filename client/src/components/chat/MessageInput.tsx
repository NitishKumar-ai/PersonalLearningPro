import { useState, useRef } from 'react';
import { useRole } from '@/contexts/chat-role-context';
import { Conversation } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, HelpCircle, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
    conversation: Conversation;
    onSend: (content: string, type?: 'text' | 'doubt') => void;
    /** Called on every keystroke so the parent can fire a typing WS event */
    onTyping?: () => void;
}

export default function MessageInput({ conversation, onSend, onTyping }: MessageInputProps) {
    const { currentRole } = useRole();
    const [content, setContent] = useState('');
    const [isDoubtMode, setIsDoubtMode] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isReadOnly = conversation.isReadOnly && currentRole === 'student';

    if (isReadOnly) {
        return (
            <div className="px-4 py-3 border-t border-border bg-muted/30 text-center text-sm text-muted-foreground">
                This is an announcement channel — only teachers can post here.
            </div>
        );
    }

    const handleSend = () => {
        const trimmed = content.trim();
        if (!trimmed) return;
        onSend(trimmed, isDoubtMode ? 'doubt' : 'text');
        setContent('');
        setIsDoubtMode(false);
        textareaRef.current?.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        onTyping?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-border bg-background px-4 pt-3 pb-4">
            {isDoubtMode && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-doubt mb-2 px-1">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Doubt mode — your message will be marked as a doubt for teachers to answer
                </div>
            )}

            <div className={cn(
                'flex items-end gap-2 rounded-xl border bg-background transition-colors',
                isDoubtMode ? 'border-doubt/50' : 'border-border',
                'focus-within:ring-1 focus-within:ring-primary/30'
            )}>
                {currentRole === 'student' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'h-9 w-9 rounded-xl flex-shrink-0 self-end mb-0.5 ml-1',
                            isDoubtMode ? 'text-doubt bg-doubt-bg' : 'text-muted-foreground hover:text-doubt'
                        )}
                        onClick={() => setIsDoubtMode(d => !d)}
                        title={isDoubtMode ? 'Cancel doubt mode' : 'Ask a doubt'}
                    >
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                )}

                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isDoubtMode ? 'Type your doubt...' : 'Type a message... (use @AI to ask the AI Tutor)'}
                    className="min-h-[44px] max-h-[140px] resize-none border-0 shadow-none focus-visible:ring-0 rounded-none py-3 text-sm"
                    rows={1}
                />

                <div className="flex items-center gap-1 self-end mb-1 mr-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                        <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!content.trim()}
                        className="h-8 w-8 rounded-lg"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground/50 mt-1 text-center">
                Enter to send · Shift+Enter for new line · @AI for AI Tutor
            </p>
        </div>
    );
}
