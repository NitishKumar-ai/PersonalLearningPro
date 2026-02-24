import { useState, useEffect, useRef } from "react";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { cn, getInitials } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import { MessagingHome } from "@/components/messaging/messaging-home";
import {
    MessageSquare,
    Hash,
    Volume2,
    Megaphone,
    Settings,
    Users,
    Send,
    Loader2,
    Menu,
    Image as ImageIcon,
    Paperclip,
    Smile,
    School,
    BookOpen,
    MessageSquarePlus,
    Search,
    Sparkles,
    Bot
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Pin } from "lucide-react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


// Types based on our schema
interface Channel {
    id: number;
    name: string;
    type: string;
    class: string | null;
    subject: string | null;
    unreadCount?: number;
    lastMessage?: string;
    pinnedMessage?: string;
}

interface Message {
    id: number | string;
    channelId: number;
    senderId: number | string;
    content: string;
    timestamp: string;
    senderName?: string;
    senderRole?: string;
    avatar?: string;
    read?: boolean;
    status?: 'sending' | 'sent' | 'error';
    attachment?: {
        url: string;
        type: 'image' | 'pdf' | 'other';
        name: string;
        isHomework?: boolean;
    };
    readBy?: number[];
    gradingStatus?: 'pending' | 'graded' | null;
}


interface Workspace {
    id: string;
    name: string;
    icon: React.ReactNode;
    isActive: boolean;
}

