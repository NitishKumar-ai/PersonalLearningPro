import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Sparkles, School, BookOpen, MessageSquarePlus,
    MonitorPlay, BrainCircuit, UsersRound, Activity, Clock, ChevronRight,
    Bell, Check, X, Calendar, UserPlus, PlayCircle, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Mock Data
const MOCK_ONLINE_FRIENDS = [
    { id: 1, name: "Sarah Jenkins", activity: "Studying Calculus", isOnline: true, role: "student" },
    { id: 2, name: "David Kim", activity: "In Global Study Hall", isOnline: true, role: "student" },
    { id: 3, name: "Elena Rodriguez", activity: "Online", isOnline: true, role: "teacher" },
];

const MOCK_COMMUNITIES = [
    { id: 1, name: "Global Study Hall", members: "1.2k", online: 340, icon: School, color: "emerald", desc: "Open 24/7 for focused sessions." },
    { id: 2, name: "Science & Tech", members: 840, online: 120, icon: BookOpen, color: "purple", desc: "Discuss the latest breakthroughs." },
    { id: 3, name: "Math Olympiad Prep", members: 420, online: 85, icon: BrainCircuit, color: "blue", desc: "Advanced problem solving." },
    { id: 4, name: "Language Exchange", members: 950, online: 210, icon: UsersRound, color: "orange", desc: "Practice languages with native speakers." },
];

const MOCK_LIVE_ROOMS = [
    { id: 1, name: "Biology 101 Midterm Prep", participants: 12, host: "Mr. Davis", tags: ["Biology", "Midterm"], isTeacher: true },
    { id: 2, name: "Calculus Homework Help", participants: 8, host: "Sarah J.", tags: ["Math", "Peer-led"], isTeacher: false },
];

const MOCK_REQUESTS = [
    { id: 1, name: "Alex Chen", mutual: 3, time: "2h ago" }
];

interface MessagingHomeProps {
    currentUser: any;
}

