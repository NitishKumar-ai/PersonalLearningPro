import { useState } from "react";
import {
    Hash, Volume2, Megaphone, Settings, Search, ChevronDown, ChevronRight,
    X, Mic, Headphones, MessageSquarePlus, Plus, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials } from "@/lib/utils";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

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

interface ChannelSidebarProps {
    channels: Channel[];
    activeChannel: Channel | null;
    onSelectChannel: (channel: Channel) => void;
    workspaceName: string;
    currentUser: any;
    isLoadingChannels: boolean;
    onNewDM: () => void;
    onCreateChannel: (name: string, type: "text" | "announcement", subject: string) => void;
    onClose?: () => void;
}

export function ChannelSidebar({
    channels,
    activeChannel,
    onSelectChannel,
    workspaceName,
    currentUser,
    isLoadingChannels,
    onNewDM,
    onCreateChannel,
    onClose,
}: ChannelSidebarProps) {
    const [query, setQuery] = useState("");
    const [voiceExpanded, setVoiceExpanded] = useState<Record<string, boolean>>({});
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [newChannelType, setNewChannelType] = useState<"text" | "announcement">("text");

    const filtered = channels.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );

    const textChannels = filtered.filter(c => c.type === "text" || c.type === "announcement" || c.type === "dm");
    const voiceChannels = filtered.filter(c => c.type === "voice");

    const toggleVoice = (id: string) => {
        setVoiceExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreate = () => {
        onCreateChannel(newChannelName, newChannelType, "General");
        setNewChannelName("");
        setIsCreateOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "announcement": return <Megaphone className="h-4 w-4 shrink-0 text-amber-400" />;
            case "voice": return <Volume2 className="h-4 w-4 shrink-0" />;
            case "dm": return (
                <Avatar className="h-4 w-4 shrink-0">
                    <AvatarFallback className="text-[8px] bg-indigo-500/30 text-indigo-300">
                        {getInitials("DM")}
                    </AvatarFallback>
                </Avatar>
            );
            default: return <Hash className="h-4 w-4 shrink-0" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#2b2d31] text-[#949ba4]">
            {/* Server Name Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-black/30 shadow-sm shrink-0 bg-[#2b2d31]">
                <span className="font-bold text-[15px] text-[#f2f3f5] truncate">{workspaceName}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-[#949ba4] hover:text-[#dbdee1] transition-colors p-1 rounded"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Search bar */}
            <div className="px-3 pt-3 pb-1 shrink-0">
                <div className="flex items-center bg-[#1e1f22] rounded-md px-2 py-1.5 gap-2">
                    <Search className="h-3.5 w-3.5 text-[#949ba4]" />
                    <input
                        type="text"
                        placeholder="Find a channel"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-[13px] text-[#dbdee1] placeholder:text-[#949ba4] w-full"
                    />
                </div>
            </div>

            {/* Channel List */}
            <ScrollArea className="flex-1 px-2 py-2">
                {isLoadingChannels ? (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-5 w-5 animate-spin text-[#949ba4]" />
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {/* TEXT CHANNELS */}
                        {textChannels.length > 0 && (
                            <div className="mb-1">
                                <div className="flex items-center justify-between px-2 py-1 group/header">
                                    <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#949ba4] hover:text-[#dbdee1] transition-colors">
                                        <ChevronDown className="h-3 w-3" />
                                        Text Channels
                                    </button>
                                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                        <DialogTrigger asChild>
                                            <button
                                                title="Create channel"
                                                className="opacity-0 group-hover/header:opacity-100 text-[#949ba4] hover:text-[#dbdee1] transition-all"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#313338] border-[#1e1f22] text-[#dbdee1] rounded-xl shadow-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-white font-bold text-lg">Create Channel</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-2">
                                                <div className="space-y-2">
                                                    <Label className="text-[#b5bac1] text-[12px] uppercase font-bold tracking-widest">Channel Name</Label>
                                                    <Input
                                                        value={newChannelName}
                                                        onChange={e => setNewChannelName(e.target.value)}
                                                        placeholder="new-channel"
                                                        className="bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1] placeholder:text-[#4e5058] focus-visible:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[#b5bac1] text-[12px] uppercase font-bold tracking-widest">Channel Type</Label>
                                                    <Select value={newChannelType} onValueChange={(v: any) => setNewChannelType(v)}>
                                                        <SelectTrigger className="bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#2b2d31] border-[#1e1f22] text-[#dbdee1]">
                                                            <SelectItem value="text">Text Channel</SelectItem>
                                                            <SelectItem value="announcement">Announcement</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="bg-[#5865f2]/10 border border-[#5865f2]/20 p-3 rounded-lg flex items-start gap-3">
                                                    <Sparkles className="h-4 w-4 text-[#5865f2] mt-0.5 shrink-0" />
                                                    <p className="text-xs text-[#949ba4] leading-relaxed">
                                                        This channel will appear in the Text Channels section.
                                                    </p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-[#b5bac1] hover:text-white hover:bg-white/10">
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleCreate} className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                                                    Create Channel
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {textChannels.map(channel => {
                                    const isActive = activeChannel?.id === channel.id;
                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => onSelectChannel(channel)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2 py-[6px] rounded-[4px] text-[15px] transition-all duration-100 relative group/channel",
                                                isActive
                                                    ? "bg-[#404249] text-[#f2f3f5]"
                                                    : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
                                            )}
                                        >
                                            <span className={cn("shrink-0 transition-colors", isActive ? "text-[#dbdee1]" : "text-[#80848e]")}>
                                                {getIcon(channel.type)}
                                            </span>
                                            <span className="flex-1 text-left truncate text-[15px] font-medium">{channel.name}</span>
                                            {(channel.unreadCount ?? 0) > 0 && (
                                                <span className="bg-[#5865f2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                                                    {channel.unreadCount! > 99 ? "99+" : channel.unreadCount}
                                                </span>
                                            )}
                                            {/* DM new message button */}
                                            {channel.type === "dm" && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); onNewDM(); }}
                                                    className="opacity-0 group-hover/channel:opacity-100 text-[#949ba4] hover:text-[#dbdee1] transition-all ml-1"
                                                    title="New DM"
                                                >
                                                    <MessageSquarePlus className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* VOICE CHANNELS */}
                        {voiceChannels.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center px-2 py-1 group/header">
                                    <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#949ba4] hover:text-[#dbdee1] transition-colors">
                                        <ChevronDown className="h-3 w-3" />
                                        Voice Channels
                                    </button>
                                </div>
                                {voiceChannels.map(channel => {
                                    const isExpanded = !!voiceExpanded[channel.id];
                                    const isActive = activeChannel?.id === channel.id;
                                    return (
                                        <div key={channel.id}>
                                            <button
                                                onClick={() => {
                                                    onSelectChannel(channel);
                                                    toggleVoice(String(channel.id));
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-2 px-2 py-[6px] rounded-[4px] text-[15px] transition-all duration-100",
                                                    isActive
                                                        ? "bg-[#404249] text-[#f2f3f5]"
                                                        : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
                                                )}
                                            >
                                                <Volume2 className="h-4 w-4 shrink-0 text-[#80848e]" />
                                                <span className="flex-1 text-left truncate font-medium">{channel.name}</span>
                                                {isExpanded
                                                    ? <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                                                    : <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                                }
                                            </button>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="ml-6 mt-1 text-[12px] text-[#949ba4] px-2 py-1 italic">
                                                            No one is in this channel yet.
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Empty state */}
                        {textChannels.length === 0 && voiceChannels.length === 0 && !isLoadingChannels && (
                            <div className="text-center py-8 text-[#949ba4] text-[13px]">
                                No channels found
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* User Profile Bar */}
            <div className="h-[52px] bg-[#232428] flex items-center px-2 gap-2 shrink-0 border-t border-black/20">
                <div className="relative flex-shrink-0">
                    <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="bg-gradient-to-br from-[#5865f2] to-[#7c3aed] text-white text-xs font-bold rounded-full">
                            {getInitials(currentUser.profile?.displayName || "U")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#232428]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#f2f3f5] truncate leading-tight">
                        {currentUser.profile?.displayName || "User"}
                    </p>
                    <p className="text-[11px] text-[#949ba4] truncate leading-tight">
                        #{currentUser.profile?.uid?.toString().slice(0, 4) || "0000"}
                    </p>
                </div>
                <div className="flex items-center gap-0.5">
                    <button className="p-1.5 text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#35373c] rounded transition-all" title="Mic">
                        <Mic className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#35373c] rounded transition-all" title="Headphones">
                        <Headphones className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#35373c] rounded transition-all" title="Settings">
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
