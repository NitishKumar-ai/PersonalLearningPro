import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Hash,
    MessageSquare,
    Search,
    Bell,
    Settings,
    KanbanSquare,
    Users,
    FileText,
    Plus,
    ChevronDown,
    Paperclip,
    Smile,
    Send
} from "lucide-react";
import { useFirebaseAuth as useAuth } from "@/contexts/firebase-auth-context";
import TasksPage from "./tasks";
import { cn } from "@/lib/utils";

type ViewMode = "chat" | "board" | "files";
type Channel = { id: string; name: string; type: "public" | "private" };
type User = { id: string; name: string; avatar?: string; status: "online" | "offline" };

const CHANNELS: Channel[] = [
    { id: "c1", name: "calculus-101", type: "public" },
    { id: "c2", name: "physics-mechanics", type: "public" },
    { id: "c3", name: "project-group-b", type: "private" },
];

const DIRECT_MESSAGES: User[] = [
    { id: "u1", name: "Alice Smith", avatar: "https://i.pravatar.cc/150?u=alice", status: "online" },
    { id: "u2", name: "Bob Jones", avatar: "https://i.pravatar.cc/150?u=bob", status: "offline" },
    { id: "u3", name: "Mr. Davis (Teacher)", status: "online" },
];

export default function StudyArenaPage() {
    const [, setLocation] = useLocation();
    const { currentUser } = useAuth();
    const user = currentUser?.user;

    const [activeView, setActiveView] = useState<ViewMode>("chat");
    const [activeChannel, setActiveChannel] = useState<string>("c1");

    return (
        <div className="flex h-[calc(100vh-2rem)] rounded-xl border border-white/10 bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden shadow-2xl">

            {/* 1. Left Sidebar (Channels & Navigation) */}
            <div className="w-64 bg-[#0e0e0e] border-r border-white/5 flex flex-col flex-shrink-0">

                {/* Workspace Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 shrink-0 bg-[#111111]">
                    <div className="font-semibold text-[15px] tracking-tight text-zinc-100 flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            M
                        </div>
                        Master Plan <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </div>
                </div>

                {/* Global Nav Elements */}
                <div className="p-3">
                    <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/5 h-8 px-2 text-sm font-medium">
                        <Search className="w-4 h-4 mr-2" /> Search...
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="px-3 pb-4 space-y-6">

                        {/* Core Views */}
                        <div className="space-y-0.5">
                            <Button
                                variant="ghost"
                                className={cn("w-full justify-start h-8 px-2 text-sm font-medium transition-colors", activeView === "board" ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5")}
                                onClick={() => setActiveView("board")}
                            >
                                <KanbanSquare className="w-4 h-4 mr-2" /> Board
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn("w-full justify-start h-8 px-2 text-sm font-medium transition-colors", activeView === "files" ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5")}
                                onClick={() => setActiveView("files")}
                            >
                                <FileText className="w-4 h-4 mr-2" /> Files
                            </Button>
                        </div>

                        {/* Channels */}
                        <div>
                            <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer">
                                <span className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider">Channels</span>
                                <Plus className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-300" />
                            </div>
                            <div className="space-y-0.5">
                                {CHANNELS.map(channel => (
                                    <Button
                                        key={channel.id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start h-8 px-2 text-sm font-medium transition-colors",
                                            activeView === "chat" && activeChannel === channel.id ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                        )}
                                        onClick={() => { setActiveView("chat"); setActiveChannel(channel.id); }}
                                    >
                                        <Hash className="w-4 h-4 mr-1.5 opacity-60" /> {channel.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Direct Messages */}
                        <div>
                            <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer">
                                <span className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider">Direct Messages</span>
                                <Plus className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-300" />
                            </div>
                            <div className="space-y-0.5">
                                {DIRECT_MESSAGES.map(dm => (
                                    <Button
                                        key={dm.id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start h-8 px-2 text-sm font-medium transition-colors",
                                            activeView === "chat" && activeChannel === dm.id ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                        )}
                                        onClick={() => { setActiveView("chat"); setActiveChannel(dm.id); }}
                                    >
                                        <div className="relative mr-2 flex items-center justify-center w-4 h-4">
                                            {dm.avatar ? (
                                                <img src={dm.avatar} alt={dm.name} className="w-4 h-4 rounded-sm" />
                                            ) : (
                                                <div className="w-4 h-4 bg-zinc-800 rounded-sm flex items-center justify-center text-[8px] uppercase">{dm.name.substring(0, 2)}</div>
                                            )}
                                            {dm.status === 'online' && <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-[#0e0e0e]" />}
                                        </div>
                                        <span className="truncate">{dm.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* User Footer */}
                <div className="p-3 border-t border-white/5 shrink-0 bg-[#0e0e0e] flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Avatar className="w-7 h-7 rounded border border-white/10">
                            <AvatarImage src={user?.photoURL || ""} />
                            <AvatarFallback className="bg-indigo-600 rounded text-[10px] text-white">
                                {user?.displayName?.substring(0, 2).toUpperCase() || "ME"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">{user?.displayName || "Student"}</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online</span>
                        </div>
                    </div>
                    <Settings className="w-4 h-4 text-zinc-500" />
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative">
                {activeView === "board" && (
                    <div className="absolute inset-0 z-10 bg-[#0a0a0a] overflow-hidden rounded-xl">
                        <TasksPage />
                    </div>
                )}

                {/* Chat / Default View */}
                <div className={cn("flex-1 flex flex-col h-full", activeView === "board" && "hidden")}>
                    {/* Header */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0a]/80 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                                {CHANNELS.find(c => c.id === activeChannel) ? <Hash className="w-4 h-4 text-zinc-500" /> : null}
                                {CHANNELS.find(c => c.id === activeChannel)?.name || DIRECT_MESSAGES.find(m => m.id === activeChannel)?.name || "General"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-400">
                            <Users className="w-4 h-4 hover:text-zinc-200 cursor-pointer transition-colors" />
                            <Settings className="w-4 h-4 hover:text-zinc-200 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {activeView === "files" ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p>Shared files view coming soon.</p>
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            <ScrollArea className="flex-1 p-6">
                                <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                                    {/* Mock Intro */}
                                    <div className="flex flex-col items-center justify-center py-10 border-b border-white/5 mb-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                            <Hash className="w-8 h-8 text-zinc-400" />
                                        </div>
                                        <h2 className="text-xl font-medium text-white mb-2">Welcome to #{CHANNELS.find(c => c.id === activeChannel)?.name || "the channel"}</h2>
                                        <p className="text-zinc-500 text-sm max-w-md text-center">This is the start of the channel. Collaborate on assignments and share notes here.</p>
                                    </div>

                                    {/* Mock Messages */}
                                    <div className="flex gap-4 group">
                                        <Avatar className="w-9 h-9 rounded bg-[#151515] border border-white/10 shrink-0">
                                            <AvatarImage src="https://i.pravatar.cc/150?u=alice" />
                                            <AvatarFallback>AL</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-medium text-zinc-100 text-[15px]">Alice Smith</span>
                                                <span className="text-xs text-zinc-500">10:42 AM</span>
                                            </div>
                                            <p className="text-zinc-300 leading-relaxed text-[15px]">Hey everyone! Just dropped the notes for chapter 4 in the files tab. Let me know if you have questions.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 group mt-2">
                                        <Avatar className="w-9 h-9 rounded bg-[#151515] border border-white/10 shrink-0">
                                            <AvatarImage src="https://i.pravatar.cc/150?u=bob" />
                                            <AvatarFallback>BO</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-medium text-zinc-100 text-[15px]">Bob Jones</span>
                                                <span className="text-xs text-zinc-500">10:45 AM</span>
                                            </div>
                                            <p className="text-zinc-300 leading-relaxed text-[15px]">Awesome, thanks Alice! I'll review them before our study session tomorrow.</p>

                                            {/* Embedded File Mock */}
                                            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-[#151515] hover:bg-[#1a1a1a] transition-colors w-72 cursor-pointer group/file">
                                                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 group-hover/file:bg-red-500/20 transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-sm font-medium text-zinc-200 truncate">Chapter4_Notes.pdf</span>
                                                    <span className="text-xs text-zinc-500">2.4 MB PDF</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Message Input */}
                            <div className="p-4 shrink-0 max-w-4xl mx-auto w-full">
                                <div className="relative flex flex-col bg-[#111111] border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-sm">
                                    <textarea
                                        placeholder="Message the group..."
                                        className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 resize-none outline-none p-3 min-h-[44px] max-h-32 text-[15px] leading-relaxed"
                                        rows={1}
                                    />
                                    <div className="flex items-center justify-between p-2 bg-[#151515]/50 border-t border-white/5 rounded-b-xl">
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded bg-transparent hover:bg-white/10 text-zinc-400">
                                                <Paperclip className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded bg-transparent hover:bg-white/10 text-zinc-400">
                                                <Smile className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button size="sm" className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium">
                                            <Send className="w-3.5 h-3.5 mr-1.5" /> Send
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
