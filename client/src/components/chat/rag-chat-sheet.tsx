import { useState, useRef, useEffect } from "react";
import { X, Send, Book, FileText, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface SourceSnippet {
    id: string;
    title: string;
    type?: "quiz" | "notes" | "chat_history";
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: SourceSnippet[];
}

interface RagChatSheetProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    initialPrompt?: string;
}

export function RagChatSheet({
    isOpen,
    onClose,
    subjectName,
    initialPrompt,
}: RagChatSheetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Set initial prompt if provided when opening
    useEffect(() => {
        if (isOpen && initialPrompt) {
            setInput(initialPrompt);
        }
    }, [isOpen, initialPrompt]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        const messageText = input.trim();
        if (!messageText || isTyping) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: messageText };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) 
                }),
            });

            if (!response.ok) throw new Error("Failed to get AI response");
            
            const data = await response.json();
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.content,
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error("AI chat error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-ink-900/10 backdrop-blur-[2px] z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={cn(
                    "fixed inset-x-0 bottom-0 md:inset-x-auto md:right-8 md:bottom-8 md:top-auto z-50 w-full md:w-[480px] h-[85vh] md:h-[680px] bg-card border border-border md:rounded-2xl rounded-t-3xl shadow-card flex flex-col transform transition-all duration-500 ease-out animate-fade-in-up",
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0 bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center border border-accent/10 shadow-soft">
                            <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-sm font-display text-foreground">EduAI Tutor • {subjectName}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest px-1">Active Learning Mode</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                        <ChevronDown className="w-5 h-5 md:hidden" />
                        <X className="w-5 h-5 hidden md:block" />
                    </Button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-muted/10">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col gap-2 w-full")}>
                            {msg.role === "user" ? (
                                <div className="ml-auto w-fit max-w-[85%] bg-accent-soft border border-accent/10 rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm text-foreground font-body leading-relaxed shadow-soft">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="mr-auto w-full max-w-[95%] flex flex-col gap-4">
                                    <div className="prose prose-stone prose-sm max-w-none text-muted-foreground font-body leading-relaxed md:text-base">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>

                                    {/* Citations Pill */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border border-dashed">
                                            {msg.sources.map(src => (
                                                <div key={src.id} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted border border-border group cursor-pointer transition-all hover:bg-muted/80 hover:shadow-soft">
                                                    {src.type === 'notes' ? (
                                                        <FileText className="w-3 h-3 text-accent" />
                                                    ) : (
                                                        <Book className="w-3 h-3 text-amber-600" />
                                                    )}
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">
                                                        {src.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-1.5 items-center px-2 py-2">
                            <span className="w-2 h-2 rounded-full bg-accent opacity-20 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-accent opacity-40 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-accent opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-5 bg-card border-t border-border shrink-0">
                    <div className="relative flex items-end bg-muted rounded-2xl border border-border focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/5 transition-all shadow-inner">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything about your subjects..."
                            className="min-h-[56px] max-h-[160px] w-full resize-none border-0 bg-transparent py-4 pl-5 pr-14 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none leading-relaxed font-body"
                            rows={1}
                        />
                        <div className="absolute right-3 bottom-3">
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                size="icon"
                                className={cn(
                                    "w-10 h-10 rounded-xl transition-all shadow-soft",
                                    input.trim() && !isTyping
                                        ? "bg-accent text-white hover:bg-accent/90"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-3 opacity-40">
                        <Sparkles className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">AI generated insights for faster learning</span>
                    </div>
                </div>
            </div>
        </>
    );
}
