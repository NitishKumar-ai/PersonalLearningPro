import { useState, useRef, useEffect } from "react";
import { X, Send, Book, FileText, ChevronDown } from "lucide-react";
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
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Hi! I'm your AI Tutor for ${subjectName}. How can I help you today?`,
        }
    ]);
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
        if (!input.trim() || isTyping) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Mock API call to RAG backend
        setTimeout(() => {
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `I found some information about that in your previous notes. Here is a simulated response based on our RAG implementation.`,
                sources: [
                    { id: "src1", title: "Rotational Motion.pdf", type: "notes" },
                    { id: "src2", title: "Quiz-RESULTS-5", type: "quiz" }
                ]
            };
            setMessages(prev => [...prev, assistantMsg]);
            setIsTyping(false);
        }, 1500);
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
                    "fixed inset-0 bg-[#0f1720]/60 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={cn(
                    "fixed inset-x-0 bottom-0 md:inset-x-auto md:right-4 md:bottom-4 md:top-auto z-50 w-full md:w-[440px] h-[80vh] md:h-[600px] bg-[#192026] border border-white/10 md:rounded-[16px] rounded-t-[20px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col transform transition-transform duration-300 ease-out",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1f2a31] flex items-center justify-center border border-white/5">
                            <span className="text-sm">✨</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#e6eef6]">Tutor • {subjectName}</h3>
                            <p className="text-[11px] text-[#3ad29f] font-medium flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ad29f] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ad29f]"></span>
                                </span>
                                Online (Context Aware)
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-[#9aa7b2] hover:text-white hover:bg-white/5 rounded-full">
                        <ChevronDown className="w-5 h-5 md:hidden" />
                        <X className="w-5 h-5 hidden md:block" />
                    </Button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col gap-1 w-full")}>
                            {msg.role === "user" ? (
                                <div className="ml-auto w-fit max-w-[85%] bg-[#1f2a31] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[15px] text-[#e6eef6] whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="mr-auto w-full max-w-[90%] flex flex-col gap-3">
                                    <div className="prose prose-invert prose-p:leading-relaxed prose-sm max-w-none text-[#9aa7b2]">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>

                                    {/* Citations Pill */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {msg.sources.map(src => (
                                                <div key={src.id} className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-[#1f2a31] border border-white/5 group cursor-help transition-colors hover:bg-white/10">
                                                    {src.type === 'notes' ? (
                                                        <FileText className="w-3 h-3 text-[#4f8cff]" />
                                                    ) : (
                                                        <Book className="w-3 h-3 text-[#ffb86b]" />
                                                    )}
                                                    <span className="text-[11px] font-medium text-[#9aa7b2] group-hover:text-[#e6eef6]">
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
                        <div className="flex gap-1 items-center px-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4f8cff] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4f8cff] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4f8cff] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-[#192026] border-t border-white/10 shrink-0">
                    <div className="relative flex items-end bg-[#1f2a31] rounded-[16px] border border-transparent focus-within:border-[#4f8cff]/50 focus-within:ring-1 focus-within:ring-[#4f8cff]/50 transition-all">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything..."
                            className="min-h-[44px] max-h-[120px] w-full resize-none border-0 bg-transparent py-3 pl-4 pr-12 text-[15px] text-[#e6eef6] placeholder:text-[#9aa7b2] focus-visible:ring-0 shadow-none leading-relaxed"
                            rows={1}
                        />
                        <div className="absolute right-2 bottom-2">
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                size="icon"
                                className={cn(
                                    "w-8 h-8 rounded-[10px] transition-all",
                                    input.trim() && !isTyping
                                        ? "bg-[#4f8cff] text-white hover:bg-[#4f8cff]/90"
                                        : "bg-white/5 text-white/30"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-[#9aa7b2]/60">AI can make mistakes. Consider verifying important information.</span>
                    </div>
                </div>
            </div>
        </>
    );
}