export default function Messages() {
    const { currentUser } = useFirebaseAuth();
    const [location, setLocation] = useLocation();
    const { toast } = useToast();

    const [channels, setChannels] = useState<Channel[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [typingUsers, setTypingUsers] = useState<Record<number, { username: string, expires: number }>>({});
    const lastTypingTimeRef = useRef<number>(0);

    const AI_TUTOR_ID = 999;

    const AI_TUTOR_NAME = "AI Tutor";


    const [inputValue, setInputValue] = useState("");
    const [isLoadingChannels, setIsLoadingChannels] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
    const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
    const [pendingAttachment, setPendingAttachment] = useState<{
        file: File | null;
        previewUrl: string;
        type: 'image' | 'pdf' | 'other';
        name: string;
        isHomework: boolean;
        uploading: boolean;
        progress: number;
    } | null>(null);
    const [lastTapTime, setLastTapTime] = useState(0);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [newChannelType, setNewChannelType] = useState<"text" | "announcement">("text");
    const [newChannelSubject, setNewChannelSubject] = useState("General");


    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fallback to Grade 11-A for demo purposes if user class is absent
    const userClass = currentUser.profile?.classId || "Grade 11-A";

    // Fetch Workspaces and Channels on Component Mount
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser.profile?.uid) return;
            setIsLoadingChannels(true);
            try {
                // Fetch Workspaces
                const wsRes = await apiRequest("GET", "/api/workspaces");
                const wsData: any[] = await wsRes.json();
                setWorkspaces(wsData.map(w => ({
                    id: w.id.toString(),
                    name: w.name,
                    icon: <School className="h-5 w-5" />,
                    isActive: w.name === userClass
                })));

                // Fetch Channels
                const chRes = await apiRequest("GET", `/api/channels/query/${encodeURIComponent(userClass)}`);
                const chData: Channel[] = await chRes.json();
                setChannels(chData);
                if (chData.length > 0 && !activeChannel) setActiveChannel(chData[0]);
            } catch (error) {
                console.error("Failed to fetch messaging data:", error);
            } finally {
                setIsLoadingChannels(false);
            }
        };
        fetchData();
    }, [userClass, currentUser.profile?.uid]);



    // Fetch Messages when Active Channel changes
    useEffect(() => {
        if (!activeChannel) return;

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const res = await apiRequest("GET", `/api/messages/${activeChannel.id}`);
                const data = await res.json();
                const enrichedData = data.map((msg: any) => ({ ...msg, read: true, status: 'sent' }));
                setMessages(enrichedData);

                // Mark latest message as read if not already
                if (enrichedData.length > 0 && currentUser.profile?.uid) {
                    const lastMsg = enrichedData[enrichedData.length - 1];
                    const myId = parseInt(currentUser.profile.uid);
                    if (!lastMsg.readBy?.includes(myId)) {
                        apiRequest("POST", `/api/messages/${lastMsg.id}/read`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setIsLoadingMessages(false);
                setTimeout(scrollToBottom, 100);
            }
        };
        fetchMessages();
    }, [activeChannel, currentUser.profile?.uid]);


    // Offline detection
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Cleanup typing status
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setTypingUsers(prev => {
                const next = { ...prev };
                let changed = false;
                for (const uid in next) {
                    if (next[uid].expires < now) {
                        delete next[uid];
                        changed = true;
                    }
                }
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Set up WebSocket connection with Reconnection
    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectTimeout: any = null;
        let reconnectCount = 0;

        const connect = () => {
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const host = window.location.host;
            const wsUrl = `${protocol}//${host}/ws/chat`;

            socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log("WebSocket connected");
                setWs(socket);
                reconnectCount = 0;

                // If we joined a channel before, rejoin it
                if (activeChannel) {
                    socket?.send(JSON.stringify({ type: "join_channel", channelId: activeChannel.id }));
                }
            };

            socket.onmessage = (event) => {
                try {
                    const wsMessage = JSON.parse(event.data);

                    if (wsMessage.type === "new_message") {
                        const newMsg = wsMessage.message;
                        setChannels(prev => prev.map(c => {
                            if (c.id === newMsg.channelId) {
                                return {
                                    ...c,
                                    lastMessage: newMsg.content,
                                    unreadCount: (!activeChannel || activeChannel.id !== c.id)
                                        ? (c.unreadCount || 0) + 1
                                        : 0
                                };
                            }
                            return c;
                        }));

                        setMessages(prev => {
                            if (activeChannel && newMsg.channelId === activeChannel.id) {
                                if (prev.some(m => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            }
                            return prev;
                        });
                        setTimeout(scrollToBottom, 50);

                        // If we are in the channel, mark as read
                        if (activeChannel && newMsg.channelId === activeChannel.id && currentUser.profile?.uid) {
                            socket?.send(JSON.stringify({ type: "mark_read", messageId: newMsg.id, channelId: newMsg.channelId }));
                        }
                    } else if (wsMessage.type === "message_read") {
                        const { messageId, userId } = wsMessage;
                        setMessages(prev => prev.map(m => {
                            if (m.id === messageId) {
                                return { ...m, readBy: Array.from(new Set([...(m.readBy || []), userId])) };
                            }
                            return m;
                        }));
                    } else if (wsMessage.type === "user_typing") {
                        const { userId, username, channelId } = wsMessage;
                        if (activeChannel && channelId === activeChannel.id && userId !== parseInt(currentUser.profile?.uid || "0")) {
                            setTypingUsers(prev => ({
                                ...prev,
                                [userId]: { username, expires: Date.now() + 3000 }
                            }));
                        }
                    } else if (wsMessage.type === "user_presence") {
                        console.log(`[Presence] User ${wsMessage.username} (${wsMessage.userId}) is now ${wsMessage.status} in channel ${wsMessage.channelId}`);
                    }
                } catch (e) {

                    console.error("Error parsing WS message:", e);
                }
            };

            socket.onclose = () => {
                console.log("WebSocket disconnected. Attempting reconnect...");
                setWs(null);
                const delay = Math.min(1000 * Math.pow(2, reconnectCount), 30000);
                reconnectTimeout = setTimeout(() => {
                    reconnectCount++;
                    connect();
                }, delay);
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
                socket?.close();
            };
        };

        connect();

        return () => {
            socket?.close();
            clearTimeout(reconnectTimeout);
        };
    }, [activeChannel, currentUser.profile?.uid]);

    const scrollToBottom = () => {
        // Handled dynamically by Virtuoso automatically
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!inputValue.trim() && !pendingAttachment) || !activeChannel || !currentUser.profile?.uid) return;

        if (pendingAttachment && !pendingAttachment.uploading) {
            setPendingAttachment(prev => prev ? { ...prev, uploading: true, progress: 0 } : null);

            try {
                // Real file upload
                const uploadRes = await apiRequest("POST", "/api/upload", {
                    name: pendingAttachment.name,
                    type: pendingAttachment.type,
                    // In a real app we'd send FormData
                });
                const { url } = await uploadRes.json();
                setPendingAttachment(prev => prev ? { ...prev, previewUrl: url, uploading: false, progress: 100 } : null);
            } catch (error) {
                toast({ title: "Upload failed", variant: "destructive" });
                setPendingAttachment(prev => prev ? { ...prev, uploading: false } : null);
                return;
            }
        }


        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            channelId: activeChannel.id,
            senderId: currentUser.profile.uid,
            senderName: currentUser.profile.displayName || "Unknown User",
            senderRole: currentUser.profile.role || "student",
            content: inputValue.trim() || (pendingAttachment ? `Shared a file: ${pendingAttachment.name}` : ""),
            timestamp: new Date().toISOString(),
            status: 'sending',
            attachment: pendingAttachment ? {
                url: pendingAttachment.previewUrl,
                type: pendingAttachment.type,
                name: pendingAttachment.name,
                isHomework: pendingAttachment.isHomework
            } : undefined
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInputValue("");
        setReplyingToMessage(null);
        setPendingAttachment(null);
        setTimeout(scrollToBottom, 50);

        try {
            const res = await apiRequest("POST", "/api/messages", {
                channelId: activeChannel.id,
                senderId: currentUser.profile.uid,
                senderName: currentUser.profile.displayName || "Unknown User",
                senderRole: currentUser.profile.role || "student",
                avatar: currentUser.profile.photoURL || null,
                content: optimisticMsg.content,
                attachment: optimisticMsg.attachment,
                replyToId: replyingToMessage?.id
            });
            const savedMsg = await res.json();
            setMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent', read: false } : m));
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Filter channels based on search query
    const filteredChannels = channels.filter(c =>
        c.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
        (c.subject || "").toLowerCase().includes(sidebarSearchQuery.toLowerCase())
    );

    // Group channels by subject for the sidebar
    const groupedChannels = filteredChannels.reduce((acc, channel) => {
        if (channel.type === "dm") {
            if (!acc["Direct Messages"]) acc["Direct Messages"] = [];
            acc["Direct Messages"].push(channel);
            return acc;
        }

        const subject = channel.subject || "General";
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(channel);
        return acc;
    }, {} as Record<string, Channel[]>);

    const getChannelIcon = (type: string, name?: string) => {
        switch (type) {
            case 'announcement': return <Megaphone className="h-4 w-4 shrink-0" />;
            case 'voice': return <Volume2 className="h-4 w-4 shrink-0" />;
            case 'dm': return (
                <Avatar className="h-4 w-4 shrink-0 mr-1">
                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary">{getInitials(name || "U")}</AvatarFallback>
                </Avatar>
            );
            default: return <Hash className="h-4 w-4 shrink-0" />;
        }
    };

    const handleNewDM = async () => {
        const otherUserId = window.prompt("Enter User ID to start a DM (e.g. 'student1' or 'teacher1'):");
        if (!otherUserId || !currentUser.profile?.uid) return;

        try {
            const res = await apiRequest("POST", "/api/channels/dm", {
                userIds: [currentUser.profile.uid, otherUserId]
            });
            const newDm = await res.json();

            // Check if it already exists in the list
            setChannels(prev => {
                if (prev.find(c => c.id === newDm.id)) return prev;
                return [...prev, newDm];
            });
            setActiveChannel(newDm);
        } catch (error) {
            console.error("Failed to start DM:", error);
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim() || !currentUser.profile?.uid) return;

        const activeWs = workspaces.find(w => w.name === userClass);
        if (!activeWs) {
            toast({ title: "No active workspace found", variant: "destructive" });
            return;
        }

        try {
            const res = await apiRequest("POST", "/api/channels", {
                name: newChannelName,
                type: newChannelType,
                workspaceId: parseInt(activeWs.id),
                class: userClass,
                subject: newChannelSubject
            });

            if (res.ok) {
                const newChannel = await res.json();
                setChannels(prev => [...prev, newChannel]);
                setActiveChannel(newChannel);
                setIsCreateChannelOpen(false);
                setNewChannelName("");
                toast({ title: "Channel created successfully" });
            }
        } catch (error) {
            console.error("Failed to create channel:", error);
            toast({ title: "Failed to create channel", variant: "destructive" });
        }
    };


    const handleFileAttach = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const type = file.type.startsWith('image/') ? 'image' :
            file.type === 'application/pdf' ? 'pdf' : 'other';

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setPendingAttachment({
                file,
                previewUrl: base64,
                type,
                name: file.name,
                isHomework: false,
                uploading: false,
                progress: 0
            });
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#0f111a] via-[#161824] to-[#0a0a0f] text-white selection:bg-indigo-500/30 relative"
        >
            {isOffline && (
                <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white text-[11px] text-center py-0.5 font-semibold z-[100] shadow-md flex items-center justify-center tracking-widest uppercase">
                    You are currently offline. Changes will sync when reconnected.
                </div>
            )}

            {/* PANEL 1: Far-Left Rail (Workspaces) - Glassmorphic */}
            <div className="w-[76px] bg-black/20 backdrop-blur-xl border-r border-white/5 flex-shrink-0 flex flex-col items-center py-4 gap-4 hidden md:flex z-30 shadow-2xl">
                <div className="relative group flex items-center justify-center w-full">
                    <button
                        className={cn(
                            "w-12 h-12 flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden relative z-10",
                            !activeChannel || activeChannel.type === "dm"
                                ? "bg-indigo-500 text-white rounded-[16px] shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                : "bg-white/5 text-white/70 hover:bg-indigo-500/80 hover:text-white rounded-[24px] hover:rounded-[16px]"
                        )}
                        onClick={() => setActiveChannel(null)}
                    >
                        <MessageSquare className="h-6 w-6" />
                    </button>
                    {(!activeChannel || activeChannel.type === "dm") ? (
                        <motion.div
                            layoutId="active-nav-pill-workspace"
                            className="absolute left-[2px] top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    ) : (
                        <div className="absolute left-[2px] top-1/2 -translate-y-1/2 w-1.5 h-0 bg-white/30 rounded-r-full group-hover:h-5 transition-all duration-300" />
                    )}
                </div>

                <Separator className="w-8 h-[2px] bg-white/10 my-1 rounded-full" />

                {workspaces.map((ws) => (
                    <div key={ws.id} className="relative group w-full flex items-center justify-center">
                        {ws.isActive ? (
                            <motion.div
                                layoutId="active-nav-pill-workspace"
                                className="absolute left-[2px] top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        ) : (
                            <div className="absolute left-[2px] top-1/2 -translate-y-1/2 w-1.5 h-0 bg-white/30 rounded-r-full group-hover:h-5 transition-all duration-300" />
                        )}
                        <button
                            className={cn(
                                "w-12 h-12 flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden",
                                ws.isActive
                                    ? "bg-indigo-500 text-white rounded-[16px] shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                    : "bg-white/5 text-white/70 hover:bg-indigo-500/80 hover:text-white rounded-[24px] hover:rounded-[16px]"
                            )}
                        >
                            {ws.icon}
                        </button>
                    </div>
                ))}

                <button className="w-12 h-12 rounded-[24px] bg-white/5 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:rounded-[16px] flex items-center justify-center transition-all duration-300 mt-2 shadow-lg">
                    <span className="text-2xl font-light mb-1">+</span>
                </button>
            </div>

            {/* PANEL 2: Channel Sidebar - Glassmorphic */}
            <div className={cn(
                "bg-black/10 backdrop-blur-md border-r border-white/5 flex flex-col transition-all duration-300 z-20 shadow-xl",
                isMobileSidebarOpen ? "w-72 absolute h-full left-0 border-r border-white/10 bg-[#161824]/95" : "hidden md:flex md:w-[260px]"
            )}>
                {/* Search / Top Nav */}
                <div className="h-14 border-b border-white/5 flex items-center px-4 font-semibold justify-between bg-black/20 shrink-0">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg flex items-center px-3 py-1.5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
                        <Search className="h-4 w-4 text-white/50 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Find a conversation"
                            value={sidebarSearchQuery}
                            onChange={(e) => setSidebarSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/50 w-full"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full shrink-0" onClick={() => setIsMobileSidebarOpen(false)}>
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3 py-4 custom-scrollbar">
                    {/* Friends Buttons */}
                    <div className="space-y-1 mb-6">
                        <button
                            onClick={() => setActiveChannel(null)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 relative group overflow-hidden",
                                activeChannel === null
                                    ? "text-white bg-indigo-500/20 border border-indigo-500/30"
                                    : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                            )}
                        >
                            {activeChannel === null && (
                                <motion.div layoutId="active-channel-bg" className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent -z-10" />
                            )}
                            <Users className={cn("h-5 w-5 transition-colors", activeChannel === null ? "text-indigo-400" : "text-white/50 group-hover:text-white/80")} />
                            Friends
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-white/60 hover:bg-white/5 hover:text-white border border-transparent transition-all duration-200 group">
                            <Settings className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-colors" />
                            Nitro
                        </button>
                    </div>

                    {isLoadingChannels ? (
                        <div className="flex items-center justify-center h-24">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-400 relative z-10" />
                            </div>
                        </div>
                    ) : (
                        Object.entries(groupedChannels).map(([subject, subjectChannels]) => (
                            <div key={subject} className="mb-5">
                                <div className="flex items-center justify-between px-2 mb-2 mt-4 group/header">
                                    <h3 className="text-xs uppercase font-bold text-white/40 group-hover/header:text-white/70 cursor-pointer tracking-widest transition-colors flex items-center gap-2">
                                        <span className="w-2 h-0.5 bg-white/20 rounded-full" />
                                        {subject}
                                    </h3>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-all">
                                        {subject === "Direct Messages" ? (
                                            <button
                                                onClick={handleNewDM}
                                                className="text-white/40 hover:text-indigo-400 transform hover:scale-110"
                                                title="Start new DM"
                                            >
                                                <MessageSquarePlus className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                                                <DialogTrigger asChild>
                                                    <button
                                                        onClick={() => setNewChannelSubject(subject)}
                                                        className="text-white/40 hover:text-indigo-400 transform hover:scale-110"
                                                        title="Create new channel"
                                                    >
                                                        <MessageSquarePlus className="h-4 w-4" />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-[#161824]/95 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                                            Create New Channel
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="name" className="text-white/70">Channel Name</Label>
                                                            <Input
                                                                id="name"
                                                                value={newChannelName}
                                                                onChange={(e) => setNewChannelName(e.target.value)}
                                                                placeholder="e.g. physics-help"
                                                                className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-white/70">Channel Type</Label>
                                                            <Select value={newChannelType} onValueChange={(v: any) => setNewChannelType(v)}>
                                                                <SelectTrigger className="bg-black/40 border-white/10 text-white">
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-[#161824]/95 border-white/10 text-white">
                                                                    <SelectItem value="text">Text Channel</SelectItem>
                                                                    <SelectItem value="announcement">Announcement Channel</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg flex items-center gap-3">
                                                            <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                                                            <p className="text-xs text-indigo-200/80 leading-relaxed">
                                                                This channel will be created in the <strong>{subject}</strong> category of <strong>{userClass}</strong>.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="ghost" onClick={() => setIsCreateChannelOpen(false)} className="text-white/60 hover:text-white hover:bg-white/5">
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleCreateChannel} className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                                                            Create Channel
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>

                                </div>
                                <div className="space-y-1">
                                    {subjectChannels.map((channel) => (
                                        <button
                                            key={channel.id}
                                            onClick={() => {
                                                setActiveChannel(channel);
                                                setIsMobileSidebarOpen(false);
                                                // Reset unread count when clicking on a channel
                                                setChannels(prev => prev.map(c =>
                                                    c.id === channel.id ? { ...c, unreadCount: 0 } : c
                                                ));
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium transition-all duration-200 relative group overflow-hidden",
                                                activeChannel?.id === channel.id
                                                    ? "text-white bg-indigo-500/20 border border-indigo-500/30"
                                                    : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                                            )}
                                        >
                                            {activeChannel?.id === channel.id && (
                                                <motion.div layoutId="active-channel-bg" className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent -z-10" />
                                            )}
                                            <span className={cn("transition-colors shrink-0", activeChannel?.id === channel.id ? "text-indigo-400" : "text-white/50 group-hover:text-white/80")}>
                                                {getChannelIcon(channel.type, channel.name)}
                                            </span>
                                            <div className="flex-1 overflow-hidden flex flex-col items-start min-w-0">
                                                <span className="truncate w-full text-left">{channel.name}</span>
                                                {channel.lastMessage && (
                                                    <span className="text-[11px] text-white/40 truncate w-full font-normal text-left">
                                                        {channel.lastMessage}
                                                    </span>
                                                )}
                                            </div>
                                            {(channel.unreadCount ?? 0) > 0 && (
                                                <div className="bg-indigo-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0 z-10" aria-label={`${channel.unreadCount} unread messages`}>
                                                    {channel.unreadCount! > 99 ? '99+' : channel.unreadCount}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>

                {/* User Mini Profile - Enhanced */}
                <div className="px-3 py-3 h-[68px] bg-black/20 border-t border-white/5 flex items-center gap-3 flex-shrink-0 backdrop-blur-lg">
                    <button className="flex items-center gap-3 hover:bg-white/5 p-1.5 -ml-1.5 rounded-xl flex-1 overflow-hidden transition-all duration-200 text-left group border border-transparent hover:border-white/10">
                        <div className="relative">
                            <Avatar className="h-9 w-9 rounded-full ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                                    {getInitials(currentUser.profile?.displayName || "User")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#161824]"></div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[14px] font-semibold text-white truncate leading-tight tracking-wide">{currentUser.profile?.displayName}</p>
                            <p className="text-[12px] text-emerald-400 truncate leading-tight font-medium mt-0.5">Online</p>
                        </div>
                    </button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                            <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* PANEL 3: Main Content Area */}
            <div className="flex-1 bg-transparent flex flex-col min-w-0 relative z-10">
                <AnimatePresence mode="wait">
                    {activeChannel === null ? (
                        /* FRIENDS VIEW (Extracted Component) */
                        <MessagingHome currentUser={currentUser} />
                    ) : (
                        /* CHAT VIEW (Preserved from original but styled) */
                        <motion.div
                            key="chat-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col flex-1 min-w-0 overflow-hidden"
                        >
                            {/* Chat Header - Glassmorphic */}
                            <div className="flex flex-col z-20 shrink-0 bg-black/20 backdrop-blur-md border-b border-white/5 shadow-sm">
                                <div className="h-14 flex items-center px-4 justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Button variant="ghost" size="icon" className="md:hidden mr-1 text-white/50 hover:text-white" onClick={() => setIsMobileSidebarOpen(true)}>
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                        <div className="p-1.5 bg-white/5 rounded-lg text-indigo-400">
                                            {getChannelIcon(activeChannel.type, activeChannel.name)}
                                        </div>
                                        <span className="font-bold text-white tracking-wide truncate text-lg">{activeChannel.name}</span>
                                        {activeChannel.subject && (
                                            <>
                                                <Separator orientation="vertical" className="h-5 mx-2 bg-white/10" />
                                                <span className="text-[14px] text-white/50 font-medium truncate pt-1">
                                                    {activeChannel.subject}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-white/50">
                                        <div className="hidden sm:flex items-center bg-black/30 border border-white/5 rounded-lg px-3 py-1.5 h-9 text-sm mr-2 transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
                                            <Search className="h-4 w-4 mr-2" />
                                            <input type="text" placeholder="Search" className="bg-transparent text-white border-none outline-none w-32 focus:w-48 transition-all duration-300 placeholder:text-white/30" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                            <Users className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Pinned Message Banner */}
                                {activeChannel.pinnedMessage && (
                                    <div className="bg-indigo-500/10 border-t border-indigo-500/20 px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-indigo-500/15 transition-colors">
                                        <Pin className="h-4 w-4 text-indigo-400 shrink-0 transform -rotate-45" />
                                        <div className="flex-1 truncate text-sm">
                                            <span className="font-semibold text-indigo-300 mr-2">Pinned:</span>
                                            <span className="text-white/80">{activeChannel.pinnedMessage}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message Feed */}
                            <div className="flex-1 px-4 py-4 bg-transparent z-10 relative flex flex-col min-h-0">
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
                                            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 relative z-10" />
                                        </div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col justify-end min-h-[100%] pb-12 pt-32 px-4 max-w-3xl mx-auto">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
                                            <Hash className="h-10 w-10 text-indigo-400" />
                                        </div>
                                        <h2 className="text-4xl font-bold mb-3 text-white tracking-tight">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">#{activeChannel.name}</span>!</h2>
                                        <p className="text-white/60 text-lg mb-4">This is the start of the #{activeChannel.name} channel. Say hi!</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 max-w-5xl mx-auto w-full h-full pb-20">
                                        <Virtuoso
                                            data={messages}
                                            initialTopMostItemIndex={messages.length - 1}
                                            followOutput="auto"
                                            className="h-full w-full custom-scrollbar"
                                            itemContent={(idx, msg) => {
                                                const prevMsg = messages[idx - 1];
                                                const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId ||
                                                    (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 5 * 60 * 1000);

                                                const date = new Date(msg.timestamp);
                                                const formatTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                const formatDate = date.toLocaleDateString();

                                                const isAI = Number(msg.senderId) === AI_TUTOR_ID;
                                                const isOwn = String(msg.senderId) === String(currentUser.profile?.uid);
                                                const isTeacherAnnouncement = activeChannel.type === 'announcement' && msg.senderRole === 'teacher';

                                                const handleTouchEnd = () => {
                                                    const now = Date.now();
                                                    const DOUBLE_TAP_DELAY = 300;
                                                    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
                                                        // Double tap detected - mock reaction
                                                        console.log("Double tapped message!", msg.id);
                                                    }
                                                    setLastTapTime(now);
                                                };

                                                return (
                                                    <ContextMenu>
                                                        <ContextMenuTrigger asChild>
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                onTouchEnd={handleTouchEnd}
                                                                className={cn(
                                                                    "relative group flex gap-4 px-2 hover:bg-white/[0.02] py-1 -mx-2 rounded-xl transition-colors duration-200",
                                                                    showHeader ? "mt-6" : "mt-1",
                                                                    isTeacherAnnouncement && "bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20"
                                                                )}
                                                            >
                                                                {/* Quick Actions overlay */}
                                                                <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-1 shadow-lg z-10 transition-opacity">
                                                                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors" onClick={() => setReplyingToMessage(msg)} title="Reply">
                                                                        <MessageSquarePlus className="h-4 w-4" />
                                                                    </button>
                                                                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-amber-400 transition-colors" title="React">
                                                                        <Smile className="h-4 w-4" />
                                                                    </button>
                                                                </div>

                                                                {showHeader ? (
                                                                    <Avatar className={cn(
                                                                        "h-10 w-10 shrink-0 cursor-pointer ring-2 ring-white/10 hover:ring-indigo-500/50 transition-all shadow-md",
                                                                        isAI && "ring-indigo-500/30"
                                                                    )}>
                                                                        <AvatarFallback className={cn(
                                                                            "bg-gradient-to-br text-white",
                                                                            isAI ? "from-indigo-600 to-indigo-800" : "from-indigo-500 to-purple-600"
                                                                        )}>
                                                                            {isAI ? <Bot className="h-5 w-5" /> : getInitials(msg.senderName || "U")}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                ) : (
                                                                    <div className="w-10 flex-shrink-0 text-right opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white/30 select-none mt-[2px] transition-opacity">
                                                                        {formatTime}
                                                                    </div>
                                                                )}

                                                                <div className="flex-1 flex flex-col min-w-0">
                                                                    {showHeader && (
                                                                        <div className="flex items-baseline gap-2 leading-none mb-1.5">
                                                                            <span className={cn(
                                                                                "font-semibold hover:underline cursor-pointer text-[15px] tracking-wide",
                                                                                msg.senderRole === "teacher" ? "text-amber-400" : (isAI ? "text-indigo-400" : "text-indigo-100")
                                                                            )}>
                                                                                {msg.senderName}
                                                                            </span>
                                                                            {isAI && (
                                                                                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-indigo-500/30">AI</span>
                                                                            )}
                                                                            <span className="text-xs text-white/40 font-medium ml-1 flex items-center gap-1">
                                                                                {formatDate} {formatTime}
                                                                                {isOwn && (
                                                                                    <span className="text-[10px] text-indigo-400 font-bold ml-1">
                                                                                        {msg.status === 'sending' ? '🕓' : msg.status === 'error' ? '❌' : msg.read ? '✔✔' : '✔'}
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    <div className={cn("text-white/90 text-[15px] leading-relaxed break-words", isTeacherAnnouncement && "mt-1")}>
                                                                        <div className={cn("prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-p:mb-0 last:prose-p:mb-0", isTeacherAnnouncement ? "text-amber-100/90" : "text-white/90")}>
                                                                            {isTeacherAnnouncement && showHeader && (
                                                                                <div className="flex items-center gap-1.5 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-500/10 w-fit px-2 py-0.5 rounded-md border border-amber-500/20">
                                                                                    <Megaphone className="h-3 w-3" />
                                                                                    Class Announcement
                                                                                </div>
                                                                            )}
                                                                            <ReactMarkdown
                                                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                                                rehypePlugins={[rehypeKatex]}
                                                                                components={{
                                                                                    p: ({ node, ...props }) => <p className="m-0 mb-0 last:mb-0 text-white/90" {...props} />,
                                                                                    a: ({ node, ...props }) => <a className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                                                                    code: ({ node, inline, ...props }: any) => (
                                                                                        inline ? (
                                                                                            <code className="bg-white/10 text-indigo-200 px-1.5 py-0.5 rounded text-[14px] font-mono border border-white/5" {...props} />
                                                                                        ) : (
                                                                                            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl overflow-x-auto my-3 border border-white/10 shadow-inner">
                                                                                                <code className="text-[13.5px] font-mono text-indigo-100" {...props} />
                                                                                            </div>
                                                                                        )
                                                                                    )
                                                                                }}
                                                                            >
                                                                                {msg.content}
                                                                            </ReactMarkdown>
                                                                        </div>

                                                                        {msg.attachment && (
                                                                            <div className={cn("mt-3 mb-1 p-3 rounded-xl border max-w-sm", msg.attachment.isHomework ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-black/20 border-white/10")}>
                                                                                {msg.attachment.isHomework && (
                                                                                    <div className="flex items-center gap-1.5 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                                                                        <School className="h-3 w-3" />
                                                                                        Homework Submission
                                                                                    </div>
                                                                                )}
                                                                                {msg.attachment.type === 'image' ? (
                                                                                    <img src={msg.attachment.url} alt={msg.attachment.name} className="w-full h-auto rounded-lg border border-white/10 shadow-sm" />
                                                                                ) : (
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="bg-white/10 p-2 rounded-lg">
                                                                                            <Paperclip className="h-5 w-5 text-indigo-400" />
                                                                                        </div>
                                                                                        <span className="text-sm font-medium truncate">{msg.attachment.name}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </ContextMenuTrigger>
                                                        <ContextMenuContent className="w-56 bg-[#161824]/95 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-xl z-50">
                                                            <ContextMenuItem onClick={() => setReplyingToMessage(msg)} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 py-2.5">
                                                                <MessageSquarePlus className="mr-3 h-4 w-4 text-indigo-400" />
                                                                <span>Reply</span>
                                                                <span className="ml-auto text-xs text-white/40 tracking-widest text-muted-foreground mr-1">⌘R</span>
                                                            </ContextMenuItem>
                                                            <ContextMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 py-2.5">
                                                                <Smile className="mr-3 h-4 w-4 text-emerald-400" />
                                                                <span>React</span>
                                                            </ContextMenuItem>
                                                            {isOwn && (
                                                                <ContextMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 py-2.5">
                                                                    <Settings className="mr-3 h-4 w-4 text-white/70" />
                                                                    <span>Edit Message</span>
                                                                </ContextMenuItem>
                                                            )}
                                                            {currentUser.profile?.role === 'teacher' && (
                                                                <ContextMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 py-2.5">
                                                                    <Pin className="mr-3 h-4 w-4 text-amber-400" />
                                                                    <span>Pin Message</span>
                                                                </ContextMenuItem>
                                                            )}
                                                            <ContextMenuSeparator className="bg-white/10 my-1" />
                                                            {isOwn || currentUser.profile?.role === 'teacher' ? (
                                                                <ContextMenuItem className="cursor-pointer hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 focus:text-red-400 py-2.5">
                                                                    <span className="font-medium">Delete</span>
                                                                    <span className="ml-auto text-xs opacity-60 tracking-widest mr-1">⌘⌫</span>
                                                                </ContextMenuItem>
                                                            ) : (
                                                                <ContextMenuItem className="cursor-pointer hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 focus:text-red-400 py-2.5">
                                                                    <span className="font-medium">Report</span>
                                                                </ContextMenuItem>
                                                            )}
                                                        </ContextMenuContent>
                                                    </ContextMenu>
                                                );
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Message Input Area - Floating Action Bar */}
                            <div className="absolute bottom-6 left-0 right-0 px-6 z-20 pointer-events-none">
                                <div className="max-w-4xl mx-auto pointer-events-auto flex flex-col justify-end relative">
                                    {/* Typing Indicator */}
                                    <AnimatePresence>
                                        {Object.keys(typingUsers).length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute -top-7 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 text-[11px] text-indigo-300 font-medium z-10 shadow-lg"
                                            >
                                                <div className="flex gap-1 items-center mr-1">
                                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                                                </div>
                                                {Object.values(typingUsers).length === 1
                                                    ? `${Object.values(typingUsers)[0].username} is typing...`
                                                    : `${Object.values(typingUsers).length} people are typing...`}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {replyingToMessage && (
                                        <div className="bg-[#161824]/95 backdrop-blur-md border-x border-t border-white/10 rounded-t-2xl px-4 py-3 pb-5 mb-[-12px] mx-2 relative z-0 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.2)]">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <MessageSquarePlus className="h-4 w-4 text-indigo-400 shrink-0" />
                                                <span className="text-xs text-indigo-300 font-semibold shrink-0">Replying to {replyingToMessage.senderName}:</span>
                                                <span className="text-[13px] text-white/60 truncate flex-1">{replyingToMessage.content}</span>
                                            </div>
                                            <button type="button" onClick={() => setReplyingToMessage(null)} className="text-white/40 hover:text-white ml-2 p-1 rounded-full hover:bg-white/10 transition-colors">
                                                <span className="text-[15px] font-bold leading-none">×</span>
                                            </button>
                                        </div>
                                    )}

                                    {pendingAttachment && (
                                        <div className="bg-[#161824]/95 backdrop-blur-md border border-white/10 rounded-t-2xl p-3 mb-[-8px] pb-4 flex items-center gap-4 relative shadow-xl mx-2 z-0">
                                            <button type="button" onClick={() => setPendingAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors z-20" disabled={pendingAttachment.uploading}>
                                                <span className="text-xs font-bold leading-none flex items-center justify-center w-3 h-3">×</span>
                                            </button>

                                            {pendingAttachment.type === 'image' ? (
                                                <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                                                    <img src={pendingAttachment.previewUrl} className="w-full h-full object-cover" />
                                                    {pendingAttachment.uploading && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-white">{pendingAttachment.progress}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/10 relative">
                                                    <Paperclip className="h-6 w-6 text-white/50" />
                                                    {pendingAttachment.uploading && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-white">{pendingAttachment.progress}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-sm font-medium text-white truncate mb-2">{pendingAttachment.name}</p>
                                                {/* Homework Toggle */}
                                                <label className="flex items-center gap-2 cursor-pointer group w-fit">
                                                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", pendingAttachment.isHomework ? "bg-emerald-500 border-emerald-500" : "bg-black/20 border-white/30 group-hover:border-white/50")}>
                                                        {pendingAttachment.isHomework && <span className="text-white text-[10px] font-bold">✔</span>}
                                                    </div>
                                                    <span className="text-xs text-white/70 group-hover:text-white transition-colors select-none">Submit for grading</span>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={pendingAttachment.isHomework}
                                                        onChange={(e) => setPendingAttachment(prev => prev ? { ...prev, isHomework: e.target.checked } : null)}
                                                        disabled={pendingAttachment.uploading}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*,.pdf,.doc,.docx"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <form onSubmit={handleSendMessage} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center p-2 relative z-10 transition-all duration-300 focus-within:border-indigo-500/50 focus-within:shadow-[0_8px_32px_rgba(99,102,241,0.2)]">
                                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-white/50 shrink-0 rounded-xl hover:bg-white/10 hover:text-white transition-all" onClick={handleFileAttach}>
                                            <div className="bg-indigo-500/20 text-indigo-400 rounded-full p-1 h-7 w-7 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                <span className="font-bold leading-none mb-[2px]">+</span>
                                            </div>
                                        </Button>
                                        <Input
                                            value={inputValue}
                                            onChange={(e) => {
                                                setInputValue(e.target.value);
                                                // Send typing indicator every 2 seconds
                                                const now = Date.now();
                                                if (now - lastTypingTimeRef.current > 2000 && activeChannel && ws) {
                                                    ws.send(JSON.stringify({ type: "typing", channelId: activeChannel.id }));
                                                    lastTypingTimeRef.current = now;
                                                }
                                            }}
                                            onKeyDown={handleKeyDown}

                                            placeholder={`Message ${activeChannel.type === 'dm' ? '@' + activeChannel.name : '#' + activeChannel.name}`}
                                            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-[15px] px-3 h-12 text-white placeholder:text-white/40"
                                            disabled={activeChannel.type === 'announcement' && currentUser.profile?.role !== 'teacher'}
                                        />
                                        <div className="flex items-center gap-2 pr-2">
                                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-white/40 rounded-xl hover:bg-white/10 hover:text-indigo-400 transition-all">
                                                <Smile className="h-5 w-5" />
                                            </Button>
                                            <Button type="submit" variant="ghost" size="icon" className="h-10 w-10 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow-md transition-all group disabled:opacity-50">
                                                <Send className="h-5 w-5 -ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                            </Button>
                                        </div>
                                    </form>
                                    {activeChannel.type === 'announcement' && currentUser.profile?.role !== 'teacher' && (
                                        <p className="text-xs text-center mt-3 text-red-400/80 font-medium tracking-wide">Only teachers can send messages in this channel.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