export function MessagingHome({ currentUser }: MessagingHomeProps) {
    return (
        <motion.div
            key="friends-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-[1_1_0%] overflow-hidden bg-transparent"
        >
            {/* Center Panel - Main Content */}
            <div className="flex-[1_1_0%] flex flex-col min-w-0 bg-transparent">
                {/* Header */}
                <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between shadow-sm z-10 shrink-0 bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-white font-semibold flex-shrink-0">
                            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="tracking-wide">Friends & Comm</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="relative group hidden sm:block">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search users or groups..."
                                className="bg-black/30 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white w-48 focus:w-64 transition-all duration-300 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-white/30"
                            />
                        </div>
                        <Button className="bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
                            Add Friend
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 sm:px-6 md:px-10 py-8 custom-scrollbar relative z-0">
                    <div className="max-w-5xl mx-auto space-y-10 pb-12">

                        {/* 1. Resume Panel */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-gradient-to-r from-black/40 to-black/20 border border-white/10 hover:border-indigo-500/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:justify-between group transition-all duration-500 relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none"></div>

                            <div className="flex items-start sm:items-center gap-5 sm:gap-6 relative z-10 w-full sm:w-auto">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                    <Activity className="h-7 w-7 sm:h-8 sm:w-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 px-2.5 py-0">In Progress</Badge>
                                        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">AP Physics Mechanics</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl text-white font-bold truncate">Kinematics Review</h3>
                                    <p className="text-white/60 text-sm mt-1 sm:mt-1.5 line-clamp-1 sm:line-clamp-none">You spent 45m here yesterday. 60% complete.</p>
                                </div>
                            </div>

                            <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-semibold px-8 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all z-10 hover:scale-105 active:scale-95">
                                <PlayCircle className="mr-2 h-5 w-5" /> Resume
                            </Button>
                        </motion.div>

                        {/* 2. Quick Actions */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl text-white font-bold flex items-center gap-2">
                                    Quick Actions <Sparkles className="h-5 w-5 text-indigo-400" />
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <QuickActionCard icon={UsersRound} title="Find Partner" desc="Match with a peer" color="indigo" />
                                <QuickActionCard icon={MonitorPlay} title="Join Room" desc="Hop into a session" color="emerald" />
                                <QuickActionCard icon={Clock} title="Focus Session" desc="Start a timer" color="purple" />
                                <QuickActionCard icon={BrainCircuit} title="Ask AI Tutor" desc="Get instant help" color="blue" />
                            </div>
                        </motion.div>

                        {/* 3. Live Study Rooms */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl text-white font-bold flex items-center gap-2">
                                    Live Rooms
                                    <span className="flex h-3 w-3 relative ml-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                </h2>
                                <Button variant="ghost" className="text-white/50 hover:text-white h-8 text-sm px-3 hover:bg-white/10 transition-colors">
                                    View All
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_LIVE_ROOMS.map((room) => (
                                    <div key={room.id} className="bg-black/20 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all duration-300 group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge variant="outline" className={cn("inline-flex items-center gap-1", room.isTeacher ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10")}>
                                                    {room.isTeacher ? <School className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                                    {room.isTeacher ? "Teacher-Led" : "Student-Led"}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-white/60 text-sm font-medium bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                                                    <UsersRound className="h-3.5 w-3.5" />
                                                    {room.participants}
                                                </div>
                                            </div>
                                            <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">{room.name}</h3>
                                            <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
                                                <span>Host: <span className="text-white/80 font-medium">{room.host}</span></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex gap-2">
                                                {room.tags.map(tag => (
                                                    <span key={tag} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-md border border-white/5 truncate max-w-[80px] sm:max-w-none">{tag}</span>
                                                ))}
                                            </div>
                                            <Button size="sm" className={cn(
                                                "font-medium border transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0",
                                                room.isTeacher ? "bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border-amber-500/30 hover:border-amber-500" : "bg-white/10 hover:bg-emerald-500 text-white border-white/10 hover:border-emerald-500"
                                            )}>
                                                Join
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 4. Discover Communities */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl text-white font-bold flex items-center gap-2">Discover Communities</h2>
                                <Button variant="ghost" className="text-white/50 hover:text-white h-8 text-sm px-3 hover:bg-white/10 transition-colors">
                                    Explore <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_COMMUNITIES.map((community) => {
                                    const Icon = community.icon;
                                    const colorMap: Record<string, string> = {
                                        emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-500/30",
                                        purple: "bg-purple-500/20 text-purple-400 border-purple-500/30 group-hover:bg-purple-500/30",
                                        blue: "bg-blue-500/20 text-blue-400 border-blue-500/30 group-hover:bg-blue-500/30",
                                        orange: "bg-orange-500/20 text-orange-400 border-orange-500/30 group-hover:bg-orange-500/30",
                                        indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 group-hover:bg-indigo-500/30"
                                    };
                                    const glowMap: Record<string, string> = {
                                        emerald: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
                                        purple: "bg-purple-500/10 group-hover:bg-purple-500/20",
                                        blue: "bg-blue-500/10 group-hover:bg-blue-500/20",
                                        orange: "bg-orange-500/10 group-hover:bg-orange-500/20",
                                        indigo: "bg-indigo-500/10 group-hover:bg-indigo-500/20"
                                    };

                                    return (
                                        <button key={community.id} className="flex flex-col bg-white/[0.03] border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden h-full truncate text-ellipsis">
                                            <div className={cn("absolute -right-4 -top-4 w-28 h-28 rounded-full blur-3xl transition-all pointer-events-none", glowMap[community.color])}></div>

                                            <div className="flex items-start justify-between w-full mb-4 relative z-10">
                                                <div className={cn("p-2.5 rounded-xl border transition-all", colorMap[community.color])}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded-md border border-white/5">{community.members} members</span>
                                                    <span className="text-[10px] text-emerald-400 font-medium mt-1 uppercase tracking-wider flex items-center gap-1.5 min-w-0">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] shrink-0"></span>
                                                        <span className="truncate">{community.online} online</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-white transition-colors">{community.name}</h3>
                                                <p className="text-white/50 text-sm leading-relaxed whitespace-break-spaces">{community.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                    </div>
                </ScrollArea>
            </div>

            {/* Right Panel - Active Friends & Activity Sidebar */}
            <div className="w-[320px] 2xl:w-[360px] border-l border-white/5 hidden lg:flex flex-col bg-black/20 backdrop-blur-xl shrink-0 z-20 shadow-2xl relative">
                <div className="h-14 border-b border-white/5 flex items-center px-6 font-semibold shrink-0 bg-transparent">
                    <span className="text-white tracking-wide">Activity Console</span>
                </div>

                <ScrollArea className="flex-1 px-6 py-6 custom-scrollbar relative z-0">
                    {/* Friend Requests */}
                    {MOCK_REQUESTS.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4 px-1">Pending Requests — {MOCK_REQUESTS.length}</h3>
                            <div className="space-y-3">
                                {MOCK_REQUESTS.map(req => (
                                    <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 ring-1 ring-white/10">
                                                <AvatarFallback className="bg-indigo-500/20 text-indigo-400">{getInitials(req.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{req.name}</p>
                                                <p className="text-xs text-white/40 flex flex-wrap gap-x-2">
                                                    <span>{req.mutual} mutuals</span>
                                                    <span>•</span>
                                                    <span>{req.time}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full">
                                            <Button className="flex-1 bg-indigo-500 hover:bg-indigo-600 h-8 text-xs font-semibold shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all">
                                                <Check className="h-4 w-4 mr-1" /> Accept
                                            </Button>
                                            <Button variant="ghost" className="flex-none bg-white/5 hover:bg-white/10 h-8 w-8 p-0 text-white/50 hover:text-white transition-all">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator className="mt-6 bg-white/10" />
                        </div>
                    )}

                    {/* Active Friends */}
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4 px-1">Online — {MOCK_ONLINE_FRIENDS.length}</h3>

                        {MOCK_ONLINE_FRIENDS.length > 0 ? (
                            <div className="space-y-1">
                                {MOCK_ONLINE_FRIENDS.map(friend => (
                                    <button key={friend.id} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group text-left">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                                                <AvatarFallback className="bg-black/40 text-white/70">{getInitials(friend.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#161824] shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className="text-[14px] font-semibold text-white/90 group-hover:text-white truncate">{friend.name}</p>
                                            </div>
                                            <p className="text-[12px] text-white/50 truncate flex items-center gap-1.5 group-hover:text-white/70 transition-colors">
                                                {friend.activity.includes("Study") ? <School className="h-3 w-3 text-indigo-400" /> : null}
                                                {friend.activity}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1.5 rounded-lg border border-white/5 text-white/50 hover:text-white hover:bg-white/10 backdrop-blur-md">
                                            <MessageSquarePlus className="h-4 w-4" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center mt-6 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                                <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                                    <Users className="h-6 w-6 text-white/40" />
                                </div>
                                <p className="text-white font-semibold mb-1 relative z-10">It's quiet for now...</p>
                                <p className="text-white/50 text-xs relative z-10 leading-relaxed">When a friend starts an activity, we'll show it right here!</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Find Friends Button fixed at bottom right */}
                <div className="p-6 border-t border-white/5 bg-transparent shrink-0 backdrop-blur-xl">
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-medium h-10 shadow-sm flex items-center justify-center">
                        <UserPlus className="h-4 w-4 mr-2 text-indigo-400" /> Invite Friends
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

function QuickActionCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    const colorMap: Record<string, string> = {
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] hover:shadow-[0_5px_20px_rgba(99,102,241,0.2)]",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_5px_20px_rgba(16,185,129,0.2)]",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_5px_20px_rgba(168,85,247,0.2)]",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_5px_20px_rgba(59,130,246,0.2)]"
    };

    return (
        <button className={cn("flex flex-col items-center flex-1 justify-center p-4 sm:p-5 rounded-2xl border transition-all duration-300 group text-center backdrop-blur-md hover:-translate-y-1 h-auto min-h-[140px]", colorMap[color])}>
            <div className="mb-3 bg-black/20 p-3 rounded-xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-white font-semibold text-[14px] sm:text-[15px] mb-1 group-hover:text-white transition-colors line-clamp-1">{title}</h3>
            <p className="text-white/50 text-[11px] sm:text-[12px] font-medium hidden sm:block">{desc}</p>
        </button>
    );
}
