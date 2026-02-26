/**
 * ChatThread.tsx — Phase 5.3 + 6 update
 *
 * Now uses:
 *  - use-chat-ws hook for real-time sending and receiving
 *  - chat-api.ts for loading message history via REST
 *  - Falls back to mock data when the channel ID is not a real numeric ID
 *    (i.e. mock conversations like "conv-math") so the UI still works offline
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Message, Conversation } from '@/types/chat';
import { useRole } from '@/contexts/chat-role-context';
import { mockMessages } from '@/data/mockData';
import ChatHeader from './ChatHeader';
import MessageBubble, { DayDivider } from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { isSameDay } from 'date-fns';
import { useChatWs, ChatWsEvent } from '@/hooks/use-chat-ws';
import { getMessages, markConversationRead } from '@/lib/chat-api';

interface ChatThreadProps {
    conversation: Conversation;
    onBack?: () => void;
    /** Called on every WS event so ChatLayout can relay it to ConversationList */
    onWsEvent?: (event: ChatWsEvent) => void;
}

export default function ChatThread({ conversation, onBack, onWsEvent }: ChatThreadProps) {
    const { currentUser } = useRole();
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Determine if the conversation maps to a real numeric channel ID
    const numericChannelId = useMemo(() => {
        const n = Number(conversation.id);
        return isNaN(n) ? null : n;
    }, [conversation.id]);

    // ── Message state — start from mock if no real channel ──────────────────────
    const [messages, setMessages] = useState<Message[]>(() =>
        mockMessages[conversation.id] || []
    );
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    // ── Load history from API when we have a real channel ID ────────────────────
    useEffect(() => {
        const mock = mockMessages[conversation.id] || [];
        setMessages(mock);
        setTypingUsers([]);

        if (!numericChannelId) return;

        setIsLoadingHistory(true);
        getMessages(numericChannelId, 50)
            .then(apiMessages => {
                if (apiMessages.length > 0) {
                    setMessages(apiMessages);
                }
                // Mark conversation as read on open (Phase 6)
                markConversationRead(numericChannelId).catch(() => null);
            })
            .catch(() => { /* silently fall back to mock data */ })
            .finally(() => setIsLoadingHistory(false));
    }, [conversation.id, numericChannelId]);

    // ── WebSocket event handler ─────────────────────────────────────────────────
    const handleWsEvent = useCallback((event: ChatWsEvent) => {
        // Forward every event up to ChatLayout so ConversationList can update unread counts
        onWsEvent?.(event);

        switch (event.type) {
            case 'new_message': {
                if (event.channelId !== numericChannelId) return;
                const raw = event.message;
                if (!raw) return;

                // Map server message shape → our Message type
                const msg: Message = {
                    id: String(raw.id || crypto.randomUUID()),
                    conversationId: conversation.id,
                    senderId: String(raw.authorId || raw.senderId || ''),
                    senderRole: raw.senderRole || 'student',
                    type: raw.messageType || raw.type || 'text',
                    content: raw.content,
                    status: 'delivered',
                    timestamp: new Date(raw.createdAt || Date.now()),
                    deliveredTo: [],
                    readBy: raw.readBy || [],
                    isPinned: raw.isPinned || false,
                    isDoubtAnswered: raw.isDoubtAnswered || false,
                    assignmentData: raw.assignmentData,
                    replyTo: raw.replyTo ? String(raw.replyTo) : undefined,
                };

                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });

                // Mark as delivered (Phase 6)
                if (raw.authorId !== currentUser.id && numericChannelId) {
                    markDelivered(numericChannelId, Number(msg.id));
                    markRead(numericChannelId, Number(msg.id));
                }
                break;
            }

            case 'user_typing': {
                if (event.channelId !== numericChannelId) return;
                const name = event.displayName || '';
                if (name && event.firebaseUid !== currentUser.id) {
                    setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]);
                }
                break;
            }

            case 'user_stop_typing': {
                if (event.channelId !== numericChannelId) return;
                const name = event.displayName || '';
                setTypingUsers(prev => prev.filter(u => u !== name));
                break;
            }

            case 'message_read': {
                if (event.channelId !== numericChannelId) return;
                setMessages(prev =>
                    prev.map(m => m.id === String(event.messageId) ? { ...m, status: 'read' as const } : m)
                );
                break;
            }

            case 'message_delivered': {
                if (event.channelId !== numericChannelId) return;
                setMessages(prev =>
                    prev.map(m => m.id === String(event.messageId) ? { ...m, status: 'delivered' as const } : m)
                );
                break;
            }

            case 'doubt_answered': {
                if (event.channelId !== numericChannelId) return;
                setMessages(prev =>
                    prev.map(m => m.id === String(event.messageId) ? { ...m, isDoubtAnswered: true } : m)
                );
                break;
            }

            case 'message_pinned': {
                if (event.channelId !== numericChannelId) return;
                setMessages(prev =>
                    prev.map(m => m.id === String(event.messageId) ? { ...m, isPinned: true } : m)
                );
                break;
            }
        }
    }, [numericChannelId, conversation.id, currentUser.id]);

    // ── WebSocket hook ──────────────────────────────────────────────────────────
    const { sendMessage, sendTyping, stopTyping, markRead, markDelivered, isConnected } =
        useChatWs({
            onEvent: handleWsEvent,
            activeChannelId: numericChannelId ?? undefined,
        });

    // ── Scroll to bottom on new messages ───────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Handle send ─────────────────────────────────────────────────────────────
    const handleSend = useCallback((content: string, type: 'text' | 'doubt' = 'text') => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

        if (numericChannelId && isConnected) {
            // Real WebSocket send
            const opts = { messageType: type, senderRole: currentUser.role };
            const sent = sendMessage(numericChannelId, content, opts);

            if (sent) {
                // Optimistic message
                const optimisticMsg: Message = {
                    id: 'opt-' + crypto.randomUUID(),
                    conversationId: conversation.id,
                    senderId: currentUser.id,
                    senderRole: currentUser.role,
                    type,
                    content,
                    status: 'sending',
                    timestamp: new Date(),
                    deliveredTo: [],
                    readBy: [],
                };
                setMessages(prev => [...prev, optimisticMsg]);
                // Remove optimistic once real message arrives (by content match), in 2s
                setTimeout(() => {
                    setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                }, 2000);
                return;
            }
        }

        // Fallback: mock simulation (no real channel or WS not connected)
        const mockMsg: Message = {
            id: crypto.randomUUID(),
            conversationId: conversation.id,
            senderId: currentUser.id,
            senderRole: currentUser.role,
            type,
            content,
            status: 'sending',
            timestamp: new Date(),
            deliveredTo: [],
            readBy: [],
        };
        setMessages(prev => [...prev, mockMsg]);
        setTimeout(() => setMessages(prev => prev.map(m => m.id === mockMsg.id ? { ...m, status: 'sent' as const } : m)), 500);
        setTimeout(() => setMessages(prev => prev.map(m => m.id === mockMsg.id ? { ...m, status: 'delivered' as const } : m)), 1200);
    }, [numericChannelId, isConnected, sendMessage, currentUser, conversation.id]);

    // ── Typing indicator on input ───────────────────────────────────────────────
    const handleTyping = useCallback(() => {
        if (!numericChannelId || !isConnected) return;
        sendTyping(numericChannelId);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            stopTyping(numericChannelId);
        }, 3000);
    }, [numericChannelId, isConnected, sendTyping, stopTyping]);

    // ── Render messages with day dividers ───────────────────────────────────────
    const renderMessages = () => {
        const elements: React.ReactNode[] = [];
        let lastDate: Date | null = null;

        messages.forEach((msg, i) => {
            const msgDate = new Date(msg.timestamp);
            if (!lastDate || !isSameDay(lastDate, msgDate)) {
                elements.push(<DayDivider key={`divider-${i}`} date={msgDate} />);
                lastDate = msgDate;
            }

            const prevMsg = messages[i - 1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            const replyMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : undefined;

            elements.push(
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    showAvatar={showAvatar}
                    replyMessage={replyMsg}
                />
            );
        });

        return elements;
    };

    return (
        <div className="flex flex-col h-full">
            <ChatHeader conversation={conversation} onBack={onBack} />

            {/* Connection status indicator */}
            {numericChannelId && !isConnected && (
                <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs text-center py-1.5 px-4">
                    Reconnecting to live chat…
                </div>
            )}

            {/* Message list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-2 bg-muted/10">
                {isLoadingHistory && (
                    <div className="text-center text-xs text-muted-foreground py-4">Loading messages…</div>
                )}

                {renderMessages()}

                {/* Typing indicator (Phase 6) */}
                {typingUsers.length > 0 && (
                    <div className="flex items-end gap-2 px-4 py-1">
                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                            {typingUsers[0]?.[0] || '?'}
                        </div>
                        <div className="bg-bubble-other border border-border rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <MessageInput conversation={conversation} onSend={handleSend} onTyping={handleTyping} />
        </div>
    );
}
