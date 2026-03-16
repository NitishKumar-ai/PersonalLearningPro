import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, HelpCircle, AlertCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AchieversBookPanelProps {
    summary: string;
    pyqs: any[];
    isOpen: boolean;
    onChange?: (isOpen: boolean) => void;
}

export function AchieversBookPanel({ summary, pyqs, isOpen, onChange }: AchieversBookPanelProps) {
    return (
        <div className={cn(
            "fixed md:relative top-16 md:top-0 right-0 h-[calc(100vh-64px)] bg-background border-l border-border overflow-y-auto shadow-inner transition-all duration-500 ease-in-out w-full max-w-sm z-[60] flex flex-col",
            isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none md:hidden"
        )}>
            <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <h3 className="font-display text-xl text-foreground tracking-tight">Digital Textbook</h3>
                </div>
                {onChange && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onChange(false)}
                        className="h-8 w-8 md:hidden rounded-full text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="p-6 flex-1">
                <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 rounded-xl">
                        <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-accent transition-all">Summary</TabsTrigger>
                        <TabsTrigger value="pyqs" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-accent transition-all">PYQs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-6">
                        <div className="prose prose-stone prose-sm max-w-none text-muted-foreground font-body leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {summary || "*No summary available for this chapter.*"}
                            </ReactMarkdown>
                        </div>
                        {summary && (
                            <div className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl shadow-soft mt-8">
                                <AlertCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                                    <span className="font-bold text-foreground">Study Tip:</span> Focus on the key formulas marked above. They frequently appear in numerical problems in the board exams.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="pyqs" className="space-y-6">
                        {pyqs.length === 0 ? (
                            <div className="text-center py-16 px-6">
                                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground text-sm font-body">No Previous Year Questions available for this chapter.</p>
                            </div>
                        ) : (
                            pyqs.map((pyq, index) => (
                                <div key={index} className="border border-border rounded-2xl p-5 bg-card shadow-soft hover:shadow-card transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{pyq.year}</span>
                                        <span className="bg-accent-soft text-accent text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-accent/10">{pyq.board}</span>
                                    </div>
                                    <p className="text-sm text-foreground font-display font-medium mb-4 leading-snug group-hover:text-accent transition-colors">
                                        {pyq.question}
                                    </p>
                                    <div className="bg-muted p-4 rounded-xl border border-border text-sm text-muted-foreground font-body leading-relaxed">
                                        <span className="text-[10px] font-extrabold text-foreground uppercase tracking-widest block mb-2 opacity-60">Verified Solution</span>
                                        {pyq.answer}
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
