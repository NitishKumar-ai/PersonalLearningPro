import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, HelpCircle, AlertCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

interface AchieversBookPanelProps {
    summary: string;
    pyqs: any[];
    isOpen: boolean;
    onChange?: (isOpen: boolean) => void;
}

export function AchieversBookPanel({ summary, pyqs, isOpen, onChange }: AchieversBookPanelProps) {
    if (!isOpen) return null;

    return (
        <div className="h-[calc(100vh-64px)] bg-card border-l overflow-y-auto shadow-inner transition-transform duration-300 ease-in-out w-full max-w-sm absolute right-0 top-16 md:relative md:top-0 shadow-xl md:shadow-none z-[60] flex flex-col">
            <div className="p-4 border-b bg-muted/20 sticky top-0 z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg tracking-tight">Achievers Book</h3>
                </div>
                {onChange && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onChange(false)}
                        className="h-8 w-8 md:hidden rounded-full"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="p-4 flex-1">
                <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="pyqs">PYQs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                        <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {summary || "*No summary available for this chapter.*"}
                            </ReactMarkdown>
                        </div>
                        {summary && (
                            <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg mt-6 border border-primary/20">
                                <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Focus on the key formulas marked above. They frequently appear in numerical problems.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="pyqs" className="space-y-6">
                        {pyqs.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <HelpCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">No Previous Year Questions available for this chapter.</p>
                            </div>
                        ) : (
                            pyqs.map((pyq, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <span>{pyq.year}</span>
                                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">{pyq.board}</span>
                                    </div>
                                    <p className="text-sm text-foreground font-medium mb-3 leading-relaxed">
                                        {pyq.question}
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed bg-background p-3 rounded border">
                                        <span className="font-semibold text-foreground/80 block mb-1">Answer:</span>
                                        {pyq.answer}
                                    </p>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
