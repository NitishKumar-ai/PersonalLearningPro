import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppMessage, useLocalSessionId, useLocalParticipant } from '@daily-co/daily-react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Date;
    isLocal: boolean;
}

export function ChatPanel() {
    const localSessionId = useLocalSessionId();
    const localParticipant = useLocalParticipant();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const localName = localParticipant?.user_name || 'Me';

    const sendAppMessage = useAppMessage({
        onAppMessage: useCallback(
            (ev: any) => {
                setMessages((msgs) => [
                    ...msgs,
                    {
                        id: crypto.randomUUID(),
                        senderId: ev.fromId,
                        senderName: ev.data.name || 'User',
                        text: ev.data.text,
                        timestamp: new Date(),
                        isLocal: false,
                    },
                ]);
            },
            []
        ),
    });

    const handleSend = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !localSessionId) return;

        // Send to other participants
        sendAppMessage({ text: newMessage.trim(), name: localName });

        // Add locally immediately
        setMessages((msgs) => [
            ...msgs,
            {
                id: crypto.randomUUID(),
                senderId: localSessionId,
                senderName: localName,
                text: newMessage.trim(),
                timestamp: new Date(),
                isLocal: true,
            },
        ]);
        setNewMessage('');
    }, [newMessage, sendAppMessage, localSessionId, localName]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-zinc-950 w-80 shrink-0">
            <div className="p-4 border-b border-zinc-800 font-semibold text-white">
                In-Call Chat
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col"
            >
                {messages.length === 0 ? (
                    <div className="text-zinc-500 text-center mt-10 text-sm">
                        No messages yet. Say hi!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] ${msg.isLocal ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                            <span className="text-xs text-zinc-500 mb-1">{msg.isLocal ? "You" : msg.senderName}</span>
                            <div
                                className={`px-3 py-2 rounded-xl text-sm ${msg.isLocal ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'}`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100 focus-visible:ring-primary h-10"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-10 w-10 shrink-0">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
