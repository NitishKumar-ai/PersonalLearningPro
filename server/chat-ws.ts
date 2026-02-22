import { WebSocketServer, WebSocket, type RawData } from "ws";
import type { Server } from "http";
import type { Store } from "express-session";
import { storage } from "./storage";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientMeta {
    userId: number;
    username: string;
    channels: Set<number>;
}

interface IncomingEvent {
    type: "join_channel" | "leave_channel" | "send_message" | "typing";
    channelId?: number;
    content?: string;
    messageType?: "text" | "file" | "image";
    fileUrl?: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

/** channelId → Set of subscribed WebSocket clients */
const channelSubscribers = new Map<number, Set<WebSocket>>();

/** ws → metadata about the connected user */
const clientMeta = new Map<WebSocket, ClientMeta>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function send(ws: WebSocket, data: object) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function broadcastToChannel(channelId: number, data: object, exclude?: WebSocket) {
    const subs = channelSubscribers.get(channelId);
    if (!subs) return;
    for (const client of Array.from(subs)) {
        if (client !== exclude) {
            send(client, data);
        }
    }
}

function subscribeToChannel(ws: WebSocket, channelId: number) {
    if (!channelSubscribers.has(channelId)) {
        channelSubscribers.set(channelId, new Set());
    }
    channelSubscribers.get(channelId)!.add(ws);

    const meta = clientMeta.get(ws);
    if (meta) meta.channels.add(channelId);
}

function unsubscribeFromChannel(ws: WebSocket, channelId: number) {
    channelSubscribers.get(channelId)?.delete(ws);
    const meta = clientMeta.get(ws);
    if (meta) meta.channels.delete(channelId);
}

function cleanupClient(ws: WebSocket) {
    const meta = clientMeta.get(ws);
    if (!meta) return;

    // Remove from all subscribed channels
    for (const channelId of Array.from(meta.channels)) {
        channelSubscribers.get(channelId)?.delete(ws);

        // Notify remaining subscribers that user went offline
        broadcastToChannel(channelId, {
            type: "user_presence",
            userId: meta.userId,
            username: meta.username,
            status: "offline",
            channelId,
        });
    }

    clientMeta.delete(ws);
}

// ─── Session-based auth ───────────────────────────────────────────────────────

async function getUserIdFromSession(
    sessionStore: Store,
    req: any
): Promise<number | null> {
    return new Promise((resolve) => {
        // Express session cookie is "connect.sid" by default
        const cookieHeader = req.headers?.cookie || "";
        const match = cookieHeader.match(/connect\.sid=([^;]+)/);
        if (!match) return resolve(null);

        // Decode the session ID (express-session encodes with "s:" prefix + URL-encoding)
        let sid = decodeURIComponent(match[1]);
        if (sid.startsWith("s:")) {
            sid = sid.slice(2).split(".")[0]; // strip signature
        }

        sessionStore.get(sid, (err: any, session: any) => {
            if (err || !session?.userId) return resolve(null);
            resolve(session.userId);
        });
    });
}

// ─── Main setup function ──────────────────────────────────────────────────────

export function setupChatWebSocket(httpServer: Server, sessionStore: Store) {
    const wss = new WebSocketServer({ server: httpServer, path: "/ws/chat" });

    wss.on("connection", async (ws: WebSocket, req: any) => {
        // Authenticate via session
        const userId = await getUserIdFromSession(sessionStore, req);

        if (!userId) {
            send(ws, { type: "error", message: "Unauthorized. Please log in." });
            ws.close(4001, "Unauthorized");
            return;
        }

        // Fetch user info
        const user = await storage.getUser(userId);
        if (!user) {
            send(ws, { type: "error", message: "User not found." });
            ws.close(4001, "User not found");
            return;
        }

        // Register client
        clientMeta.set(ws, {
            userId,
            username: user.username,
            channels: new Set(),
        });

        send(ws, {
            type: "connected",
            userId,
            username: user.username,
        });

        // ─── Message handler ──────────────────────────────────────────────────
        ws.on("message", async (raw: RawData) => {
            let event: IncomingEvent;

            try {
                event = JSON.parse(raw.toString());
            } catch {
                send(ws, { type: "error", message: "Invalid JSON payload." });
                return;
            }

            const meta = clientMeta.get(ws);
            if (!meta) return;

            switch (event.type) {
                // ── join_channel ────────────────────────────────────────────────
                case "join_channel": {
                    const channelId = event.channelId;
                    if (!channelId) {
                        send(ws, { type: "error", message: "channelId is required for join_channel." });
                        return;
                    }

                    // Verify channel exists
                    const channel = await storage.getChannel(channelId);
                    if (!channel) {
                        send(ws, { type: "error", message: "Channel not found." });
                        return;
                    }

                    // Verify user is a workspace member
                    const workspace = await storage.getWorkspace(channel.workspaceId);
                    if (!workspace || !workspace.members.includes(userId)) {
                        send(ws, { type: "error", message: "You are not a member of this workspace." });
                        return;
                    }

                    subscribeToChannel(ws, channelId);

                    send(ws, { type: "joined_channel", channelId });

                    // Notify others that this user is online in the channel
                    broadcastToChannel(channelId, {
                        type: "user_presence",
                        userId,
                        username: meta.username,
                        status: "online",
                        channelId,
                    }, ws);
                    break;
                }

                // ── leave_channel ───────────────────────────────────────────────
                case "leave_channel": {
                    const channelId = event.channelId;
                    if (!channelId) return;

                    unsubscribeFromChannel(ws, channelId);
                    send(ws, { type: "left_channel", channelId });

                    broadcastToChannel(channelId, {
                        type: "user_presence",
                        userId,
                        username: meta.username,
                        status: "offline",
                        channelId,
                    });
                    break;
                }

                // ── send_message ────────────────────────────────────────────────
                case "send_message": {
                    const { channelId, content, messageType = "text", fileUrl } = event;

                    if (!channelId || !content?.trim()) {
                        send(ws, { type: "error", message: "channelId and content are required." });
                        return;
                    }

                    // Ensure sender is subscribed to channel
                    if (!meta.channels.has(channelId)) {
                        send(ws, { type: "error", message: "Join the channel before sending messages." });
                        return;
                    }

                    try {
                        const message = await storage.createMessage({
                            channelId,
                            authorId: userId,
                            content: content.trim(),
                            type: messageType,
                            fileUrl: fileUrl ?? null,
                        });

                        const payload = {
                            type: "new_message",
                            message: {
                                ...message,
                                authorUsername: meta.username,
                            },
                        };

                        // Echo back to sender + broadcast to all other subscribers
                        send(ws, payload);
                        broadcastToChannel(channelId, payload, ws);
                    } catch (err) {
                        send(ws, { type: "error", message: "Failed to save message." });
                    }
                    break;
                }

                // ── typing ──────────────────────────────────────────────────────
                case "typing": {
                    const channelId = event.channelId;
                    if (!channelId || !meta.channels.has(channelId)) return;

                    broadcastToChannel(channelId, {
                        type: "user_typing",
                        userId,
                        username: meta.username,
                        channelId,
                    }, ws);
                    break;
                }

                default:
                    send(ws, { type: "error", message: `Unknown event type: ${(event as any).type}` });
            }
        });

        // ─── Cleanup on disconnect ────────────────────────────────────────────
        ws.on("close", () => cleanupClient(ws));
        ws.on("error", () => cleanupClient(ws));
    });

    console.log("[chat-ws] WebSocket server attached at path /ws/chat");
    return wss;
}
