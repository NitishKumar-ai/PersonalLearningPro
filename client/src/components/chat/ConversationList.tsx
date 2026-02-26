/**
 * ConversationList.tsx — Phase 5.4 + 6 update
 *
 * On mount, tries to load real conversations from GET /api/chat/conversations.
 * Falls back to mock data if the API fails (offline / not authenticated yet).
 * Listens for real-time unread_updated events from the WS hook passed in via props.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Conversation, ConversationCategory } from '@/types/chat';
import { useRole } from '@/contexts/chat-role-context';
import { cn } from '@/lib/utils';
import { Search, Megaphone, BookOpen, User, Users, Heart, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { getConversations, markConversationRead } from '@/lib/chat-api';
import { ChatWsEvent } from '@/hooks/use-chat-ws';

interface ConversationListProps {
    /** Fallback mock conversations passed from ChatLayout */
    fallbackConversations: Conversation[];
    activeId?: string;
    onSelect: (conv: Conversation) => void;
    /** Latest WS event forwarded from ChatLayout so we can update unread counts */
    latestWsEvent?: ChatWsEvent | null;
}

const categoryOrder: ConversationCategory[] = ['announcement', 'class', 'teacher', 'parent', 'friend'];

const categoryConfig: Record<ConversationCategory, { label: string; icon: React.ReactNode }> = {
    announcement: { label: 'Announcements', icon: <Megaphone className="h-3.5 w-3.5" /> },
    class: { label: 'Classes', icon: <BookOpen className="h-3.5 w-3.5" /> },
    teacher: { label: 'Teachers', icon: <User className="h-3.5 w-3.5" /> },
    parent: { label: 'Parents', icon: <Heart className="h-3.5 w-3.5" /> },
    friend: { label: 'Friends', icon: <Users className="h-3.5 w-3.5" /> },
};

export default function ConversationList({
    fallbackConversations,
    activeId,
    onSelect,
    latestWsEvent,
}: ConversationListProps) {
    const [search, setSearch] = useState('');
    const { currentUser } = useRole();
    const [conversations, setConversations] = useState<Conversation[]>(fallbackConversations);
    const [isUsingRealData, setIsUsingRealData] = useState(false);

    // ── Load real conversations from API ─────────────────────────────────────────
    useEffect(() => {
        getConversations()
            .then(apiConvs => {
                if (apiConvs.length > 0) {
                    // Merge API convs with fallback (mock fills in name, participants, icon, etc.)
                    const merged = apiConvs.map(apiConv => {
                        const mock = fallbackConversations.find(m =>
                            m.name?.toLowerCase().includes(apiConv.name?.toLowerCase() || '') ||
                            m.id === apiConv.id
                        );
                        return mock
                            ? { ...mock, id: apiConv.id, category: apiConv.category ?? mock.category }
                            : apiConv;
                    });
                    setConversations(merged);
                    setIsUsingRealData(true);
                }
            })
            .catch(() => {
                // Stay with mock data silently
                setConversations(fallbackConversations);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── React to real-time WS events (Phase 6) ──────────────────────────────────
    useEffect(() => {
        if (!latestWsEvent) return;

        switch (latestWsEvent.type) {
            case 'new_message': {
                const { channelId, message } = latestWsEvent;
                if (!channelId || !message) return;

                setConversations(prev => prev.map(conv => {
                    if (conv.id !== String(channelId)) return conv;

                    const isActive = conv.id === activeId;
                    return {
                        ...conv,
                        // Map server message → lastMessage preview
                        lastMessage: {
                            id: String(message.id || ''),
                            conversationId: conv.id,
                            senderId: String(message.authorId || ''),
                            senderRole: message.senderRole || 'student',
                            type: message.messageType || 'text',
                            content: message.content,
                            status: 'delivered' as const,
                            timestamp: new Date(message.createdAt || Date.now()),
                            deliveredTo: [],
                            readBy: [],
                        },
                        // Increment unread only if this channel is not currently open
                        unreadCount: isActive ? 0 : (conv.unreadCount || 0) + 1,
                    };
                }));
                break;
            }

            case 'unread_updated': {
                const { channelId, delta } = latestWsEvent;
                if (!channelId) return;
                setConversations(prev => prev.map(conv =>
                    conv.id === String(channelId) && conv.id !== activeId
                        ? { ...conv, unreadCount: (conv.unreadCount || 0) + (delta || 1) }
                        : conv
                ));
                break;
            }
        }
    }, [latestWsEvent, activeId]);

    // ── Mark conversation as read when selected ──────────────────────────────────
    const handleSelect = useCallback((conv: Conversation) => {
        // Reset local unread count immediately
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));

        // Persist to backend if we know the numeric channel ID
        const numId = Number(conv.id);
        if (!isNaN(numId)) {
            markConversationRead(numId).catch(() => null);
        }

        onSelect(conv);
    }, [onSelect]);

    const filtered = useMemo(() =>
        conversations.filter(c =>
            !search || (c.name || '').toLowerCase().includes(search.toLowerCase())
        ),
        [conversations, search]
    );

    const grouped = useMemo(() => {
        const map: Partial<Record<ConversationCategory, Conversation[]>> = {};
        for (const conv of filtered) {
            if (!map[conv.category]) map[conv.category] = [];
            map[conv.category]!.push(conv);
        }
        return map;
    }, [filtered]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-foreground">Messages</h2>
                    {!isUsingRealData && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <WifiOff className="h-3 w-3" /> Demo
                        </span>
                    )}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search conversations..."
                        className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
                    />
                </div>
            </div>

            {/* Conversation groups */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
                {categoryOrder.map(category => {
                    const convs = grouped[category];
                    if (!convs?.length) return null;
                    const { label, icon } = categoryConfig[category];

                    return (
                        <div key={category} className="mb-1">
                            <div className="flex items-center gap-1.5 px-4 py-1.5">
                                <span className="text-muted-foreground/60">{icon}</span>
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    {label}
                                </span>
                            </div>

                            {convs.map(conv => {
                                const isActive = conv.id === activeId;
                                const partner = !conv.isGroup ? conv.participants.find(p => p.id !== currentUser.id) : null;
                                const isOnline = !conv.isGroup && partner?.isOnline;
                                const lastMsg = conv.lastMessage;

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelect(conv)}
                                        className={cn(
                                            'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50',
                                            isActive && 'bg-primary/8 hover:bg-primary/8'
                                        )}
                                    >
                                        <div className="relative flex-shrink-0 mt-0.5">
                                            <div className={cn(
                                                'h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold',
                                                isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                            )}>
                                                {conv.icon || (conv.name?.[0] || '?')}
                                            </div>
                                            {isOnline && (
                                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-online border-2 border-background" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={cn('text-sm font-medium truncate', isActive ? 'text-primary' : 'text-foreground')}>
                                                    {conv.name}
                                                </span>
                                                {lastMsg && (
                                                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                                        {formatDistanceToNow(new Date(lastMsg.timestamp), { addSuffix: false })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {lastMsg
                                                        ? `${lastMsg.senderId === currentUser.id ? 'You: ' : ''}${lastMsg.content}`
                                                        : conv.typing?.length
                                                            ? 'typing...'
                                                            : 'No messages yet'}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="flex-shrink-0 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        No conversations found
                    </div>
                )}
            </div>
        </div>
    );
}
