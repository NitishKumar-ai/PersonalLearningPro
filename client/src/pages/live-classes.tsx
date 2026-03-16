import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { insertLiveClassSchema, type LiveClass } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Video, Calendar, Users, ExternalLink, Loader2, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function LiveClassesPage() {
    const { currentUser: { profile } } = useFirebaseAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isTeacher = profile?.role === "teacher" || profile?.role === "admin";
    const schoolCode = profile?.school_code || "default";
    const className = profile?.classId || "all";

    const { data: upcomingClasses, isLoading } = useQuery<LiveClass[]>({
        queryKey: [`/api/live/upcoming/${schoolCode}/${className}`],
    });

    const { data: recordings } = useQuery<LiveClass[]>({
        queryKey: [`/api/live/recordings/${schoolCode}/${className}`],
    });

    const form = useForm({
        resolver: zodResolver(insertLiveClassSchema),
        defaultValues: {
            title: "",
            description: "",
            class: profile?.classId || "",
            scheduledTime: new Date().toISOString().slice(0, 16),
            durationMinutes: 60,
            status: "scheduled",
        },
    });

    const createClassMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = { ...data, scheduledTime: new Date(data.scheduledTime).toISOString() };
            const res = await apiRequest("POST", "/api/live/schedule", payload);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/live/upcoming/${schoolCode}/${className}`] });
            queryClient.invalidateQueries({ queryKey: [`/api/live/recordings/${schoolCode}/${className}`] });
            setIsDialogOpen(false);
            form.reset();
            toast({ title: "Success", description: "Live class scheduled successfully." });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message || "Failed to schedule live class", variant: "destructive" });
        }
    });

    const handleJoin = (id: number) => {
        setLocation(`/live/${id}`);
    };

    const onSubmit = (data: any) => {
        createClassMutation.mutate(data);
    };

    const liveNow = upcomingClasses?.filter(c => c.status === "live") || [];
    const scheduled = upcomingClasses?.filter(c => c.status === "scheduled") || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
                    <p className="text-muted-foreground mt-2">
                        {isTeacher ? "Manage and start your live classes." : "Join your scheduled live classes."}
                    </p>
                </div>

                {isTeacher && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Schedule Class
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Schedule Live Class</DialogTitle>
                                <DialogDescription>
                                    Set up a new Daily.co live class for your students.
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Class Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Advanced Mathematics Chapter 5" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Topic summary or instructions..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="class"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Class Section</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 10-A" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="durationMinutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Duration (minutes)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={10} max={180} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="scheduledTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter className="pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={createClassMutation.isPending}>
                                            {createClassMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Schedule
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="upcoming">
                        Upcoming & Live
                        {(liveNow.length > 0) && (
                            <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="recordings">Past Recordings</TabsTrigger>
                </TabsList>

                {/* ── Upcoming / Live tab ── */}
                <TabsContent value="upcoming">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingClasses?.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <Video className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                <p>No live classes scheduled.</p>
                                {isTeacher && <p className="text-sm mt-1">Use the button above to schedule one.</p>}
                            </div>
                        ) : (
                            upcomingClasses?.map((cls) => (
                                <ClassCard key={cls.id} cls={cls} isTeacher={isTeacher} onJoin={handleJoin} />
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* ── Recordings tab ── */}
                <TabsContent value="recordings">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {!recordings || recordings.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <PlayCircle className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                <p>No recordings yet.</p>
                                <p className="text-sm mt-1">Completed classes with recordings will appear here.</p>
                            </div>
                        ) : (
                            recordings.map((cls) => (
                                <RecordingCard key={cls.id} cls={cls} />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ClassCard({ cls, isTeacher, onJoin }: { cls: LiveClass; isTeacher: boolean; onJoin: (id: number) => void }) {
    return (
        <Card className={`flex flex-col transition-shadow ${cls.status === 'live' ? 'border-red-500/50 shadow-lg shadow-red-500/10' : ''
            }`}>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2 text-base">{cls.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                            <Users className="h-3 w-3 mr-1" /> Class: {cls.class}
                        </CardDescription>
                    </div>
                    {cls.status === "live" && (
                        <span className="flex items-center shrink-0 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold rounded-full animate-pulse">
                            <span className="h-2 w-2 bg-red-500 rounded-full mr-1.5" /> LIVE
                        </span>
                    )}
                    {cls.status === "scheduled" && (
                        <span className="shrink-0 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            Scheduled
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                {cls.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cls.description}</p>
                )}
                <div className="flex items-center text-sm text-primary/80 bg-primary/5 p-2 rounded-md">
                    <Calendar className="mr-2 h-4 w-4 shrink-0" />
                    {format(new Date(cls.scheduledTime), "MMM d, yyyy 'at' h:mm a")}
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t">
                {isTeacher ? (
                    <div className="flex gap-2 w-full">
                        {cls.status === "scheduled" && (
                            <Button onClick={() => onJoin(cls.id)} className="w-full">
                                <Video className="mr-2 h-4 w-4" /> Start Class
                            </Button>
                        )}
                        {cls.status === "live" && (
                            <Button onClick={() => onJoin(cls.id)} className="w-full bg-red-600 hover:bg-red-700">
                                <ExternalLink className="mr-2 h-4 w-4" /> Rejoin Class
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        {cls.status === "live" ? (
                            <Button onClick={() => onJoin(cls.id)} className="w-full bg-red-600 hover:bg-red-700 text-white">
                                <ExternalLink className="mr-2 h-4 w-4" /> Join Now
                            </Button>
                        ) : (
                            <Button variant="secondary" className="w-full" disabled>
                                Waiting for teacher...
                            </Button>
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

function RecordingCard({ cls }: { cls: LiveClass }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2 text-base">{cls.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                            <Users className="h-3 w-3 mr-1" /> Class: {cls.class}
                        </CardDescription>
                    </div>
                    <span className="shrink-0 px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        Recorded
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                {cls.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cls.description}</p>
                )}
                <div className="flex items-center text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <Calendar className="mr-2 h-4 w-4 shrink-0" />
                    {format(new Date(cls.scheduledTime), "MMM d, yyyy 'at' h:mm a")}
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(cls.recordingUrl!, '_blank')}
                    disabled={!cls.recordingUrl}
                >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {cls.recordingUrl ? "Watch Recording" : "Recording Processing..."}
                </Button>
            </CardFooter>
        </Card>
    );
}
