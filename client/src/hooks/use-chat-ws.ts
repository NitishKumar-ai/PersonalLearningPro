import { useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WsNewMessage {
    type: 'new_message';
    message: {
        id: number;
        channelId: number;
        authorId: number;
        authorUsername: string;
        content: string;
        messageType: 'text' | 'file' | 'image';
        fileUrl?: string;
        readBy: number[];
        createdAt: string;
    };
}

export interface WsTypingEvent {
    type: 'user_typing';
    userId: number;
    username: string;
    channelId: number;
}

export interface WsReadEvent {
    type: 'message_read';
    messageId: number;
    userId: number;
    channelId: number;
}

export interface WsPresenceEvent {
    type: 'user_presence';
    userId: number;
    username: string;
    status: 'online' | 'offline';
    channelId: number;
}

export type WsIncomingEvent =
    | WsNewMessage
    | WsTypingEvent
    | WsReadEvent
    | WsPresenceEvent
    | { type: 'connected'; userId: number; username: string }
    | { type: 'joined_channel'; channelId: number }
    | { type: 'left_channel'; channelId: number }
    | { type: 'error'; message: string };

// ─── Hook options ──────────────────────────────────────────────────────────

export interface UseChatWsOptions {
    /** Numeric channel ID to join on mount and leave on unmount */
    channelId?: number;
    onNewMessage?: (event: WsNewMessage) => void;
    onTyping?: (event: WsTypingEvent) => void;
    onRead?: (event: WsReadEvent) => void;
    onPresence?: (event: WsPresenceEvent) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useChatWs(options: UseChatWsOptions = {}) {
    const { channelId, onNewMessage, onTyping, onRead, onPresence } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectDelay = useRef(1000);
    const isMounted = useRef(true);

    // Stable callback refs so connect() doesn't close over stale values
    const onNewMessageRef = useRef(onNewMessage);
    const onTypingRef = useRef(onTyping);
    const onReadRef = useRef(onRead);
    const onPresenceRef = useRef(onPresence);
    onNewMessageRef.current = onNewMessage;
    onTypingRef.current = onTyping;
    onReadRef.current = onRead;
    onPresenceRef.current = onPresence;

    const channelIdRef = useRef(channelId);
    channelIdRef.current = channelId;

    const sendRaw = useCallback((data: object) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
            return true;
        }
        return false;
    }, []);

    const connect = useCallback(() => {
        if (!isMounted.current) return;

        // Build WS URL from current window location
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${proto}://${window.location.host}/ws/chat`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            if (!isMounted.current) { ws.close(); return; }
            reconnectDelay.current = 1000; // reset backoff on success

            // Join the active channel if provided
            if (channelIdRef.current != null) {
                ws.send(JSON.stringify({ type: 'join_channel', channelId: channelIdRef.current }));
            }
        };

        ws.onmessage = (event) => {
            let data: WsIncomingEvent;
            try {
                data = JSON.parse(event.data as string);
            } catch {
                return;
            }

            switch (data.type) {
                case 'new_message':
                    onNewMessageRef.current?.(data);
                    break;
                case 'user_typing':
                    onTypingRef.current?.(data);
                    break;
                case 'message_read':
                    onReadRef.current?.(data);
                    break;
                case 'user_presence':
                    onPresenceRef.current?.(data);
                    break;
                case 'error':
                    console.warn('[chat-ws] Server error:', data.message);
                    break;
                default:
                    break;
            }
        };

        ws.onclose = (ev) => {
            wsRef.current = null;
            // 4001 = unauthorized — don't reconnect
            if (ev.code === 4001) {
                console.warn('[chat-ws] Unauthorized. Not reconnecting.');
                return;
            }
            if (!isMounted.current) return;

            // Exponential backoff up to 30s
            const delay = Math.min(reconnectDelay.current, 30000);
            reconnectDelay.current = delay * 2;
            reconnectTimeout.current = setTimeout(connect, delay);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, []);

    // Mount / unmount
    useEffect(() => {
        isMounted.current = true;
        connect();

        return () => {
            isMounted.current = false;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
                wsRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Join / leave when channelId changes
    useEffect(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        if (channelId != null) {
            ws.send(JSON.stringify({ type: 'join_channel', channelId }));
        }

        return () => {
            const wsNow = wsRef.current;
            if (wsNow && wsNow.readyState === WebSocket.OPEN && channelId != null) {
                wsNow.send(JSON.stringify({ type: 'leave_channel', channelId }));
            }
        };
    }, [channelId]);

    // ─── Public API ─────────────────────────────────────────────────────────

    const sendMessage = useCallback(
        (chId: number, content: string, messageType: 'text' | 'file' | 'image' = 'text', fileUrl?: string) => {
            return sendRaw({ type: 'send_message', channelId: chId, content, messageType, fileUrl });
        },
        [sendRaw],
    );

    const sendTyping = useCallback(
        (chId: number) => sendRaw({ type: 'typing', channelId: chId }),
        [sendRaw],
    );

    const markRead = useCallback(
        (chId: number, messageId: number) => sendRaw({ type: 'mark_read', channelId: chId, messageId }),
        [sendRaw],
    );

    return { sendMessage, sendTyping, markRead };
}
