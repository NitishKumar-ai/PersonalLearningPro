import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, MoreHorizontal, Calendar, MessageSquare, Paperclip, ChevronDown, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: { name: string; avatar?: string };
    tags: string[];
    dueDate?: string;
    comments: number;
    attachments: number;
}

const MOCK_TASKS: Task[] = [
    {
        id: "PRO-101",
        title: "Research Calculus integration techniques",
        status: "backlog",
        priority: "medium",
        assignee: { name: "Alice" },
        tags: ["Math", "Research"],
        comments: 2,
        attachments: 0,
    },
    {
        id: "PRO-102",
        title: "Complete Physics Mechanics assignment",
        status: "todo",
        priority: "high",
        assignee: { name: "Bob", avatar: "https://i.pravatar.cc/150?u=bob" },
        tags: ["Physics", "Assignment"],
        dueDate: "Tomorrow",
        comments: 5,
        attachments: 2,
    },
    {
        id: "PRO-103",
        title: "Prepare presentation on Quantum Entanglement",
        status: "in-progress",
        priority: "urgent",
        assignee: { name: "You" },
        tags: ["Presentation", "Science"],
        dueDate: "Today",
        comments: 1,
        attachments: 4,
    },
    {
        id: "PRO-104",
        title: "Review peers' essays",
        status: "review",
        priority: "medium",
        tags: ["English", "Review"],
        comments: 0,
        attachments: 1,
    },
    {
        id: "PRO-105",
        title: "Read Chapter 4 of History textbook",
        status: "done",
        priority: "low",
        assignee: { name: "You" },
        tags: ["Reading"],
        comments: 0,
        attachments: 0,
    }
];

const STATUSES: { id: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "backlog", label: "Backlog", icon: <div className="w-3 h-3 rounded-full border-2 border-dashed border-zinc-500" />, color: "text-zinc-400" },
    { id: "todo", label: "To Do", icon: <div className="w-3 h-3 rounded-full border-2 border-zinc-300" />, color: "text-zinc-200" },
    { id: "in-progress", label: "In Progress", icon: <div className="w-3 h-3 rounded-full border-2 border-amber-500 bg-amber-500/20" />, color: "text-amber-400" },
    { id: "review", label: "Review", icon: <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500/20" />, color: "text-blue-400" },
    { id: "done", label: "Done", icon: <div className="w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-background rounded-full" /></div>, color: "text-indigo-400" }
];

