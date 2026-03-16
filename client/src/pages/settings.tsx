import { useState } from "react";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useTheme } from "@/contexts/theme-context";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Save, LogOut } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
    const { currentUser, logout } = useFirebaseAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        name: (currentUser.profile as any)?.name || currentUser.user?.displayName || "EduAI User",
        email: currentUser.user?.email || "",
    });

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Settings saved",
                description: "Your preferences have been successfully updated.",
            });
        }, 800);
    };

    const initials = profileData.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const roleLabels: Record<string, string> = {
        student: "Student",
        teacher: "Teacher",
        principal: "Principal",
        school_admin: "School Admin",
        admin: "Administrator",
        parent: "Parent"
    };

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-display font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and set e-mail preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full flex flex-col md:flex-row gap-8">
                <TabsList className="md:w-64 flex flex-row md:flex-col h-auto justify-start bg-transparent p-0 gap-2 md:sticky md:top-24">
                    <TabsTrigger
                        value="profile"
                        className="w-full justify-start gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-brand-900/40 dark:data-[state=active]:text-brand-100 transition-all text-muted-foreground hover:bg-muted/50"
                    >
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="appearance"
                        className="w-full justify-start gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-brand-900/40 dark:data-[state=active]:text-brand-100 transition-all text-muted-foreground hover:bg-muted/50"
                    >
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger
                        value="notifications"
                        className="w-full justify-start gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-brand-900/40 dark:data-[state=active]:text-brand-100 transition-all text-muted-foreground hover:bg-muted/50"
                    >
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="w-full justify-start gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-brand-900/40 dark:data-[state=active]:text-brand-100 transition-all text-muted-foreground hover:bg-muted/50"
                    >
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 w-full min-h-[500px]">
                    {/* Profile Tab */}
                    <TabsContent value="profile" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6">
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/20 pb-4 border-b border-border/50">
                                <CardTitle className="text-xl">Profile Information</CardTitle>
                                <CardDescription>
                                    Update your account details and public profile.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24 border-2 border-border/50">
                                        <AvatarImage src={currentUser.user?.photoURL || undefined} alt={profileData.name} />
                                        <AvatarFallback className="text-2xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h3 className="font-medium">Profile Picture</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            JPG, GIF or PNG. 1MB max.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="rounded-full">Change avatar</Button>
                                            <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:bg-destructive/10">Remove</Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="rounded-xl border-border/60 focus-visible:ring-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email} disabled
                                            className="rounded-xl bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Email changes require re-authentication.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Account Type</Label>
                                        <Input
                                            id="role"
                                            value={roleLabels[currentUser.profile?.role || "student"]} disabled
                                            className="rounded-xl bg-muted/50 border-border/50 capitalize text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>
                                    {currentUser.profile?.role === "student" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="grade">Grade/Class</Label>
                                            <Input
                                                id="grade"
                                                value={currentUser.profile?.classId || "N/A"} disabled
                                                className="rounded-xl bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t border-border/50 flex justify-end py-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="rounded-full bg-brand-500 hover:bg-brand-600 text-white min-w-[120px]"
                                >
                                    {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/20 pb-4 border-b border-border/50">
                                <CardTitle className="text-xl">Appearance Settings</CardTitle>
                                <CardDescription>
                                    Customize how EduAI looks on your device.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Theme Preference</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Light Theme Option */}
                                        <div
                                            className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all ${theme === 'light' ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-900/10' : 'border-border/40'}`}
                                            onClick={() => setTheme("light")}
                                        >
                                            <div className="w-full items-center rounded-lg bg-[#ebf4f8] p-2 dark:bg-[#ebf4f8]">
                                                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="space-y-2 rounded-md bg-[#ebf4f8] p-2">
                                                        <div className="h-2 w-[80px] rounded-lg bg-[#ebf4f8]"></div>
                                                        <div className="h-2 w-[100px] rounded-lg bg-[#ebf4f8]"></div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 rounded-md bg-[#ebf4f8] p-2">
                                                        <div className="h-4 w-4 rounded-full bg-[#ebf4f8]"></div>
                                                        <div className="h-2 w-[100px] rounded-lg bg-[#ebf4f8]"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">Light</span>
                                            {theme === 'light' && (
                                                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Dark Theme Option */}
                                        <div
                                            className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all ${theme === 'dark' ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-900/10' : 'border-border/40'}`}
                                            onClick={() => setTheme("dark")}
                                        >
                                            <div className="w-full items-center rounded-lg bg-slate-950 p-2">
                                                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="space-y-2 rounded-md bg-slate-950 p-2">
                                                        <div className="h-2 w-[80px] rounded-lg bg-slate-800"></div>
                                                        <div className="h-2 w-[100px] rounded-lg bg-slate-800"></div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 rounded-md bg-slate-950 p-2">
                                                        <div className="h-4 w-4 rounded-full bg-slate-800"></div>
                                                        <div className="h-2 w-[100px] rounded-lg bg-slate-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">Dark</span>
                                            {theme === 'dark' && (
                                                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* System Theme Option */}
                                        <div
                                            className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all ${theme === 'system' ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-900/10' : 'border-border/40'}`}
                                            onClick={() => setTheme("system")}
                                        >
                                            <div className="w-full flex pl-2 pt-2 items-center rounded-lg bg-gradient-to-br from-[#ebf4f8] to-slate-950 overflow-hidden">
                                                <div className="space-y-2 rounded-tl-md bg-white dark:bg-slate-800 p-2 shadow-sm shrink-0 w-[140%]">
                                                    <div className="space-y-2 rounded-md bg-[#ebf4f8] dark:bg-slate-950 p-2">
                                                        <div className="h-2 w-[80px] rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                                                        <div className="h-2 w-[100px] rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 rounded-md bg-[#ebf4f8] dark:bg-slate-950 p-2">
                                                        <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                                        <div className="h-2 w-[100px] rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">System</span>
                                            {theme === 'system' && (
                                                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Display Density</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Compact Mode</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Show more content on screen by reducing padding and margins.
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/20 pb-4 border-b border-border/50">
                                <CardTitle className="text-xl">Notification Preferences</CardTitle>
                                <CardDescription>
                                    Choose what you want to be notified about.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400">Email Notifications</h3>

                                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Weekly Progress Report</Label>
                                            <p className="text-sm text-muted-foreground">Receive a summary of your learning activity.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Assignment Reminders</Label>
                                            <p className="text-sm text-muted-foreground">Get reminded when tasks are due soon.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">New Feature Announcements</Label>
                                            <p className="text-sm text-muted-foreground">Stay updated on new platform features.</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400">In-App Notifications</h3>

                                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Direct Messages</Label>
                                            <p className="text-sm text-muted-foreground">When teachers or peers message you.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Achievement Unlocks</Label>
                                            <p className="text-sm text-muted-foreground">When you earn a new badge or milestone.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t border-border/50 flex justify-end py-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="rounded-full bg-brand-500 hover:bg-brand-600 text-white min-w-[120px]"
                                >
                                    {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Preferences</>}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        <Card className="border-border/50 shadow-sm overflow-hidden border-destructive/20">
                            <CardHeader className="bg-muted/20 pb-4 border-b border-border/50">
                                <CardTitle className="text-xl">Security & Access</CardTitle>
                                <CardDescription>
                                    Manage your password and active sessions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Change Password</h3>
                                    <p className="text-sm text-muted-foreground">
                                        If you signed up with Google, changing password may not be applicable.
                                    </p>
                                    <Button variant="outline" className="rounded-full">Request Password Reset</Button>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                                    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-destructive/5 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium text-destructive">Sign Out</Label>
                                            <p className="text-sm text-foreground/80">Sign out of your account on this device.</p>
                                        </div>
                                        <Button variant="destructive" className="rounded-full gap-2" onClick={logout}>
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