const PRIORITY_ICONS: Record<TaskPriority, React.ReactNode> = {
    low: <div className="flex gap-0.5 mt-0.5"><div className="w-1.5 h-1.5 bg-zinc-500 rounded-sm" /><div className="w-1.5 h-1.5 bg-zinc-800 rounded-sm" /><div className="w-1.5 h-1.5 bg-zinc-800 rounded-sm" /></div>,
    medium: <div className="flex gap-0.5 mt-0.5"><div className="w-1.5 h-1.5 bg-amber-500 rounded-sm" /><div className="w-1.5 h-1.5 bg-amber-500 rounded-sm" /><div className="w-1.5 h-1.5 bg-zinc-800 rounded-sm" /></div>,
    high: <div className="flex gap-0.5 mt-0.5"><div className="w-1.5 h-1.5 bg-rose-500 rounded-sm" /><div className="w-1.5 h-1.5 bg-rose-500 rounded-sm" /><div className="w-1.5 h-1.5 bg-rose-500 rounded-sm" /></div>,
    urgent: <div className="w-4 h-4 rounded-sm bg-rose-600/20 flex items-center justify-center border border-rose-500/50"><div className="w-1 h-2 bg-rose-500 rounded-[1px]" /></div>,
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [draggedTask, setDraggedTask] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTask(id);
        e.dataTransfer.setData("taskId", id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");

        if (taskId) {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        }
        setDraggedTask(null);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-[#0e0e0e] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden rounded-xl border border-zinc-800/60 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                        <div className="w-4 h-4 bg-indigo-400 rounded-sm" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                            Master Plan <ChevronDown className="w-4 h-4 text-zinc-500" />
                        </h1>
                        <p className="text-xs text-zinc-500 font-medium tracking-wide">STUDY TRACKER</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 hidden sm:flex">
                        <Filter className="w-4 h-4 mr-2" /> View
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                        <Plus className="w-4 h-4 mr-1.5" />
                        New Issue
                    </Button>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 hidden-scrollbar bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNCkiLz48L3N2Zz4=')]">
                <div className="flex h-full gap-6 w-max items-start">
                    {STATUSES.map(status => {
                        const columnTasks = tasks.filter(t => t.status === status.id);

                        return (
                            <div
                                key={status.id}
                                className="w-[320px] shrink-0 flex flex-col max-h-full"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, status.id)}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between pl-1 pr-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        {status.icon}
                                        <span className={cn("text-sm font-medium tracking-wide", status.color)}>
                                            {status.label}
                                        </span>
                                        <span className="text-xs font-medium text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-md border border-zinc-800">
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-white/5 text-zinc-500">
                                        <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                </div>

                                {/* Task List */}
                                <div className="flex-1 overflow-y-auto hidden-scrollbar min-h-[100px] flex flex-col gap-2.5 pb-2">
                                    <AnimatePresence>
                                        {columnTasks.map(task => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                key={task.id}
                                                draggable
                                                onDragStart={(e: any) => handleDragStart(e, task.id)}
                                                onDragEnd={() => setDraggedTask(null)}
                                                className={cn(
                                                    "bg-[#151515] hover:bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all group",
                                                    draggedTask === task.id ? "opacity-40 border-indigo-500/50 scale-95" : "shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <p className="text-sm font-medium text-zinc-200 leading-snug group-hover:text-white transition-colors">
                                                        {task.title}
                                                    </p>
                                                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 text-zinc-500 hover:bg-white/5">
                                                        <MoreHorizontal className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {task.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 font-medium text-[10px] px-1.5 py-0 border-white/5 rounded">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between mt-auto pt-1">
                                                    <div className="flex items-center gap-2.5 text-zinc-500">
                                                        <span className="text-[11px] font-semibold tracking-wider hover:text-indigo-400 transition-colors cursor-pointer">
                                                            {task.id}
                                                        </span>

                                                        {(task.comments > 0 || task.attachments > 0) && (
                                                            <div className="flex gap-2 items-center">
                                                                {task.comments > 0 && (
                                                                    <div className="flex items-center text-[10px] gap-0.5">
                                                                        <MessageSquare className="w-3 h-3" /> {task.comments}
                                                                    </div>
                                                                )}
                                                                {task.attachments > 0 && (
                                                                    <div className="flex items-center text-[10px] gap-0.5">
                                                                        <Paperclip className="w-3 h-3" /> {task.attachments}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {task.dueDate && (
                                                            <div className={cn("flex items-center text-[10px] gap-1", task.dueDate === "Today" ? "text-rose-400" : "text-amber-400/80")}>
                                                                <Calendar className="w-3 h-3" /> {task.dueDate}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {PRIORITY_ICONS[task.priority]}

                                                        {task.assignee ? (
                                                            <Avatar className="w-5 h-5 border border-zinc-700">
                                                                {task.assignee.avatar ? (
                                                                    <AvatarImage src={task.assignee.avatar} />
                                                                ) : null}
                                                                <AvatarFallback className="bg-indigo-900 text-indigo-200 text-[9px] uppercase">
                                                                    {task.assignee.name.substring(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border border-dashed border-zinc-600 flex items-center justify-center bg-zinc-800/20">
                                                                <Plus className="w-3 h-3 text-zinc-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Drop zone visual hint when empty */}
                                    {columnTasks.length === 0 && (
                                        <div className="h-24 rounded-lg border border-dashed border-zinc-800/60 bg-zinc-900/10 flex items-center justify-center">
                                            <span className="text-xs text-zinc-600 font-medium tracking-wide">Drop issues here</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
